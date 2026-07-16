import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY env vars");
}

// Read-only from the browser: RLS only grants SELECT on store_settings to
// the anon role. All writes go through server functions using the service
// role key, which never reaches this client.
export const supabase = createClient(url, anonKey);
