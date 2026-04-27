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

export default {
  async fetch(request, env) {
    // Preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: CORS });
    }

    try {
      const formData = await request.formData();

      // ---- Date autor ----
      const nume        = formData.get('nume')        || '—';
      const email       = formData.get('email')       || '—';
      const institutie  = formData.get('institutie')  || '—';
      const functie     = formData.get('functie')     || '—';
      const localitate  = formData.get('localitate')  || '—';
      const judet       = formData.get('judet')       || '—';
      const telefon     = formData.get('telefon')     || '—';
      const sectiune    = formData.get('sectiune')    || '—';
      const tip_material = formData.get('tip_material') || '—';
      const nr_articole = formData.get('nr_articole') || '—';
      const optiune_plata = formData.get('optiune_plata') || '—';

      // ---- Upload fișiere în R2 ----
      const fisiere = formData.getAll('fisiere');
      if (!fisiere || fisiere.length === 0) {
        return new Response(JSON.stringify({ success: false, error: 'Niciun fișier primit.' }), {
          status: 400, headers: { ...CORS, 'Content-Type': 'application/json' }
        });
      }

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
          customMetadata: {
            autor: nume,
            email: email,
            originalName: file.name,
          },
        });

        linkuri.push(`https://cdn.dokimasia.ro/${key}`);
      }

      // ---- Trimite email via EmailJS REST API ----
      const linkuriText = linkuri.map((l, i) => `Articol ${i + 1}: ${l}`).join('\n');

      const emailPayload = {
        service_id:  env.EJS_SERVICE_ID,
        template_id: env.EJS_TEMPLATE_ID,
        user_id:     env.EJS_PUBLIC_KEY,
        accessToken: env.EJS_PRIVATE_KEY,
        template_params: {
          nume,
          email,
          institutie,
          functie,
          localitate,
          judet,
          telefon,
          sectiune,
          tip_material,
          nr_articole,
          optiune_plata,
          fisiere:  linkuriText,
          message:  `Articol nou primit – ${nume}\nSecțiune: ${sectiune}\nTip: ${tip_material}\nNr. articole: ${nr_articole}\nPlată: ${optiune_plata}\n\nFișiere:\n${linkuriText}`,
          title:    `Articol nou Dokimasia – ${nume}`,
        }
      };

      const ejsResp = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload),
      });

      if (!ejsResp.ok) {
        const errText = await ejsResp.text();
        console.error('EmailJS error:', errText);
        // Fișierele s-au urcat OK, dar emailul a eșuat — returnăm success oricum
        return new Response(JSON.stringify({
          success: true,
          warning: 'Fișierele au fost salvate dar emailul nu s-a trimis: ' + errText,
          linkuri,
        }), { headers: { ...CORS, 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ success: true, linkuri }), {
        headers: { ...CORS, 'Content-Type': 'application/json' }
      });

    } catch (err) {
      console.error('Worker error:', err);
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500, headers: { ...CORS, 'Content-Type': 'application/json' }
      });
    }
  }
};
