import { supabase } from './Supabaseclient.js';

const form = document.getElementById("registerForm");
const mensajeDiv = document.getElementById("mensaje");

// Mostrar / ocultar mensajes
function mostrarMensaje(txt, tipo = "info") {
    mensajeDiv.textContent = txt;
    mensajeDiv.style.color = tipo === "error" ? "red" : "green";
}
function ocultarMensaje() {
    mensajeDiv.textContent = "";
}

// Mostrar/ocultar contraseñas
document.querySelectorAll(".toggle-password").forEach(btn => {
    btn.addEventListener("click", () => {
        const input = document.getElementById(btn.dataset.target);
        if (input.type === "password") {
            input.type = "text";
            btn.textContent = "🔒";
        } else {
            input.type = "password";
            btn.textContent = "🔓";
        }
    });
});

// Expresión regular para validar email
function validarEmail(email) {
    // Debe tener texto + @ + texto + . + extensión (2 a 6 letras)
    const re = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,6}$/;
    return re.test(email);
}

// Registro
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    ocultarMensaje();

    const email = document.getElementById("email").value.trim();
    const nombre = document.getElementById("nombre").value.trim();
    const password = document.getElementById("password").value.trim();
    const repetir = document.getElementById("repeatpassword").value.trim();

    // Validaciones
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
        // 1️⃣ Registro seguro en Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email: email.toLowerCase(),
            password
        });

        if (error) {
            mostrarMensaje(error.message, "error");
            return;
        }

        // 2️⃣ Insertar datos en tabla Usuarios (sin password)
        const { error: insertError } = await supabase
            .from("Usuarios")
            .insert({
                id: data.user.id,  // mismo UUID que Auth
                nombre,
                partidasGanadas: 0,
                partidasPerdidas: 0
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
