import { supabase } from './Supabaseclient.js';
import { mostrarMensaje, ocultarMensaje } from './extras/mensajes.js';
import { togglePassword, validarEmail } from './extras/Comprobaciones.js';

const form = document.getElementById("registerForm");

togglePassword();

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    ocultarMensaje();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const nombre = document.getElementById("nombre").value.trim();
    const password = document.getElementById("password").value.trim();
    const repetir = document.getElementById("repeatpassword").value.trim();

    if (!email || !nombre || !password || !repetir) {
        mostrarMensaje("Debes completar todos los campos", "error");
        return;
    }

    if (!validarEmail(email)) {
        mostrarMensaje("Ingresa un email válido (ej: pepe@gmail.com)", "error");
        return;
    }

    if (password !== repetir) {
        mostrarMensaje("Las contraseñas no coinciden", "error");
        return;
    }

    try {
        const { data: usuariosExistentes } = await supabase
            .from("Usuarios")
            .select("*")
            .or(`nombre.eq.${nombre},email.eq.${email}`);

        if (usuariosExistentes && usuariosExistentes.length > 0) {
            const nombreExistente = usuariosExistentes.some(u => u.nombre === nombre);
            const emailExistente = usuariosExistentes.some(u => u.email === email);

            if (nombreExistente && emailExistente) {
                mostrarMensaje("El nombre y el email ya existen", "error");
            } else if (nombreExistente) {
                mostrarMensaje("El nombre de usuario ya está en uso", "error");
            } else {
                mostrarMensaje("El email ya existe", "error");
            }
            return;
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password
        });

        if (authError) {
            mostrarMensaje(authError.message, "error");
            return;
        }

        const { error: insertError } = await supabase
            .from("Usuarios")
            .insert({
                id: authData.user.id,
                nombre,
                email,
                partidasGanadas: 0,
                partidasPerdidas: 0,
                tiempoUltimaPartida: 0,
                tiempoTotalJugado: 0
            });

        if (insertError) {
            mostrarMensaje(insertError.message, "error");
            return;
        }

        window.location.href = "tablero.html";

    } catch (err) {
        console.error("Error inesperado:", err);
        mostrarMensaje("Ocurrió un error, intenta de nuevo", "error");
    }
});
