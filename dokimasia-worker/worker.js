var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker.js
var CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

async function supabaseInsert(env, table, data) {
  const resp = await fetch(`${env.SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": env.SUPABASE_SERVICE_KEY,
      "Authorization": `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      "Prefer": "return=representation"
    },
    body: JSON.stringify(data)
  });
  const result = await resp.json();
  if (!resp.ok) throw new Error(JSON.stringify(result));
  return Array.isArray(result) ? result[0] : result;
}
__name(supabaseInsert, "supabaseInsert");

// Extrage text din PDF via URL (fetch + text)
async function extrageTextDinUrl(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("Nu pot descărca fișierul: " + resp.status);
  const contentType = resp.headers.get("content-type") || "";
  const buffer = await resp.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Încearcă extragere text brut (funcționează pentru DOCX/text, parțial pentru PDF)
  let text = "";
  try {
    const decoder = new TextDecoder("utf-8", { fatal: false });
    const raw = decoder.decode(bytes);
    // Extrage text lizibil (filtrează caractere non-printabile)
    text = raw.replace(/[^\x20-\x7E\xA0-\xFF\n\r\t]/g, " ")
              .replace(/\s{3,}/g, "\n")
              .replace(/(.)\1{4,}/g, "") // repetitii de caractere (artefacte PDF)
              .trim();
    // Ia doar portiunile care arata a text real (min 3 cuvinte consecutive)
    const lines = text.split("\n").filter(l => l.trim().split(/\s+/).length >= 3);
    text = lines.join("\n");
  } catch(e) {
    throw new Error("Nu pot extrage text din fișier.");
  }

  if (!text || text.length < 100) {
    throw new Error("Textul extras este prea scurt sau fișierul nu conține text editabil (PDF scanat?).");
  }

  return text.slice(0, 15000); // max ~15k chars pentru Claude
}
__name(extrageTextDinUrl, "extrageTextDinUrl");

