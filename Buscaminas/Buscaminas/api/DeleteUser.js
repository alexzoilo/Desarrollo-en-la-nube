import { createClient } from '@supabase/supabase-js';

// 🔹 Poner tus credenciales directamente
const supabase = createClient(
  "https://domodruincjgomrjrbis.supabase.co",       // tu Supabase URL
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvbW9kcnVpbmNqZ29tcmpyYmlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI3Mjg3MSwiZXhwIjoyMDc5ODQ4ODcxfQ.oCu0YGYHkimkY9-TqYkNsHTbOn6JGnJNM9KwhMw46NM" // tu Service Role Key
);

export default async function handler(req, res) {
  try {
    console.log('Request body:', req.body);

    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'No se proporcionó userId' });

    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    console.log('Auth delete error:', authError);
    if (authError) return res.status(400).json({ error: authError.message });

    const { error: dbError } = await supabase.from('Usuarios').delete().eq('id', userId);
    console.log('DB delete error:', dbError);
    if (dbError) return res.status(400).json({ error: dbError.message });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message });
  }
}
