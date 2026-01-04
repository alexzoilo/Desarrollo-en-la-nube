import { supabase } from './Supabaseclient.js';
import { mostrarMensaje, ocultarMensaje } from './extras/mensajes.js';
import { togglePassword, validarEmail } from './extras/Comprobaciones.js';

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
    if (authError || !user) {
        window.location.href = "login.html";
        return;
    }
    const userId = user.id;

    // 2️⃣ Cargar datos del usuario
    const { data: usuario, error: userError } = await supabase
        .from("Usuarios")
        .select("nombre, email")
        .eq("id", userId)
        .single();

    if (userError || !usuario) {
        mostrarMensaje("No se pudieron cargar tus datos", "error");
        return;
    }

    nombreInput.value = usuario.nombre;
    emailInput.value = usuario.email;

    // Función auxiliar para bloquear/desbloquear botones
    function bloquearBotones(bloquear = true) {
        botonGuardar.disabled = bloquear;
        botonEliminar.disabled = bloquear;
    }

    // 3️⃣ Guardar cambios
    botonGuardar.addEventListener("click", async () => {
        ocultarMensaje();
        bloquearBotones(true);

        const nuevoNombre = nombreInput.value.trim();
        const nuevoEmail = emailInput.value.trim();
        const nuevaPass = passwordInput.value.trim();

        // Validaciones
        if (!nuevoNombre) {
            mostrarMensaje("El nombre no puede estar vacío", "error");
            bloquearBotones(false);
            return;
        }

        if (!validarEmail(nuevoEmail)) {
            mostrarMensaje("Ingresa un email válido", "error");
            bloquearBotones(false);
            return;
        }

        if (nuevaPass.length > 0 && nuevaPass.length < 6) {
            mostrarMensaje("La contraseña debe tener al menos 6 caracteres", "error");
            bloquearBotones(false);
            return;
        }

        let mensajeFinal = "Datos actualizados correctamente";

        try {
            // 🔹 Actualizar nombre
            const { error: nombreError } = await supabase
                .from("Usuarios")
                .update({ nombre: nuevoNombre })
                .eq("id", userId);
            if (nombreError) throw nombreError;

            // 🔹 Actualizar email si cambió
            if (nuevoEmail !== user.email) {
                const { error: emailError } = await supabase.auth.updateUser({
                    email: nuevoEmail
                });
                if (emailError) throw emailError;
                mensajeFinal = "Revisa tu email para confirmar el cambio";
            }

            // 🔹 Actualizar contraseña si se ingresó
            if (nuevaPass.length >= 6) {
                const { error: passError } = await supabase.auth.updateUser({
                    password: nuevaPass
                });
                if (passError) throw passError;
            }

            mostrarMensaje(mensajeFinal, nuevoEmail !== user.email ? "info" : "success");
            passwordInput.value = "";

        } catch (err) {
            mostrarMensaje(err.message || "Error al actualizar los datos", "error");
            console.error(err);
        } finally {
            bloquearBotones(false);
        }
    });

    // 4️⃣ Eliminar cuenta
    botonEliminar.addEventListener("click", async () => {
        if (!confirm("¿Seguro que deseas eliminar tu cuenta? Esta acción es irreversible.")) return;
        bloquearBotones(true);
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
            bloquearBotones(false);
        }
    });
});
