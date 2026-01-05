import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_SERVICE_KEY = import.meta.env.SUPABASE_SERVICE_KEY ;
const SUPABASE_ANON_KEY = import.meta.env.SUPABASE_ANON_KEY ;

export const supabase = createClient(SUPABASE_SERVICE_KEY, SUPABASE_ANON_KEY);
