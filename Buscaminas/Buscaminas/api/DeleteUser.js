import { createClient } from '@supabase/supabase-js';

// ✅ Aquí sí se usan las variables de entorno
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'No se proporcionó userId' });

    // 🔹 Eliminar de Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) return res.status(400).json({ error: authError.message });

    // 🔹 Eliminar de la tabla Usuarios
    const { error: dbError } = await supabase.from('Usuarios').delete().eq('id', userId);
    if (dbError) return res.status(400).json({ error: dbError.message });

    res.status(200).json({ success: true });

  } catch (err) {
    console.error('Error en deleteUser:', err);
    res.status(500).json({ error: err.message });  // 🔹 Siempre devuelve JSON
  }
}
