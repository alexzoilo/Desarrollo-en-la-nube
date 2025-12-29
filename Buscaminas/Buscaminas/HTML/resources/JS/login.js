import {
    supabase
} from './supabaseClient.js';

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

    // Comprobar que el usuario exista en la tabla (evita 400)
    const {
        data: userExists
    } = await supabase
        .from("Usuarios")
        .select("*")
        .eq("nombre", nombre)
        .eq("password", password)
        .single();

    if (!userExists) {
        alert("Usuario no registrado");
        return;
    }

    // Login en Supabase Auth
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

    // Redirigir al tablero
    window.location.href = "tablero.html";
});
