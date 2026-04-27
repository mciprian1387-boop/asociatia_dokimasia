// worker.js
var CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};
var worker_default = {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: CORS });
    }
    const url = new URL(request.url);
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
            status: 400,
            headers: { ...CORS, "Content-Type": "application/json" }
          });
        }
        return new Response(JSON.stringify({ clientSecret: intent.client_secret }), {
          headers: { ...CORS, "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Eroare Stripe: " + err.message }), {
          status: 500,
          headers: { ...CORS, "Content-Type": "application/json" }
        });
      }
    }
    try {
      const formData = await request.formData();
      const nume = formData.get("nume") || "\u2014";
      const email = formData.get("email") || "\u2014";
      const institutie = formData.get("institutie") || "\u2014";
      const functie = formData.get("functie") || "\u2014";
      const localitate = formData.get("localitate") || "\u2014";
      const judet = formData.get("judet") || "\u2014";
      const telefon = formData.get("telefon") || "\u2014";
      const sectiune = formData.get("sectiune") || "\u2014";
      const tip_material = formData.get("tip_material") || "\u2014";
      const nr_articole = formData.get("nr_articole") || "\u2014";
      const optiune_plata = formData.get("optiune_plata") || "\u2014";
      const fisiere = formData.getAll("fisiere");
      if (!fisiere || fisiere.length === 0) {
        return new Response(JSON.stringify({ success: false, error: "Niciun fi\u0219ier primit." }), {
          status: 400,
          headers: { ...CORS, "Content-Type": "application/json" }
        });
      }
      const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const slugNume = nume.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "").slice(0, 30);
      const linkuri = [];
      for (let i = 0; i < fisiere.length; i++) {
        const file = fisiere[i];
        const ext = file.name.split(".").pop();
        const key = `articole/${timestamp}_${slugNume}_art${i + 1}.${ext}`;
        const arrayBuffer = await file.arrayBuffer();
        await env.R2_BUCKET.put(key, arrayBuffer, {
          httpMetadata: { contentType: file.type || "application/octet-stream" },
          customMetadata: {
            autor: nume,
            email,
            originalName: file.name
          }
        });
        linkuri.push(`https://cdn.dokimasia.ro/${key}`);
      }
      const linkuriText = linkuri.map((l, i) => `Articol ${i + 1}: ${l}`).join("\n");
      const emailPayload = {
        service_id: env.EJS_SERVICE_ID,
        template_id: env.EJS_TEMPLATE_ID,
        user_id: env.EJS_PUBLIC_KEY,
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
          fisiere: linkuriText,
          message: `Articol nou primit \u2013 ${nume}
Sec\u021Biune: ${sectiune}
Tip: ${tip_material}
Nr. articole: ${nr_articole}
Plat\u0103: ${optiune_plata}

Fi\u0219iere:
${linkuriText}`,
          title: `Articol nou Dokimasia \u2013 ${nume}`
        }
      };
      const ejsResp = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailPayload)
      });
      if (!ejsResp.ok) {
        const errText = await ejsResp.text();
        console.error("EmailJS error:", errText);
        return new Response(JSON.stringify({
          success: true,
          warning: "Fi\u0219ierele au fost salvate dar emailul nu s-a trimis: " + errText,
          linkuri
        }), { headers: { ...CORS, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ success: true, linkuri }), {
        headers: { ...CORS, "Content-Type": "application/json" }
      });
    } catch (err) {
      console.error("Worker error:", err);
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500,
        headers: { ...CORS, "Content-Type": "application/json" }
      });
    }
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
