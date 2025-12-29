import {
    supabase
} from '../JS/Supabaseclient.js';

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const password = document.getElementById("password").value;

    const {
        data,
        error
    } = await supabase.auth.signInWithPassword({
        email: `${nombre}@buscaminas.com`,
        password
    });

    if (error) {
        alert("Credenciales incorrectas");
        return;
    }

    console.log("Login correcto:", data);

    // Redirigir al tablero
    window.location.href = "tablero.html";
});
