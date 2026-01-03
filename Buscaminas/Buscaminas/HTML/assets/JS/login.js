import { supabase } from './Supabaseclient.js';

const form = document.getElementById("loginForm");
const mensajeDiv = document.getElementById("mensaje");

function mostrarMensaje(txt, tipo = "info") {
    mensajeDiv.textContent = txt;
    mensajeDiv.style.color = tipo === "error" ? "red" : "green";
}

function ocultarMensaje() {
    mensajeDiv.textContent = "";
}

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

function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,6}$/;
    return re.test(email);
}

let intentosFallidos = 0;
const MAX_INTENTOS = 5;

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    ocultarMensaje();

    if (intentosFallidos >= MAX_INTENTOS) {
        mostrarMensaje("Has alcanzado el límite de intentos fallidos. Intentalo más tarde.", "error");
        return;
    }

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        mostrarMensaje("Debes completar todos los campos", "error");
        return;
    }

    if (!validarEmail(email)) {
        mostrarMensaje("Ingresa un email válido (ej: usuario@dominio.com)", "error");
        return;
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error || !data.user) {
            intentosFallidos++;

            const { data: usuarioDB } = await supabase
                .from("Usuarios")
                .select("*")
                .eq("email", email)
                .single()
                .catch(() => null);

            if (!usuarioDB) {
                mostrarMensaje("Usuario no encontrado", "error");
            } else {
                mostrarMensaje("Contraseña incorrecta", "error");
            }
            return;
        }

        intentosFallidos = 0;

        const { data: usuarioDB, error: usuarioError } = await supabase
            .from("Usuarios")
            .select("*")
            .eq("email", email)
            .single();

        if (usuarioError || !usuarioDB) {
            mostrarMensaje("Usuario no encontrado", "error");
            console.error(usuarioError);
            return;
        }

        sessionStorage.setItem("usuarioActual", JSON.stringify({
            id: usuarioDB.id,
            nombre: usuarioDB.nombre,
            email: usuarioDB.email
        }));

        window.location.href = "tablero.html";

    } catch (err) {
        console.error("Error inesperado:", err);
        mostrarMensaje("Ocurrió un error, intenta de nuevo", "error");
    }
});
