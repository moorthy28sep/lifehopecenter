import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req: Request) => {
  try {
    if (req.method !== "GET") {
      return new Response(null, { status: 405 });
    }

    const url = new URL(req.url);
    const period = url.searchParams.get("period") || "month";

    // Basic example: fetch contact_requests ordered by created_at desc
    const { data, error } = await supabase
      .from("contact_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "content-type": "application/json" } });
    }

    // NOTE: apply any filtering by `period` or query params here as needed
    return new Response(JSON.stringify({ contacts: data }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: { "content-type": "application/json" } });
  }
});
