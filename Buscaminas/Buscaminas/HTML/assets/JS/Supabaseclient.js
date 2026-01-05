import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const NEXT_PUBLIC_SUPABASE_URL = import.meta.env.NEXT_PUBLIC_SUPABASE_URL ;
const NEXT_PUBLIC_SUPABASE_ANON_KEY = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ;

export const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);
