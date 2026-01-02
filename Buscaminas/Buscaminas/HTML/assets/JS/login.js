import {
    supabase
} from './Supabaseclient.js';

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!nombre || !password) {
        alert("Debes completar todos los campos");
        return;
    }

    const email = `${nombre}@buscaminas.com`.toLowerCase();

    try {
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

        window.location.href = "tablero.html";

    } catch (err) {
        console.error("Error inesperado:", err);
        window.location.href = "login.html";
    }
});
