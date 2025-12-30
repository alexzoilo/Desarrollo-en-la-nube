import { supabase } from '../JS/Supabaseclient.js';

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

    const nombreInput = document.getElementById("nombreUsuario");
    const passwordInput = document.getElementById("passwordUsuario");

    // Mostrar datos
    nombreInput.value = data.nombre;
    passwordInput.value = "";

    // Botón Guardar
    document.querySelector(".boton-guardar").addEventListener("click", async () => {
        const nuevoNombre = nombreInput.value.trim();
        const nuevaPassword = passwordInput.value.trim();

        if (!nuevoNombre) {
            alert("El nombre de usuario no puede estar vacío.");
            return;
        }

        // Actualizar nombre en tabla Usuarios
        const { error: updateError } = await supabase
            .from('Usuarios')
            .update({ nombre: nuevoNombre })
            .eq('password', user.id);

        if (updateError) {
            alert("Error al actualizar el nombre: " + updateError.message);
            return;
        }

        // Actualizar contraseña en Auth si se ingresó una nueva
        if (nuevaPassword) {
            const { error: passwordError } = await supabase.auth.updateUser({
                password: nuevaPassword
            });

            if (passwordError) {
                alert("Error al actualizar la contraseña: " + passwordError.message);
                return;
            }
        }

        alert("Datos actualizados correctamente!");
        passwordInput.value = "";
    });

    // Botón Eliminar
    document.querySelector(".boton-eliminar").addEventListener("click", async () => {
        if (!confirm("¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.")) return;

        // Eliminar de la tabla Usuarios
        const { error: deleteError } = await supabase
            .from('Usuarios')
            .delete()
            .eq('password', user.id);

        if (deleteError) {
            alert("Error al eliminar cuenta: " + deleteError.message);
            return;
        }

        // Eliminar usuario de Auth
        const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.id);
        if (authDeleteError) {
            alert("Error al eliminar cuenta de Auth: " + authDeleteError.message);
            return;
        }

        alert("Cuenta eliminada correctamente.");
        window.location.href = "login.html";
    });
});
