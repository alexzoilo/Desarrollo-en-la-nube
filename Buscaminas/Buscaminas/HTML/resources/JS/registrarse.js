import {
    supabase
} from '../JS/Supabaseclient';

import {
    tablero
} from "../../../HTML/tablero.html";

import {
    hashPassword
} from '../JS/hashPassword';

const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const password = document.getElementById("password").value;

    const hashed = await hashPassword(password);


    const {
        error
    } = await supabase.auth.signUp({
        email: `${nombre}@buscaminas.com`,
        password
    });

    if (error) {
        alert(error.message);
        return;
    }


    await supabase.from("Usuarios").insert({
        nombre: nombre,
        password: data.user.id
    });

    if (insertError) {
        alert(insertError.message);
        return;
    }

    window.location.href = tablero.html;
});
