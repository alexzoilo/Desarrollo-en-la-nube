import { supabase } from '../JS/Supabaseclient.js';

document.addEventListener("DOMContentLoaded", async () => {

    const { data, error } = await supabase
        .from('Usuarios')
        .select('nombre, password')
        .limit(1)
        .single();

    if (error) {
        console.error(error);
        alert("Error cargando datos");
        return;
    }

    const nombreInput = document.getElementById("nombreUsuario");
    const passInput = document.getElementById("passwordUsuario");

    nombreInput.value = data.nombre;
    passInput.value = data.password;

    document.querySelector(".boton-guardar").addEventListener("click", async () => {

        const { error: updateError } = await supabase
            .from('Usuarios')
            .update({
                nombre: nombreInput.value,
                password: passInput.value
            })
            .eq('nombre', data.nombre);

        if (updateError) {
            console.error(updateError);
            alert("Error al guardar");
            return;
        }

        alert("Datos guardados correctamente");
    });
});
