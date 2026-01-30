const { createClient } = require('@supabase/supabase-js');

const supabaseURL = "https://domodruincjgomrjrbis.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvbW9kcnVpbmNqZ29tcmpyYmlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI3Mjg3MSwiZXhwIjoyMDc5ODQ4ODcxfQ.oCu0YGYHkimkY9-TqYkNsHTbOn6JGnJNM9KwhMw46NM";

// Crear cliente admin para backend
const supabase = createClient(supabaseURL, supabaseServiceKey);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'Falta userId' });

    // 🔹 Eliminar usuario de Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) return res.status(400).json({ error: authError.message });

    // 🔹 Eliminar usuario de la tabla Usuarios
    const { error: dbError } = await supabase.from('Usuarios').delete().eq('id', userId);
    if (dbError) return res.status(400).json({ error: dbError.message });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('ERROR DELETE USER:', err);
    return res.status(500).json({ error: err.message });
  }
};
