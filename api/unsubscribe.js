export const config = { runtime: 'edge' };

export default async function handler(req) {
  const url    = new URL(req.url);
  const encoded = url.searchParams.get('e');

  // ── Decode email ──────────────────────────────────────────────────────────
  let email = '';
  try {
    email = decodeURIComponent(escape(atob(encoded || '')));
  } catch {
    return htmlResponse('Enlace inválido', 'No pudimos encontrar tu suscripción.', false);
  }

  if (!email || !email.includes('@')) {
    return htmlResponse('Enlace inválido', 'No pudimos encontrar tu suscripción.', false);
  }

  try {
    // ── Remove from Brevo list 2 (Brand Intelligence) ─────────────────────
    await fetch(`https://api.brevo.com/v3/contacts/lists/2/contacts/remove`, {
      method: 'POST',
      headers: {
        'accept':       'application/json',
        'api-key':      process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ emails: [email] }),
    });

    return htmlResponse(
      'Suscripción cancelada',
      `Tu correo <strong>${email}</strong> ya no recibirá Brand Intelligence.<br>Sin preguntas. Sin presión. Si algún día quieres volver, estaremos aquí.`,
      true
    );

  } catch (err) {
    return htmlResponse('Error', 'Algo salió mal. Por favor escríbenos a contacto@germanbaher.com', false);
  }
}

function htmlResponse(title, message, success) {
  const color = success ? '#EE2551' : '#888989';
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${title} — Germán Baher</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=ASAP+Condensed:wght@700;900&family=Asap:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#0C1521;color:#fff;font-family:'Asap',Arial,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:40px 20px;}
  .card{max-width:480px;width:100%;text-align:center;}
  .line{width:32px;height:3px;background:${color};margin:0 auto 28px;}
  .gb{width:48px;height:48px;background:#EE2551;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-family:Impact,sans-serif;font-size:18px;color:#fff;letter-spacing:-0.5px;margin-bottom:24px;}
  h1{font-family:'ASAP Condensed',Impact,sans-serif;font-size:32px;text-transform:uppercase;color:#fff;margin-bottom:16px;line-height:1.1;}
  p{font-size:15px;color:#AEADAD;line-height:1.75;margin-bottom:28px;}
  a{display:inline-block;background:${color};color:#fff;font-family:'Asap',Arial,sans-serif;font-weight:700;font-size:13px;padding:11px 24px;border-radius:4px;text-decoration:none;}
  .brand{margin-top:40px;font-size:11px;color:#3D4F60;letter-spacing:1.5px;text-transform:uppercase;}
</style>
</head>
<body>
  <div class="card">
    <div class="line"></div>
    <div class="gb">GB</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="https://www.germanbaher.com">Volver al inicio →</a>
    <div class="brand" style="margin-top:32px;">Germán Baher LLC · Growth Brands™</div>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
