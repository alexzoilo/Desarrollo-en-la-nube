import { supabase } from './Supabaseclient.js';

document.addEventListener("DOMContentLoaded", async () => {
    // Traer los datos del primer (o único) usuario de la tabla
    const { data, error } = await supabase
        .from('Usuarios')
        .select('*')
        .limit(1)
        .single();

    if (error || !data) {
        alert("No se pudieron cargar tus datos");
        return;
    }

    const nombreInput = document.getElementById("nombreUsuario");
    const passwordInput = document.getElementById("passwordUsuario");

    nombreInput.value = data.nombre;
    passwordInput.value = data.contraseña; // mostramos la contraseña real si quieres

    // Guardar cambios
    document.querySelector(".boton-guardar").addEventListener("click", async () => {
        const nuevoNombre = nombreInput.value.trim();
        const nuevaContrasena = passwordInput.value.trim();

        if (!nuevoNombre || !nuevaContrasena) {
            alert("Los campos no pueden estar vacíos");
            return;
        }

        const { error: updateError } = await supabase
            .from('Usuarios')
            .update({ nombre: nuevoNombre, contraseña: nuevaContrasena })
            .eq('nombre', data.nombre); // usamos nombre original para ubicar el registro

        if (updateError) {
            alert("Error al actualizar datos: " + updateError.message);
            return;
        }

        alert("Datos actualizados correctamente");
    });

    // Eliminar cuenta
    document.querySelector(".boton-eliminar").addEventListener("click", async () => {
        if (!confirm("¿Estás seguro de eliminar tu cuenta?")) return;

        const { error: deleteError } = await supabase
            .from('Usuarios')
            .delete()
            .eq('nombre', data.nombre);

        if (deleteError) {
            alert("Error al eliminar cuenta: " + deleteError.message);
            return;
        }

        alert("Cuenta eliminada correctamente");
        window.location.href = "login.html";
    });
});
