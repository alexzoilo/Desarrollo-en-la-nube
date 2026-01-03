import {
    supabase
} from './Supabaseclient.js';

// DOM
const form = document.getElementById("registerForm");
const mensajeDiv = document.getElementById("mensaje");

// Funciones para mostrar/ocultar mensajes
function mostrarMensaje(txt, tipo = "info") {
    mensajeDiv.textContent = txt;
    mensajeDiv.style.color = tipo === "error" ? "red" : "green";
}

function ocultarMensaje() {
    mensajeDiv.textContent = "";
}

// ---------------- Mostrar/ocultar contraseñas ----------------
const toggleBtns = document.querySelectorAll(".toggle-password");
toggleBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        const input = document.getElementById(btn.dataset.target);
        if (input.type === "password") {
            input.type = "text";
            btn.textContent = "🙈"; // ojo cerrado
        } else {
            input.type = "password";
            btn.textContent = "👁"; // ojo abierto
        }
    });
});

// ---------------- Registro ----------------
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    ocultarMensaje();

    const nombre = document.getElementById("nombre").value.trim();
    const password = document.getElementById("password").value.trim();
    const repetir = document.getElementById("repeatpassword").value.trim();

    if (!nombre || !password || !repetir) {
        mostrarMensaje("❌ Debes completar todos los campos", "error");
        return;
    }

    if (password !== repetir) {
        mostrarMensaje("❌ Las contraseñas no coinciden", "error");
        return;
    }

    try {
        // 1️⃣ Registramos al usuario en Supabase Auth
        const {
            data,
            error
        } = await supabase.auth.signUp({
            email: `${nombre}@buscaminas.com`.toLowerCase(),
            password
        });

        if (error) {
            mostrarMensaje(`❌ ${error.message}`, "error");
            return;
        }

        // 2️⃣ Insertamos en tabla Usuarios usando el mismo UUID de Auth
        const {
            error: insertError
        } = await supabase
            .from("Usuarios")
            .insert({
                id: data.user.id,
                nombre: nombre,
                password: password,
                partidasGanadas: 0,
                partidasPerdidas: 0
            });

        if (insertError) {
            mostrarMensaje(`❌ ${insertError.message}`, "error");
            return;
        }

        mostrarMensaje("✅ Registro exitoso, redirigiendo...", "success");
        setTimeout(() => window.location.href = "tablero.html", 1000);

    } catch (err) {
        console.error("Error inesperado:", err);
        mostrarMensaje("❌ Ocurrió un error, intenta de nuevo", "error");
    }
});
