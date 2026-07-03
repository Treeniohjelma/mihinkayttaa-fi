const MAX_MESSAGE_LENGTH = 3000;

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function sanitize(value, maxLength) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const formData = await request.formData();

  if (sanitize(formData.get("website"), 200)) {
    return jsonResponse({ ok: true });
  }

  const name = sanitize(formData.get("name"), 120);
  const email = sanitize(formData.get("email"), 160);
  const subject = sanitize(formData.get("subject"), 160);
  const message = String(formData.get("message") || "").trim().slice(0, MAX_MESSAGE_LENGTH);

  if (!name || !email || !subject || !message) {
    return jsonResponse({ error: "Täytä kaikki kentät." }, 400);
  }

  if (!isEmail(email)) {
    return jsonResponse({ error: "Tarkista sähköpostiosoite." }, 400);
  }

  if (!env.RESEND_API_KEY || !env.CONTACT_TO_EMAIL || !env.CONTACT_FROM_EMAIL) {
    return jsonResponse({ error: "Lomakkeen sähköpostiasetukset puuttuvat." }, 500);
  }

  const origin = request.headers.get("origin") || "https://mihinkayttaa.fi";
  const ip = request.headers.get("cf-connecting-ip") || "";
  const html = `
    <h2>Uusi yhteydenotto Mihin käyttää -sivustolta</h2>
    <p><strong>Nimi:</strong> ${escapeHtml(name)}</p>
    <p><strong>Sähköposti:</strong> ${escapeHtml(email)}</p>
    <p><strong>Aihe:</strong> ${escapeHtml(subject)}</p>
    <p><strong>Sivu:</strong> ${escapeHtml(origin)}</p>
    <p><strong>IP:</strong> ${escapeHtml(ip)}</p>
    <hr>
    <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
  `;

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "authorization": `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM_EMAIL,
      to: [env.CONTACT_TO_EMAIL],
      reply_to: email,
      subject: `Mihin käyttää: ${subject}`,
      html
    })
  });

  if (!resendResponse.ok) {
    return jsonResponse({ error: "Viestin lähetys epäonnistui. Yritä hetken kuluttua uudelleen." }, 502);
  }

  return jsonResponse({ ok: true });
}

export async function onRequestOptions() {
  return jsonResponse({ ok: true });
}
