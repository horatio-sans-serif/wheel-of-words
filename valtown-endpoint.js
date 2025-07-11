// Val.town endpoint for Wheel of Words storage
// Deploy this as a val at https://www.val.town/
// Name it: wheelOfWordsStorage

export default async function(req: Request): Promise<Response> {
  // Enable CORS for all responses
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
  };
  
  const headers = {
    ...corsHeaders,
    "Content-Type": "application/json",
  };

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers,
    });
  }

  try {
    const { action, id, data } = await req.json();

    if (!action || !id) {
      return new Response(JSON.stringify({ error: "Missing action or id" }), {
        status: 400,
        headers,
      });
    }

    // Use val.town's built-in blob storage
    const { default: blob } = await import("https://esm.town/v/std/blob");
    const key = `wheel-of-words-${id}`;

    if (action === "save") {
      if (!data) {
        return new Response(JSON.stringify({ error: "Missing data" }), {
          status: 400,
          headers,
        });
      }

      // Store the encrypted data
      await blob.setJSON(key, {
        data,
        timestamp: new Date().toISOString(),
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers,
      });
    } else if (action === "load") {
      // Retrieve the data
      const stored = await blob.getJSON(key);

      if (!stored) {
        return new Response(JSON.stringify({ data: null }), {
          status: 200,
          headers,
        });
      }

      return new Response(JSON.stringify({ data: stored.data }), {
        status: 200,
        headers,
      });
    } else {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers,
    });
  }
}