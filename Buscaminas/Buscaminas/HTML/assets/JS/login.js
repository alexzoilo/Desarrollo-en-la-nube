import { supabase } from './Supabaseclient.js';

const form = document.getElementById("loginForm");
const mensajeDiv = document.getElementById("mensaje");

// Mostrar / ocultar mensajes
function mostrarMensaje(txt, tipo = "info") {
    mensajeDiv.textContent = txt;
    mensajeDiv.style.color = tipo === "error" ? "red" : "green";
}
function ocultarMensaje() {
    mensajeDiv.textContent = "";
}

// Toggle contraseña (igual que en registro)
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
 // Login
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    ocultarMensaje();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        mostrarMensaje("Debes completar todos los campos", "error");
        return;
    }

    if (!validarEmail(email)) {
        mostrarMensaje("Ingresa un email válido (ej: pepe@gmail.com)", "error");
        return;
    }

    try {
        // 1️⃣ Login con Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (authError || !authData.user) {
            mostrarMensaje("Credenciales incorrectas", "error");
            return;
        }

        // 2️⃣ Obtener datos de la tabla Usuarios
        const { data: usuarioDB, error: usuarioError } = await supabase
            .from("Usuarios")
            .select("*")
            .eq("id", authData.user.id)
            .single();

        if (usuarioError || !usuarioDB) {
            mostrarMensaje("Usuario no encontrado en la base de datos", "error");
            return;
        }

        // 3️⃣ Guardar en sessionStorage
        sessionStorage.setItem("usuarioActual", JSON.stringify({
            id: authData.user.id,
            nombre: usuarioDB.nombre,
            email: usuarioDB.email
        }));

        mostrarMensaje("Login correcto, redirigiendo...", "success");
        setTimeout(() => window.location.href = "tablero.html", 1000);

    } catch (err) {
        console.error("Error inesperado:", err);
        mostrarMensaje("Ocurrió un error, intenta de nuevo", "error");
    }
});
