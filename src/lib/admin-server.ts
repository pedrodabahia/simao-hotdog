import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

// Server-only: uses the service_role key, which bypasses RLS entirely.
// This module must never be imported in a way that ships its handler bodies
// to the client — createServerFn's compiler plugin strips them automatically.
function adminClient() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars");
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

async function checkPassword(password: string): Promise<boolean> {
  const { data, error } = await adminClient()
    .from("admin_credentials")
    .select("password")
    .eq("id", 1)
    .single();
  if (error || !data) throw new Error("Failed to verify admin credentials");
  return data.password === password;
}

export const adminLogin = createServerFn({ method: "POST" })
  .validator((d: { password: string }) => d)
  .handler(async ({ data }) => ({ ok: await checkPassword(data.password) }));

export const adminSetPassword = createServerFn({ method: "POST" })
  .validator((d: { currentPassword: string; newPassword: string }) => d)
  .handler(async ({ data }) => {
    const ok = await checkPassword(data.currentPassword);
    if (!ok) return { ok: false as const };
    const { error } = await adminClient()
      .from("admin_credentials")
      .update({ password: data.newPassword })
      .eq("id", 1);
    if (error) throw new Error("Failed to update password");
    return { ok: true as const };
  });

export const saveStoreSettings = createServerFn({ method: "POST" })
  .validator((d: { password: string; settings: Record<string, unknown> }) => d)
  .handler(async ({ data }) => {
    const ok = await checkPassword(data.password);
    if (!ok) return { ok: false as const };
    const { error } = await adminClient()
      .from("store_settings")
      .update({ data: data.settings })
      .eq("id", 1);
    if (error) throw new Error("Failed to save settings");
    return { ok: true as const };
  });
