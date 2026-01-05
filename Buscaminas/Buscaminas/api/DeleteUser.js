import {
    createClient
} from '@supabase/supabase-js';

// 🔹 Aquí usamos Service Role Key, solo en backend
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({
                error: 'Método no permitido'
            });
        }

        // 🔹 Verificar body
        const {
            userId
        } = req.body;
        console.log('Request body:', req.body);
        if (!userId) {
            return res.status(400).json({
                error: 'No se proporcionó userId'
            });
        }

        // 🔹 Eliminar usuario de Auth
        const {
            error: authError
        } = await supabase.auth.admin.deleteUser(userId);
        console.log('Auth delete error:', authError);
        if (authError) return res.status(400).json({
            error: authError.message
        });

        // 🔹 Eliminar usuario de la tabla Usuarios
        const {
            error: dbError
        } = await supabase.from('Usuarios').delete().eq('id', userId);
        console.log('DB delete error:', dbError);
        if (dbError) return res.status(400).json({
            error: dbError.message
        });

        // 🔹 Respuesta exitosa
        res.status(200).json({
            success: true
        });

    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({
            error: err.message
        });
    }
}
