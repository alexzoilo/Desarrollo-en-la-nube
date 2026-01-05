import {
    createClient
} from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    try {
        console.log('Request body:', req.body); // 🔹 Ver si userId llega
        console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'OK' : 'MISSING');

        const {
            userId
        } = req.body;
        if (!userId) return res.status(400).json({
            error: 'No se proporcionó userId'
        });

        const {
            error: authError
        } = await supabase.auth.admin.deleteUser(userId);
        console.log('Auth delete error:', authError);
        if (authError) return res.status(400).json({
            error: authError.message
        });

        const {
            error: dbError
        } = await supabase.from('Usuarios').delete().eq('id', userId);
        console.log('DB delete error:', dbError);
        if (dbError) return res.status(400).json({
            error: dbError.message
        });

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
