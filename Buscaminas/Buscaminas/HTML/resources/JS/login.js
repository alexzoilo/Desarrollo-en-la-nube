import {
    supabase
} from '../JS/Supabaseclient.js';

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const password = document.getElementById("password").value;

    if (!nombre || !password) {
        alert("Debes completar todos los campos");
        return;
    }

    // ⚠️ Aquí pegamos el email exacto del usuario de Auth
    const email = "ases@buscaminas.com"; // <--- pega exactamente el email de Auth

    const {
        data,
        error
    } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error("Login fallido:", error.message);
        alert("Usuario o contraseña incorrectos");
        return;
    }

    console.log("Login correcto:", data.user);
    window.location.href = "tablero.html";
});
