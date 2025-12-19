import { createClient } from "@supabase/supabase-js";

const supabaseURL = "db.domodruincjgomrjrbis.supabase.co";

const SupabaseKey ="Patitofeo63";

export const supabase = createClient(supabaseURL ,SupabaseKey);

export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function checkPassword(raw, hashed) {
  const rawHash = await hashPassword(raw);
  return rawHash === hashed;
}
