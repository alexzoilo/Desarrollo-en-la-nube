import { supabase } from './Supabaseclient.js';

document.addEventListener("DOMContentLoaded", async () => {
    // Obtener usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        alert("No hay usuario logueado");
        window.location.href = "login.html";
        return;
    }

    // Traer datos de la tabla Usuarios usando el id del user
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
