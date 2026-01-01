import { supabase } from '../JS/Supabaseclient.js';

document.addEventListener("DOMContentLoaded", async () => {

    // 1️⃣ Cargar datos
    const { data, error } = await supabase
        .from('Usuarios')
        .select('*')
        .limit(1)
        .single();

    if (error || !data) {
        alert("No se pudieron cargar tus datos");
        console.error(error);
        return;
    }

    const nombreInput = document.getElementById("nombreUsuario");
    const passInput = document.getElementById("passwordUsuario");

    nombreInput.value = data.nombre;
    passInput.value = data.contrasseña;

    // 2️⃣ Guardar cambios
    document.querySelector(".boton-guardar").addEventListener("click", async () => {

        const nuevoNombre = nombreInput.value.trim();
        const nuevaPass = passInput.value.trim();

        if (!nuevoNombre || !nuevaPass) {
            alert("Los campos no pueden estar vacíos");
            return;
        }

        const { error: updateError } = await supabase
            .from('Usuarios')
            .update({
                nombre: nuevoNombre,
                contrasseña: nuevaPass
            })
            .eq('nombre', data.nombre); // identifica la fila

        if (updateError) {
            alert("Error al guardar");
            console.error(updateError);
            return;
        }

        alert("Datos guardados correctamente");
    });
});
