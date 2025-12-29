import {
    supabase
} from '../JS/Supabaseclient.js';

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1️⃣ Obtener y validar inputs
    const nombre = document.getElementById("nombre").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!nombre || !password) {
        alert("Debes completar todos los campos");
        return;
    }

    // 2️⃣ Generar email a partir del nombre
    const email = `${nombre}@buscaminas.com`.toLowerCase();

    try {
        // 3️⃣ Login con Supabase Auth
        const {
            data,
            error
        } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error("Error login:", error);
            alert("Credenciales incorrectas");
            return;
        }

        console.log("Login correcto:", data);

        // 4️⃣ Redirigir al tablero
        window.location.href = "tablero.html";

    } catch (err) {
        console.error("Error inesperado:", err);
        alert("Ocurrió un error inesperado. Intenta nuevamente.");
    }
});
