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

    // Comenzamos con botones deshabilitados
    botonGuardar.disabled = true;

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
    emailInput.disabled = true; // Email ineditable

    // 3️⃣ Detectar cambios para habilitar botón Guardar
    function habilitarGuardar() {
        const nombreModificado = nombreInput.value.trim() !== usuario.nombre;
        const passEscribiendo = passwordInput.value.trim().length > 0;

        botonGuardar.disabled = !(nombreModificado || passEscribiendo);
    }

    nombreInput.addEventListener("input", habilitarGuardar);
    passwordInput.addEventListener("input", habilitarGuardar);

    // Función auxiliar para bloquear/desbloquear botones
    function bloquearBotones(bloquear = true) {
        botonGuardar.disabled = bloquear;
        botonEliminar.disabled = bloquear;
    }

    // 4️⃣ Guardar cambios
    botonGuardar.addEventListener("click", async () => {
        ocultarMensaje();
        bloquearBotones(true);

        const nuevoNombre = nombreInput.value.trim();
        const nuevaPass = passwordInput.value.trim();

        // Validaciones
        if (!nuevoNombre) {
            mostrarMensaje("El nombre no puede estar vacío", "error");
            bloquearBotones(false);
            return;
        }

        if (nuevaPass.length > 0 && nuevaPass.length < 6) {
            mostrarMensaje("La contraseña debe tener al menos 6 caracteres", "error");
            bloquearBotones(false);
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
                usuario.nombre = nuevoNombre; // actualizar valor local
            }

            // 🔹 Actualizar contraseña si se ingresó
            if (nuevaPass.length >= 6) {
                const { error: passError } = await supabase.auth.updateUser({
                    password: nuevaPass
                });
                if (passError) throw passError;
            }

            mostrarMensaje("Datos actualizados correctamente", "success");
            passwordInput.value = "";
            botonGuardar.disabled = true; // volver a deshabilitar hasta nuevo cambio

        } catch (err) {
            mostrarMensaje(err.message || "Error al actualizar los datos", "error");
            console.error(err);
            bloquearBotones(false);
        }
    });

    // 5️⃣ Eliminar cuenta
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
