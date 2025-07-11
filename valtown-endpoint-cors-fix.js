// Val.town endpoint with explicit CORS handling
// This version should work with val.town's infrastructure

export default async function(req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // Set CORS headers for all responses
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  };

  try {
    if (req.method === "POST") {
      const body = await req.json();
      const { action, id, data } = body;

      if (action === "save" && id && data) {
        // Use val.town's blob storage
        const { default: blob } = await import("https://esm.town/v/std/blob");
        await blob.setJSON(`wheel-${id}`, { data, timestamp: Date.now() });
        
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        });
      }

      if (action === "load" && id) {
        const { default: blob } = await import("https://esm.town/v/std/blob");
        const stored = await blob.getJSON(`wheel-${id}`);
        
        return new Response(JSON.stringify({ data: stored?.data || null }), {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
}