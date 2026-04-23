/**
 * Cloudflare Worker — Revista Dokimasia
 * Primește articolele de la autori, le stochează în R2
 * și trimite email de notificare via Resend.
 *
 * Variabile de mediu necesare (configurate în Cloudflare Dashboard > Worker > Settings > Variables):
 *   RESEND_API_KEY   — cheia API de la resend.com
 *   EMAIL_TO         — adresa redacției (ex: redactie@dokimasia.ro)
 *   EMAIL_FROM       — adresa expeditor verificată în Resend (ex: noreply@dokimasia.ro)
 *   R2_BUCKET        — binding-ul R2 (configurat în wrangler.toml, nu ca env var)
 */

function getCorsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allowed = ['https://dokimasia.ro', 'https://www.dokimasia.ro'];
  const allowedOrigin = allowed.includes(origin) ? origin : '*';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

export default {
  async fetch(request, env) {
    // Preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: getCorsHeaders(request) });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const url = new URL(request.url);

    // Endpoint Stripe PaymentIntent
    if (url.pathname === '/stripe-intent') {
      try {
        const body = await request.json();
        const suma = Math.round(body.suma * 100); // Stripe folosește bani (subdiviziuni)
        const label = body.label || 'Contributie editoriale';

        const stripeResp = await fetch('https://api.stripe.com/v1/payment_intents', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(env.STRIPE_SECRET_KEY + ':')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            amount: suma,
            currency: 'ron',
            description: label,
            'automatic_payment_methods[enabled]': 'true',
          }).toString()
        });

        const intent = await stripeResp.json();

        if (intent.error) {
          return new Response(JSON.stringify({ error: intent.error.message }), {
            status: 400,
            headers: { ...getCorsHeaders(request), 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ clientSecret: intent.client_secret }), {
          headers: { ...getCorsHeaders(request), 'Content-Type': 'application/json' }
        });
      } catch(err) {
        return new Response(JSON.stringify({ error: 'Eroare Stripe: ' + err.message }), {
          status: 500,
          headers: { ...getCorsHeaders(request), 'Content-Type': 'application/json' }
        });
      }
    }

    try {
      const formData = await request.formData();

      // --- Date autor ---
      const autor = {
        nume:        formData.get('nume')        || '',
        institutie:  formData.get('institutie')  || '',
        functie:     formData.get('functie')     || '',
        localitate:  formData.get('localitate')  || '',
        judet:       formData.get('judet')       || '',
        telefon:     formData.get('telefon')     || '',
        email:       formData.get('email')       || '',
        sectiune:    formData.get('sectiune')    || '',
        tip_material:formData.get('tip_material')|| '',
        exemplar:    formData.get('exemplar')    || 'Nu',
        gdpr:        formData.get('gdpr')        || '',
      };

      // Validare minimă
      if (!autor.nume || !autor.email) {
        return new Response(
          JSON.stringify({ success: false, error: 'Câmpurile obligatorii lipsesc.' }),
          { status: 400, headers: { ...getCorsHeaders(request), 'Content-Type': 'application/json' } }
        );
      }

      // --- Fișiere ---
      const fisiere = formData.getAll('fisiere');
      if (!fisiere || fisiere.length === 0) {
        return new Response(
          JSON.stringify({ success: false, error: 'Niciun fișier atașat.' }),
          { status: 400, headers: { ...getCorsHeaders(request), 'Content-Type': 'application/json' } }
        );
      }

      // Timestamp pentru organizare în R2
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const folderName = `articole/${timestamp}_${slugify(autor.nume)}`;

      // Încarcă fiecare fișier în R2
      const listaFisiere = [];
      for (const fisier of fisiere) {
        if (!fisier || typeof fisier === 'string') continue;

        const key = `${folderName}/${fisier.name}`;
        const buffer = await fisier.arrayBuffer();

        await env.R2_BUCKET.put(key, buffer, {
          httpMetadata: { contentType: fisier.type || 'application/octet-stream' },
          customMetadata: {
            autor: autor.nume,
            email: autor.email,
            uploadedAt: new Date().toISOString(),
          },
        });

        listaFisiere.push({
          nume: fisier.name,
          marime: formatBytes(fisier.size),
          key,
          url: `https://cdn.dokimasia.ro/${key}`,
        });
      }

      // --- Trimite email via Resend ---
      const emailHtml = buildEmailHtml(autor, listaFisiere, folderName);

      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: env.EMAIL_FROM,
          to: [env.EMAIL_TO],
          reply_to: autor.email,
          subject: `[Articol nou] ${autor.nume} — ${new Date().toLocaleDateString('ro-RO')}`,
          html: emailHtml,
        }),
      });

      if (!resendResponse.ok) {
        const err = await resendResponse.text();
        console.error('Resend error:', err);
        // Fișierele sunt deja în R2, dar emailul a eșuat — returnăm succes parțial
        return new Response(
          JSON.stringify({ success: true, warning: 'Fișierele au fost primite, dar emailul de notificare nu a putut fi trimis.' }),
          { headers: { ...getCorsHeaders(request), 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...getCorsHeaders(request), 'Content-Type': 'application/json' } }
      );

    } catch (err) {
      console.error('Worker error:', err);
      return new Response(
        JSON.stringify({ success: false, error: 'Eroare internă. Vă rugăm încercați din nou.' }),
        { status: 500, headers: { ...getCorsHeaders(request), 'Content-Type': 'application/json' } }
      );
    }
  },
};

