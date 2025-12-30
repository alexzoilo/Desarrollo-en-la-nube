import { supabase } from './Supabaseclient.js';

        document.addEventListener("DOMContentLoaded", async () => {
            const user = supabase.auth.user();
            if (!user) {
                alert("No hay usuario logueado");
                window.location.href = "login.html";
                return;
            }

            const { data, error } = await supabase
                .from('Usuarios')
                .select('*')
                .eq('password', user.id)
                .single();

            if (error || !data) {
                alert("No se pudieron cargar tus datos");
                return;
            }

            document.getElementById("nombreUsuario").value = data.nombre;
            document.getElementById("passwordUsuario").value = "********";
        });