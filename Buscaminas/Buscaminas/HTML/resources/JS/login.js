import {
    supabase
} from '../JS/Supabaseclient.js';

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value
        .trim()
        .toLowerCase();

    const password = document.getElementById("password").value;

    if (!nombre || !password) {
        alert("Debes completar todos los campos");
        return;
    }

    const email = `${nombre}@buscaminas.com`;

    const {
        data,
        error
    } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    console.log("Login OK:", data.user.email);
    window.location.href = "tablero.html";
});
