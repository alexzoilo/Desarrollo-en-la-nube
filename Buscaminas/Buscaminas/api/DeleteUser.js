const { createClient } = require('@supabase/supabase-js');

const supabaseURL = "https://domodruincjgomrjrbis.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvbW9kcnVpbmNqZ29tcmpyYmlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNzI4NzEsImV4cCI6MjA3OTg0ODg3MX0.EVoICyBq7TzChL-475wb36XlRuK7JdKRDX_XMavoGGI";

module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método no permitido' });
    }

    const body = req.body || {};
    const userId = body.userId;

    if (!userId) {
      return res.status(400).json({ error: 'Falta userId' });
    }

    const { error: authError } =
      await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const { error: dbError } = await supabase
      .from('Usuarios')
      .delete()
      .eq('id', userId);

    if (dbError) {
      return res.status(400).json({ error: dbError.message });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('ERROR DELETE USER:', error);
    return res.status(500).json({ error: error.message });
  }
};