// --- Helpers ---

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function buildEmailHtml(autor, fisiere, folderKey) {
  const fisList = fisiere.map(f =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;">
        <a href="${f.url}" style="color:#8B0000;font-weight:600;">📄 ${f.nume}</a>
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;">${f.marime}</td>
    </tr>`
  ).join('');

  return `
<!DOCTYPE html>
<html lang="ro">
<head><meta charset="UTF-8"></head>
<body style="font-family:Georgia,serif;background:#f5f5f5;margin:0;padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #ddd;border-radius:4px;overflow:hidden;">

    <div style="background:#8B0000;padding:24px 32px;">
      <h1 style="color:#fff;margin:0;font-size:1.3rem;font-weight:700;">Revista Dokimasia</h1>
      <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:0.9rem;">Articol nou primit spre evaluare</p>
    </div>

    <div style="padding:28px 32px;">
      <h2 style="color:#8B0000;font-size:1.1rem;margin:0 0 20px;border-bottom:2px solid #f0ece4;padding-bottom:12px;">Date autor</h2>

      <table style="width:100%;border-collapse:collapse;font-size:0.92rem;">
        <tr><td style="padding:7px 0;color:#666;width:160px;">Nume și prenume</td><td style="padding:7px 0;font-weight:600;">${autor.nume}</td></tr>
        <tr><td style="padding:7px 0;color:#666;">Instituție</td><td style="padding:7px 0;">${autor.institutie}</td></tr>
        <tr><td style="padding:7px 0;color:#666;">Funcție</td><td style="padding:7px 0;">${autor.functie}</td></tr>
        <tr><td style="padding:7px 0;color:#666;">Localitate / Județ</td><td style="padding:7px 0;">${autor.localitate}${autor.judet ? ', ' + autor.judet : ''}</td></tr>
        <tr><td style="padding:7px 0;color:#666;">Email</td><td style="padding:7px 0;"><a href="mailto:${autor.email}" style="color:#8B0000;">${autor.email}</a></td></tr>
        <tr><td style="padding:7px 0;color:#666;">Telefon</td><td style="padding:7px 0;">${autor.telefon}</td></tr>
        <tr><td style="padding:7px 0;color:#666;">Secțiunea tematică</td><td style="padding:7px 0;">${autor.sectiune}</td></tr>
        <tr><td style="padding:7px 0;color:#666;">Tip material</td><td style="padding:7px 0;">${autor.tip_material}</td></tr>
        <tr><td style="padding:7px 0;color:#666;">Exemplar tipărit</td><td style="padding:7px 0;">${autor.exemplar}</td></tr>
      </table>

      <h2 style="color:#8B0000;font-size:1.1rem;margin:24px 0 16px;border-bottom:2px solid #f0ece4;padding-bottom:12px;">
        Fișiere primite (${fisiere.length})
      </h2>

      <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
        ${fisList}
      </table>

      <div style="background:#f5f0e8;border-left:3px solid #b8963e;padding:12px 16px;margin-top:20px;font-size:0.85rem;color:#555;">
        <strong>Locație R2:</strong> <code>${folderKey}/</code><br>
        Fișierele se găsesc în bucket-ul R2 al contului Cloudflare.
      </div>
    </div>

    <div style="background:#f9f7f4;padding:16px 32px;border-top:1px solid #eee;font-size:0.8rem;color:#999;text-align:center;">
      Asociația Dokimasia · Revista Dokimasia · dokimasia.ro
    </div>
  </div>
</body>
</html>`;
}
