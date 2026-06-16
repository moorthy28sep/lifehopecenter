import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in environment for set-user-role function.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req: Request) => {
  try {
    if (req.method !== "POST") {
      return new Response(null, { status: 405 });
    }

    const body = await req.json();
    const { userId, role = "user", name = "", email = "" } = body as { userId?: string; role?: string; name?: string; email?: string };

    if (!userId) {
      return new Response(JSON.stringify({ error: "userId is required" }), { status: 400, headers: { "content-type": "application/json" } });
    }

    // Insert or upsert profile row in `users` table using service role key
    const { data, error } = await supabase.from("users").upsert(
      [
        {
          id: userId,
          name,
          email,
          role,
        },
      ],
      { onConflict: ["id"] }
    );

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "content-type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: true, data }), { status: 200, headers: { "content-type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: { "content-type": "application/json" } });
  }
});
