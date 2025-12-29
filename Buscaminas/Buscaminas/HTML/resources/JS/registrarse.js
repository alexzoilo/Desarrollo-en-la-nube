import {
    supabase
} from '../JS/Supabaseclient.js';

const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const password = document.getElementById("password").value;

    const {
        data,
        error
    } = await supabase.auth.signUp({
        email: `${nombre}@buscaminas.com`,
        password
    });

    if (error) {
        alert(error.message);
        return;
    }

    const {
        error: insertError
    } = await supabase.from("Usuarios").insert({
        nombre: nombre,
        password: data.user.id
    });

    if (insertError) {
        alert(insertError.message);
        return;
    }

    window.location.href = "tablero.html";
});