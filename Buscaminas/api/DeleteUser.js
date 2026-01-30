import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'Falta userId' });

  try {
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) return res.status(400).json({ error: authError.message });

    const { error: dbError } = await supabase.from('Usuarios').delete().eq('id', userId);
    if (dbError) return res.status(400).json({ error: dbError.message });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('ERROR DELETE USER:', err);
    return res.status(500).json({ error: err.message });
  }
}
