import { supabase } from './Supabaseclient.js';

document.addEventListener("DOMContentLoaded", async () => {

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from('Usuarios')
        .select('*')
        .eq('password', user.id)
        .single();

    document.getElementById("nombreUsuario").value = data.nombre;
    document.getElementById("passwordUsuario").value = "********";
});
