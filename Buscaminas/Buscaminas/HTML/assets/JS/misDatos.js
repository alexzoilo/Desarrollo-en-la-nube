import { supabase } from './Supabaseclient.js';
import { mostrarMensaje, ocultarMensaje } from './extras/mensajes.js';
import { togglePassword } from './extras/Comprobaciones.js';

document.addEventListener("DOMContentLoaded", async () => {
    togglePassword();

    // Inputs y botones
    const nombreInput = document.getElementById("nombreUsuario");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("passwordUsuario");
    const botonGuardar = document.querySelector(".boton-guardar");
    const botonEliminar = document.querySelector(".boton-eliminar");

    // 1️⃣ Comprobar sesión
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return window.location.href = "login.html";
    const userId = user.id;

    // 2️⃣ Cargar datos del usuario
    const { data: usuarioData, error: userError } = await supabase
        .from("Usuarios")
        .select("nombre, email")
        .eq("id", userId)
        .single();
    if (userError || !usuarioData) return mostrarMensaje("No se pudieron cargar tus datos", "error");

    const usuario = usuarioData;
    nombreInput.value = usuario.nombre;
    emailInput.value = usuario.email;
    emailInput.disabled = true;



    // 3️⃣ Guardar cambios
    botonGuardar.addEventListener("click", async () => {
        ocultarMensaje();
        botonGuardar.disabled = true;
        botonEliminar.disabled = true;

        const nuevoNombre = nombreInput.value.trim();
        const nuevaPass = passwordInput.value.trim();

        // Validaciones básicas
        if (!nuevoNombre) {
            mostrarMensaje("El nombre no puede estar vacío", "error");
            botonGuardar.disabled = false;
            botonEliminar.disabled = false;
            return;
        }

        if (nuevaPass.length > 0 && nuevaPass.length < 6) {
            mostrarMensaje("La contraseña debe tener al menos 6 caracteres", "error");
            botonGuardar.disabled = false;
            botonEliminar.disabled = false;
            return;
        }

        try {
            // 🔹 Comprobar si ya existe otro usuario con el mismo nombre
            const { data: usuariosExistentes } = await supabase
                .from("Usuarios")
                .select("id")
                .eq("nombre", nuevoNombre)
                .neq("id", userId) // Ignorar el usuario actual
                .limit(1);

            if (usuariosExistentes && usuariosExistentes.length > 0) {
                mostrarMensaje("Datos existentes", "error");
                botonGuardar.disabled = false;
                botonEliminar.disabled = false;
                return;
            }

            // 🔹 Actualizar nombre si cambió
            if (nuevoNombre !== usuario.nombre) {
                const { error: nombreError } = await supabase
                    .from("Usuarios")
                    .update({ nombre: nuevoNombre })
                    .eq("id", userId);
                if (nombreError) throw nombreError;

                usuario.nombre = nuevoNombre;
            }

            // 🔹 Actualizar contraseña si se ingresó
            if (nuevaPass.length >= 6) {
                try {
                    await supabase.auth.updateUser({ password: nuevaPass });
                } catch (err) {
                    // Ignora error si es la misma contraseña
                    if (!err.message.includes("New password should be different from the old password")) {
                        throw err;
                    } else {
                        mostrarMensaje("La nueva contraseña es igual a la actual, no se cambió", "info");
                    }
                }
            }

            passwordInput.value = "";
            botonGuardar.disabled = true;
            mostrarMensaje("Datos actualizados correctamente", "success");

        } catch (err) {
            mostrarMensaje(err.message || "Error al actualizar los datos", "error");
            console.error(err);
        } finally {
            botonEliminar.disabled = false;
        }
    });

    // 4️⃣ Eliminar cuenta
    botonEliminar.addEventListener("click", async () => {
        if (!confirm("¿Seguro que deseas eliminar tu cuenta? Esta acción es irreversible.")) return;

        botonGuardar.disabled = true;
        botonEliminar.disabled = true;
        ocultarMensaje();

        try {
            const { error: deleteError } = await supabase
                .from("Usuarios")
                .delete()
                .eq("id", userId);
            if (deleteError) throw deleteError;

            await supabase.auth.signOut();

            window.location.href = "login.html";

        } catch (err) {
            mostrarMensaje(err.message || "Error al eliminar la cuenta", "error");
            console.error(err);
            botonEliminar.disabled = false;
        }
    });
});
