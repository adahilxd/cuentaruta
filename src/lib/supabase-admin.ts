import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy: no instanciar en tiempo de importación (fallaría en build sin las env vars)
let _client: SupabaseClient | null = null;

function getAdminClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridas");
    _client = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _client;
}

export function getSupabaseAdmin(): SupabaseClient {
  return getAdminClient();
}

// getUserByEmail no existe en el SDK v2 — usamos el endpoint REST admin directamente
export async function getUserByEmail(email: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const res = await fetch(
    `${url}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    }
  );
  const data = await res.json();
  return Array.isArray(data.users) && data.users.length > 0 ? data.users[0] : null;
}
