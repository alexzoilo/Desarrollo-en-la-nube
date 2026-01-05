import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseURL = "https://domodruincjgomrjrbis.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvbW9kcnVpbmNqZ29tcmpyYmlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNzI4NzEsImV4cCI6MjA3OTg0ODg3MX0.EVoICyBq7TzChL-475wb36XlRuK7JdKRDX_XMavoGGI";

export const supabase = createClient(supabaseURL, supabaseAnonKey);
