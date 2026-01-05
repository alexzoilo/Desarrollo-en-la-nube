import {
    supabase
} from './Supabaseclient.js';

export default async function handler(req, res) {
    try {
        const {
            userId
        } = await req.json();

        if (!userId) return res.status(400).json({
            error: "No se envió userId"
        });

        // 🔹 Eliminar usuario de Auth
        const {
            error: authError
        } = await supabase.auth.admin.deleteUser(userId);
        if (authError) throw authError;

        // 🔹 Opcional: eliminar datos de la tabla (por seguridad)
        const {
            error: dbError
        } = await supabase
            .from('Usuarios')
            .delete()
            .eq('id', userId);
        if (dbError) throw dbError;

        return new Response(JSON.stringify({
            success: true
        }), {
            status: 200
        });

    } catch (err) {
        return new Response(JSON.stringify({
            error: err.message
        }), {
            status: 500
        });
    }
}
