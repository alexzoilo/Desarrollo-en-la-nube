import { supabase } from './Supabaseclient.js';
import { mostrarMensaje, ocultarMensaje } from './extras/mensajes.js';
import { togglePassword } from './extras/Comprobaciones.js';

document.addEventListener("DOMContentLoaded", async () => {
    togglePassword();

    const nombreInput = document.getElementById("nombreUsuario");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("passwordUsuario");
    const botonGuardar = document.querySelector(".boton-guardar");
    const botonEliminar = document.querySelector(".boton-eliminar");

    // Modal elementos
    const modal = document.getElementById("modal-confirmacion");
    const btnConfirmar = document.getElementById("confirmar-eliminar");
    const btnCancelar = document.getElementById("cancelar-eliminar");

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
                usuario.nombre = nuevoNombre;
            }

            // 🔹 Actualizar contraseña si se ingresó
            if (nuevaPass.length >= 6) {
                try {
                    await supabase.auth.updateUser({ password: nuevaPass });
                } catch (err) {
                    if (!err.message.includes("New password should be different from the old password")) {
                        throw err;
                    } else {
                        mostrarMensaje("La nueva contraseña es igual a la actual, no se cambió", "info");
                    }
                }
            }

            passwordInput.value = "";
            mostrarMensaje("Datos actualizados correctamente", "success");

        } catch (err) {
            mostrarMensaje(err.message || "Error al actualizar los datos", "error");
            console.error(err);
        } finally {
            botonGuardar.disabled = false;
            botonEliminar.disabled = false;
        }
    });

    // 4️⃣ Mostrar modal de confirmación
    botonEliminar.addEventListener("click", () => {
        modal.style.display = "flex";
    });

    btnCancelar.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // 5️⃣ Confirmar eliminación usando Edge Function
    btnConfirmar.addEventListener("click", async () => {
        modal.style.display = "none";
        botonGuardar.disabled = true;
        botonEliminar.disabled = true;
        ocultarMensaje();

        try {
            // 🔹 Llamar a la Edge Function para eliminar usuario de Auth y DB
            const response = await fetch('//api/DeleteUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            const result = await response.json();
            if (result.error) throw new Error(result.error);

            mostrarMensaje("Cuenta eliminada correctamente", "success");
            setTimeout(() => window.location.href = "login.html", 1000);

        } catch (err) {
            mostrarMensaje(err.message || "Error al eliminar la cuenta", "error");
            console.error(err);
            botonGuardar.disabled = false;
            botonEliminar.disabled = false;
        }
    });
});
