// Simpler Val.town endpoint for Wheel of Words storage
// This version uses a more straightforward approach

const storage = {};

export default async function(req: Request): Promise<Response> {
  // Always return CORS headers
  const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "*",
    "Content-Type": "application/json",
  });

  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  try {
    const body = await req.json();
    const { action, id, data } = body;

    if (action === "save") {
      storage[id] = data;
      return new Response(JSON.stringify({ success: true }), { headers });
    } 
    
    if (action === "load") {
      return new Response(JSON.stringify({ data: storage[id] || null }), { headers });
    }
    
    return new Response(JSON.stringify({ error: "Invalid action" }), { 
      status: 400, 
      headers 
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { 
      status: 500, 
      headers 
    });
  }
}