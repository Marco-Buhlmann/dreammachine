/**
 * Cloudflare Pages Function — /api/events
 * GET  → returns events array from KV
 * POST → saves events array to KV (requires x-admin-key header)
 *
 * KV binding required: EVENTS_KV
 * (set up once in Cloudflare Pages → Settings → Functions → KV bindings)
 */

const ADMIN_KEY = '612501';

export async function onRequest(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-key',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // GET — public, returns events list
  if (request.method === 'GET') {
    const events = await env.EVENTS_KV.get('events', 'json') || [];
    return new Response(JSON.stringify(events), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // POST — admin only, saves events list
  if (request.method === 'POST') {
    const key = request.headers.get('x-admin-key');
    if (key !== ADMIN_KEY) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const body = await request.json();
    await env.EVENTS_KV.put('events', JSON.stringify(body.events || []));
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method not allowed', { status: 405 });
}
