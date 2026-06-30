export const config = { runtime: 'edge' };

const BREVO_TEMPLATE_ID = 1;   // "Brand Intelligence — Bienvenida"
const BREVO_LIST_ID     = 2;   // "Brand Intelligence" list in Brevo

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': 'https://germanbaher.com',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { email, nombre, fuente } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email requerido' }), { status: 400 });
    }

    const parts     = (nombre || '').trim().split(' ');
    const firstName = parts[0] || '';
    const lastName  = parts.slice(1).join(' ') || '';

    // ── 1. Create / update contact + add to BI list ────────────────────────
    const contactRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept':       'application/json',
        'api-key':      process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email,
        attributes: {
          FIRSTNAME: firstName,
          LASTNAME:  lastName,
          FUENTE:    fuente || 'web',
        },
        listIds:       [BREVO_LIST_ID],
        updateEnabled: true,
      }),
    });

    const contactStatus = contactRes.status;
    // 201 = created, 204 = already exists (updated) — both OK
    if (contactStatus !== 201 && contactStatus !== 204) {
      const errBody = await contactRes.text();
      return new Response(JSON.stringify({ error: errBody }), { status: 500 });
    }

    // ── 2. Build unsubscribe URL (base64-encoded email, handled by /api/unsubscribe) ──
    const encodedEmail  = btoa(unescape(encodeURIComponent(email)));
    const unsubscribeUrl = `https://www.germanbaher.com/api/unsubscribe?e=${encodedEmail}`;

    // ── 3. Send welcome email via Brevo transactional template ────────────────
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept':       'application/json',
        'api-key':      process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        templateId: BREVO_TEMPLATE_ID,
        to: [{ email, name: firstName || email }],
        params: {
          unsubscribeUrl,
        },
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>`,
        },
      }),
    });
    // We fire-and-forget the email — contact creation already confirmed above

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
