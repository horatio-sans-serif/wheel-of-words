// Val.town endpoint using SQLite for storage
// This is more reliable than blob storage

import { sqlite } from "https://esm.town/v/std/sqlite";

export default async function(req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    // Create table if it doesn't exist
    await sqlite.execute(`
      CREATE TABLE IF NOT EXISTS wheel_data (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    if (req.method === "POST") {
      const body = await req.json();
      const { action, id, data } = body;

      if (action === "save" && id && data) {
        // Insert or update the data
        await sqlite.execute(
          `INSERT OR REPLACE INTO wheel_data (id, data) VALUES (?, ?)`,
          [id, data]
        );
        
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers,
        });
      }

      if (action === "load" && id) {
        // Retrieve the data
        const result = await sqlite.execute(
          `SELECT data FROM wheel_data WHERE id = ?`,
          [id]
        );
        
        const data = result.rows.length > 0 ? result.rows[0][0] : null;
        
        return new Response(JSON.stringify({ data }), {
          status: 200,
          headers,
        });
      }
    }

    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers,
    });
  }
}