async function formateazaCuClaude(text, env) {
  const prompt = `Ești un editor pentru Revista Dokimasia, o revistă educațională română. 
Primești textul unui articol academic și trebuie să îl formatezi conform standardelor revistei.

STANDARDE REVISTA DOKIMASIA:
- Font: Calibri, 12pt
- Format: A4, margini 2,5 cm, spațiere 1,15
- Structura obligatorie:
  1. TITLU (cu majuscule, centrat)
  2. Autor: Nume Prenume
  3. Instituție: [instituția autorului]
  4. Abstract (150-250 cuvinte, în română)
  5. Cuvinte cheie: (5-7 cuvinte)
  6. Corpul articolului (cu secțiuni numerotate dacă există)
  7. Bibliografie (format APA, ordonată alfabetic)

INSTRUCȚIUNI:
- Identifică și păstrează conținutul original
- Corectează diacriticele românești lipsă (ă, â, î, ș, ț)
- Corectează greșeli gramaticale evidente
- Dacă abstractul lipsește, generează unul scurt bazat pe conținut
- Dacă cuvintele cheie lipsesc, propune 5-7
- Standardizează bibliografia în format APA
- Întoarce articolul formatat în HTML cu clase CSS specifice

CLASE CSS DE FOLOSIT:
- <h1 class="art-titlu"> pentru titlu
- <p class="art-autor"> pentru autor
- <p class="art-institutie"> pentru instituție  
- <div class="art-abstract"> pentru abstract
- <p class="art-cuvinte-cheie"> pentru cuvinte cheie
- <h2 class="art-sectiune"> pentru titluri de secțiuni
- <p class="art-corp"> pentru paragrafele corpului
- <div class="art-bibliografie"> pentru bibliografie
- <p class="art-ref"> pentru fiecare referință bibliografică

Întoarce DOAR HTML-ul formatat, fără explicații suplimentare, fără markdown, fără \`\`\`html.

TEXTUL ARTICOLULUI:
${text}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.CLAUDE_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-haiku-20240307",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error("Claude API error: " + (err.error?.message || JSON.stringify(err)));
  }

  const data = await response.json();
  return data.content[0].text;
}
__name(formateazaCuClaude, "formateazaCuClaude");

var worker_default = {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: CORS });
    }

    const url = new URL(request.url);

    // ── ENDPOINT NOU: /formateaza ──────────────────────────────
    if (url.pathname === "/formateaza") {
      try {
        const body = await request.json();
        const fisierUrl = body.fisier_url;
        if (!fisierUrl) {
          return new Response(JSON.stringify({ error: "fisier_url lipsă." }), {
            status: 400, headers: { ...CORS, "Content-Type": "application/json" }
          });
        }

        // 1. Extrage textul din fișier
        const text = await extrageTextDinUrl(fisierUrl);

        // 2. Formatează cu Claude
        const htmlFormatat = await formateazaCuClaude(text, env);

        return new Response(JSON.stringify({ success: true, html: htmlFormatat }), {
          headers: { ...CORS, "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 500, headers: { ...CORS, "Content-Type": "application/json" }
        });
      }
    }

    // ── ENDPOINT EXISTENT: /stripe-intent ─────────────────────
    if (url.pathname === "/stripe-intent") {
      try {
        const body = await request.json();
        const suma = Math.round(body.suma * 100);
        const label = body.label || "Contributie editoriale Dokimasia";
        const stripeResp = await fetch("https://api.stripe.com/v1/payment_intents", {
          method: "POST",
          headers: {
            "Authorization": `Basic ${btoa(env.STRIPE_SECRET_KEY + ":")}`,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            amount: suma,
            currency: "ron",
            description: label,
            "automatic_payment_methods[enabled]": "true"
          }).toString()
        });
        const intent = await stripeResp.json();
        if (intent.error) {
          return new Response(JSON.stringify({ error: intent.error.message }), {
            status: 400, headers: { ...CORS, "Content-Type": "application/json" }
          });
        }
        return new Response(JSON.stringify({ clientSecret: intent.client_secret }), {
          headers: { ...CORS, "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Eroare Stripe: " + err.message }), {
          status: 500, headers: { ...CORS, "Content-Type": "application/json" }
        });
      }
    }

    // ── ENDPOINT EXISTENT: trimitere articol (default) ─────────
    try {
      const formData = await request.formData();
      const nume = formData.get("nume") || "";
      const email = formData.get("email") || "";
      const institutie = formData.get("institutie") || "";
      const functie = formData.get("functie") || "";
      const localitate = formData.get("localitate") || "";
      const judet = formData.get("judet") || "";
      const telefon = formData.get("telefon") || "";
      const sectiune = formData.get("sectiune") || "";
      const tip_material = formData.get("tip_material") || "";
      const nr_articole = parseInt(formData.get("nr_articole") || "1");
      const optiune_plata = formData.get("optiune_plata") || "tarziu";
      const fisiere = formData.getAll("fisiere");
      if (!fisiere || fisiere.length === 0) {
        return new Response(JSON.stringify({ success: false, error: "Niciun fisier primit." }), {
          status: 400, headers: { ...CORS, "Content-Type": "application/json" }
        });
      }
      const timestamp = (new Date()).toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const slugNume = nume.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "").slice(0, 30);
      const linkuri = [];
      for (let i = 0; i < fisiere.length; i++) {
        const file = fisiere[i];
        const ext = file.name.split(".").pop();
        const key = `articole/${timestamp}_${slugNume}_art${i + 1}.${ext}`;
        const arrayBuffer = await file.arrayBuffer();
        await env.R2_BUCKET.put(key, arrayBuffer, {
          httpMetadata: { contentType: file.type || "application/octet-stream" },
          customMetadata: { autor: nume, email, originalName: file.name }
        });
        linkuri.push(`https://cdn.dokimasia.ro/${key}`);
      }
      let supabaseOk = true;
      let autorId = null;
      try {
        const autorResp = await fetch(`${env.SUPABASE_URL}/rest/v1/autori?email=eq.${encodeURIComponent(email)}&select=id&limit=1`, {
          headers: { "apikey": env.SUPABASE_SERVICE_KEY, "Authorization": `Bearer ${env.SUPABASE_SERVICE_KEY}` }
        });
        const autorData = await autorResp.json();
        if (autorData && autorData.length > 0) {
          autorId = autorData[0].id;
          await fetch(`${env.SUPABASE_URL}/rest/v1/autori?id=eq.${autorId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "apikey": env.SUPABASE_SERVICE_KEY, "Authorization": `Bearer ${env.SUPABASE_SERVICE_KEY}` },
            body: JSON.stringify({ nume_complet: nume, institutie, titlu_didactic: functie, email, localitate, judet, telefon })
          });
        } else {
          const newAutor = await supabaseInsert(env, "autori", { nume_complet: nume, institutie, titlu_didactic: functie, email, localitate, judet, telefon, status: "aprobat" });
          autorId = newAutor?.id || null;
        }
      } catch (e) {
        console.error("Autor error:", e.message);
      }
      try {
        for (let i = 0; i < nr_articole; i++) {
          await supabaseInsert(env, "articole_revista", {
            autor_id: autorId,
            titlu: `Articol ${i + 1} \u2013 ${nume}`,
            rubrica: sectiune,
            tip_acces: "premium",
            status: "trimis",
            platit: optiune_plata === "acum",
            email_autor: email,
            nume_autor: nume,
            institutie,
            functie,
            localitate,
            judet,
            telefon,
            nr_articole,
            optiune_plata,
            fisiere_links: linkuri,
            fisier_url: linkuri[i] || linkuri[0] || null,
            tip_fisier: tip_material
          });
        }
      } catch (e) {
        supabaseOk = false;
        console.error("Supabase error:", e.message);
      }
      const linkuriText = linkuri.map((l, i) => `Articol ${i + 1}: ${l}`).join("\n");
      const emailPayload = {
        service_id: env.EJS_SERVICE_ID,
        template_id: env.EJS_TEMPLATE_ID,
        user_id: env.EJS_PUBLIC_KEY,
        accessToken: env.EJS_PRIVATE_KEY,
        template_params: {
          nume, email, institutie, functie, localitate, judet, telefon,
          sectiune, tip_material, nr_articole: String(nr_articole), optiune_plata,
          fisiere: linkuriText,
          message: `Articol nou - ${nume} | ${sectiune} | ${tip_material} | ${nr_articole} art. | Plata: ${optiune_plata}\n\nFisiere:\n${linkuriText}`,
          title: `Articol nou Dokimasia - ${nume}`
        }
      };
      await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailPayload)
      });
      return new Response(JSON.stringify({ success: true, linkuri, supabase: supabaseOk ? "ok" : "warning" }), {
        headers: { ...CORS, "Content-Type": "application/json" }
      });
    } catch (err) {
      console.error("Worker error:", err);
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500, headers: { ...CORS, "Content-Type": "application/json" }
      });
    }
  }
};

export { worker_default as default };
