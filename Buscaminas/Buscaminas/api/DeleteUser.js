// /api/DeleteUser.js
import { createClient } from '@supabase/supabase-js';

// 🔹 Solo backend: lee variables de entorno de Vercel
const supabase = createClient(
  process.env.SUPABASE_URL,          // tu URL de Supabase
  process.env.SUPABASE_SERVICE_KEY    // tu Service Role Key
);

export default async function handler(req, res) {
  try {
    // Solo permitir POST
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método no permitido' });
    }

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'No se proporcionó userId' });
    }

    // 🔹 Borrar usuario de Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // 🔹 Borrar usuario de la tabla "Usuarios"
    const { error: dbError } = await supabase
      .from('Usuarios')
      .delete()
      .eq('id', userId);

    if (dbError) {
      return res.status(400).json({ error: dbError.message });
    }

    // ✅ Todo correcto
    res.status(200).json({ success: true });

  } catch (err) {
    console.error('Error deleteUser:', err); // Se verá en logs de Vercel
    res.status(500).json({ error: err.message });
  }
}
