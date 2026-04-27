// ============================================================
// Cloudflare Worker – Dokimasia articole upload
// Bucket R2: site-asociatie  |  Folder: articole/
// Deploy: wrangler deploy
// ============================================================

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ---- Helper: Supabase REST insert ----
async function supabaseInsert(env, table, data) {
  const resp = await fetch(`${env.SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(data),
  });
  const result = await resp.json();
  if (!resp.ok) throw new Error(JSON.stringify(result));
  return Array.isArray(result) ? result[0] : result;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: CORS });
    }

    const url = new URL(request.url);

    // ---- Endpoint Stripe PaymentIntent ----
    if (url.pathname === '/stripe-intent') {
      try {
        const body = await request.json();
        const suma = Math.round(body.suma * 100);
        const label = body.label || 'Contributie editoriale Dokimasia';

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
            status: 400, headers: { ...CORS, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ clientSecret: intent.client_secret }), {
          headers: { ...CORS, 'Content-Type': 'application/json' }
        });
      } catch(err) {
        return new Response(JSON.stringify({ error: 'Eroare Stripe: ' + err.message }), {
          status: 500, headers: { ...CORS, 'Content-Type': 'application/json' }
        });
      }
    }

    // ---- Endpoint principal: upload articole ----
    try {
      const formData = await request.formData();

      const nume          = formData.get('nume')          || '';
      const email         = formData.get('email')         || '';
      const institutie    = formData.get('institutie')    || '';
      const functie       = formData.get('functie')       || '';
      const localitate    = formData.get('localitate')    || '';
      const judet         = formData.get('judet')         || '';
      const telefon       = formData.get('telefon')       || '';
      const sectiune      = formData.get('sectiune')      || '';
      const tip_material  = formData.get('tip_material')  || '';
      const nr_articole   = parseInt(formData.get('nr_articole') || '1');
      const optiune_plata = formData.get('optiune_plata') || 'tarziu';

      const fisiere = formData.getAll('fisiere');
      if (!fisiere || fisiere.length === 0) {
        return new Response(JSON.stringify({ success: false, error: 'Niciun fisier primit.' }), {
          status: 400, headers: { ...CORS, 'Content-Type': 'application/json' }
        });
      }

      // ---- Upload R2 ----
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const slugNume  = nume.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 30);
      const linkuri   = [];

      for (let i = 0; i < fisiere.length; i++) {
        const file = fisiere[i];
        const ext  = file.name.split('.').pop();
        const key  = `articole/${timestamp}_${slugNume}_art${i + 1}.${ext}`;
        const arrayBuffer = await file.arrayBuffer();
        await env.R2_BUCKET.put(key, arrayBuffer, {
          httpMetadata: { contentType: file.type || 'application/octet-stream' },
          customMetadata: { autor: nume, email: email, originalName: file.name },
        });
        linkuri.push(`https://cdn.dokimasia.ro/${key}`);
      }

      // ---- Salvează în Supabase ----
      let supabaseOk = true;
      try {
        for (let i = 0; i < nr_articole; i++) {
          await supabaseInsert(env, 'articole_revista', {
            titlu:         `Articol ${i + 1} – ${nume}`,
            rubrica:       sectiune,
            tip_acces:     'premium',
            status:        'trimis',
            platit:        optiune_plata === 'acum',
            email_autor:   email,
            nume_autor:    nume,
            institutie:    institutie,
            functie:       functie,
            localitate:    localitate,
            judet:         judet,
            telefon:       telefon,
            nr_articole:   nr_articole,
            optiune_plata: optiune_plata,
            fisiere_links: linkuri,
            fisier_url:    linkuri[i] || linkuri[0] || null,
            tip_fisier:    tip_material,
          });
        }
      } catch(e) {
        supabaseOk = false;
        console.error('Supabase error:', e.message);
      }

      // ---- EmailJS ----
      const linkuriText = linkuri.map((l, i) => `Articol ${i + 1}: ${l}`).join('\n');
      const emailPayload = {
        service_id:  env.EJS_SERVICE_ID,
        template_id: env.EJS_TEMPLATE_ID,
        user_id:     env.EJS_PUBLIC_KEY,
        accessToken: env.EJS_PRIVATE_KEY,
        template_params: {
          nume, email, institutie, functie, localitate, judet, telefon,
          sectiune, tip_material,
          nr_articole: String(nr_articole),
          optiune_plata,
          fisiere:  linkuriText,
          message:  `Articol nou - ${nume} | ${sectiune} | ${tip_material} | ${nr_articole} art. | Plata: ${optiune_plata}\n\nFisiere:\n${linkuriText}`,
          title:    `Articol nou Dokimasia - ${nume}`,
        }
      };

      await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload),
      });

      return new Response(JSON.stringify({
        success: true,
        linkuri,
        supabase: supabaseOk ? 'ok' : 'warning',
      }), { headers: { ...CORS, 'Content-Type': 'application/json' } });

    } catch (err) {
      console.error('Worker error:', err);
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500, headers: { ...CORS, 'Content-Type': 'application/json' }
      });
    }
  }
};
