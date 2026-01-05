import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://domodruincjgomrjrbis.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvbW9kcnVpbmNqZ29tcmpyYmlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNzI4NzEsImV4cCI6MjA3OTg0ODg3MX0.EVoICyBq7TzChL-475wb36XlRuK7JdKRDX_XMavoGGI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Supabase KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY)
