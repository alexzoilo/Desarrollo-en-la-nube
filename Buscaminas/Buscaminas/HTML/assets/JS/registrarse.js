import { supabase } from './Supabaseclient.js';

const form = document.getElementById("registerForm");
const mensajeDiv = document.getElementById("mensaje");

// Mostrar mensajes
function mostrarMensaje(txt, tipo = "info") {
    mensajeDiv.textContent = txt;
    mensajeDiv.style.color = tipo === "error" ? "red" : "green";
}
function ocultarMensaje() {
    mensajeDiv.textContent = "";
}

// Mostrar/ocultar contraseña
document.querySelectorAll(".toggle-password").forEach(btn => {
    btn.addEventListener("click", () => {
        const input = document.getElementById(btn.dataset.target);
        if (input.type === "password") {
            input.type = "text";
            btn.textContent = "🔓";
        } else {
            input.type = "password";
            btn.textContent = "🔒";
        }
    });
});

// Validar email
function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,6}$/;
    return re.test(email);
}

// Registro
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
        mostrarMensaje("Ingresa un email válido (ej: usuario@dominio.com)", "error");
        return;
    }

    if (password !== repetir) {
        mostrarMensaje("Las contraseñas no coinciden", "error");
        return;
    }

    try {
        // ✅ Comprobar si ya existe el nombre en la tabla Usuarios
        const { data: nombreExistente } = await supabase
            .from("Usuarios")
            .select("id")
            .eq("nombre", nombre)
            .single();

        if (nombreExistente) {
            mostrarMensaje("❌ Nombre de usuario ya existente", "error");
            return;
        }

        // 1️⃣ Registro en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password
        });

        if (authError) {
            mostrarMensaje(authError.message, "error");
            return;
        }

        // 2️⃣ Insertar en tabla Usuarios
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

        mostrarMensaje("Registro exitoso, redirigiendo...", "success");
        setTimeout(() => window.location.href = "tablero.html", 1000);

    } catch (err) {
        console.error("Error inesperado:", err);
        mostrarMensaje("Ocurrió un error, intenta de nuevo", "error");
    }
});
