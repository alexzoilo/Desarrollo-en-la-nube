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

    // Email deshabilitado
    emailInput.disabled = true;

    // Botón guardar empieza deshabilitado
    botonGuardar.disabled = true;

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

    // ⚡ Función que detecta cambios y habilita/deshabilita botón guardar
    function actualizarEstadoGuardar() {
        const hayCambios = nombreInput.value.trim() !== usuario.nombre || passwordInput.value.trim().length > 0;
        botonGuardar.disabled = !hayCambios;
    }

    // Escuchar cambios en inputs
    nombreInput.addEventListener("input", actualizarEstadoGuardar);
    passwordInput.addEventListener("input", actualizarEstadoGuardar);

    // 3️⃣ Guardar cambios
    botonGuardar.addEventListener("click", async () => {
        ocultarMensaje();
        botonGuardar.disabled = true;
        botonEliminar.disabled = true;

        const nuevoNombre = nombreInput.value.trim();
        const nuevaPass = passwordInput.value.trim();

        // Validaciones
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
            // 🔹 Actualizar nombre si cambió
            if (nuevoNombre !== usuario.nombre) {
                const { error: nombreError } = await supabase
                    .from("Usuarios")
                    .update({ nombre: nuevoNombre })
                    .eq("id", userId);
                if (nombreError) throw nombreError;

                usuario.nombre = nuevoNombre; // actualizar valor interno
            }

            // 🔹 Actualizar contraseña si se ingresó
            if (nuevaPass.length >= 6) {
                const { error: passError } = await supabase.auth.updateUser({ password: nuevaPass });
                if (passError) throw passError;
            }

            passwordInput.value = "";
            botonGuardar.disabled = true; // deshabilitar nuevamente
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
            mostrarMensaje("Cuenta eliminada correctamente", "success");
            setTimeout(() => window.location.href = "login.html", 1000);

        } catch (err) {
            mostrarMensaje(err.message || "Error al eliminar la cuenta", "error");
            console.error(err);
            botonEliminar.disabled = false;
        }
    });
});
