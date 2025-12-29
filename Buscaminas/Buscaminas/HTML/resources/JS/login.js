import {
    supabase
} from '../JS/Supabaseclient';

import {
    tablero
} from "../../../HTML/tablero.html";

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const password = document.getElementById("password").value;

    const {
        error
    } = await supabase.auth.signInWithPassword({
        email: `${nombre}@buscaminas.com`,
        password: password
    });

    if (error) {
        alert("Credenciales incorrectas");
    } else {
        window.location.href = tablero;
    }
});
