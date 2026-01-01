import { supabase } from './Supabaseclient.js';

document.addEventListener("DOMContentLoaded", async () => {

    const { data, error } = await supabase
        .from('Usuarios')
        .select('nombre, password')
        .limit(1);

    if (error) {
        console.error(error);
        alert("Error cargando datos");
        return;
    }

    // ⚠️ Si no hay usuarios
    if (data.length === 0) {
        alert("No hay ningún usuario en la base de datos");
        return;
    }

    const usuario = data[0];

    document.getElementById("nombreUsuario").value = usuario.nombre;
    document.getElementById("passwordUsuario").value = usuario.password;

    document.querySelector(".boton-guardar").addEventListener("click", async () => {

        const { error: updateError } = await supabase
            .from('Usuarios')
            .update({
                nombre: document.getElementById("nombreUsuario").value,
                password: document.getElementById("passwordUsuario").value
            })
            .eq('nombre', usuario.nombre);

        if (updateError) {
            console.error(updateError);
            alert("Error al guardar");
            return;
        }

        alert("Datos guardados correctamente");
    });
});
