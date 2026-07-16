import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Read-only from the browser: RLS only grants SELECT on store_settings to
// the anon role. All writes go through server functions using the service
// role key, which never reaches this client.
//
// If the env vars aren't configured (e.g. a deploy missing them), fall back
// to null instead of throwing at import time — this module is pulled in by
// nearly every page via admin-store, so throwing here would 500 the whole
// site instead of just disabling the admin sync feature.
if (!url || !anonKey) {
  console.error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY env vars — admin sync disabled");
}

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
