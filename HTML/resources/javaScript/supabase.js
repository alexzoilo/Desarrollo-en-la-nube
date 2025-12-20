
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

const supabaseURL = "https://domodruincjgomrjrbis.supabase.co";
const SupabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvbW9kcnVpbmNqZ29tcmpyYmlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNzI4NzEsImV4cCI6MjA3OTg0ODg3MX0.EVoICyBq7TzChL-475wb36XlRuK7JdKRDX_XMavoGGI";


console.log("URL:", supabaseURL);
console.log("KEY:", SupabaseKey);


export const supabase = createClient(supabaseURL, SupabaseKey);

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
