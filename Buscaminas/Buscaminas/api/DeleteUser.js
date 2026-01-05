import {
    createClient
} from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    try {
        const {
            userId
        } = req.body;
        if (!userId) return res.status(400).json({
            error: 'No se proporcionó userId'
        });

        // 🔹 Borrar usuario de Auth
        const {
            error: authError
        } = await supabase.auth.admin.deleteUser(userId);
        if (authError) return res.status(400).json({
            error: authError.message
        });

        // 🔹 Borrar de tabla Usuarios
        const {
            error: dbError
        } = await supabase.from('Usuarios').delete().eq('id', userId);
        if (dbError) return res.status(400).json({
            error: dbError.message
        });

        res.status(200).json({
            success: true
        });

    } catch (err) {
        console.error('Error deleteUser:', err); // se verá en logs de Vercel
        res.status(500).json({
            error: err.message
        }); // siempre JSON
    }
}
