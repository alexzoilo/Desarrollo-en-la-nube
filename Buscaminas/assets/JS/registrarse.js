import {
    supabase
} from "../../supabase.js";

const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const password = document.getElementById("password").value;

    // 1️⃣ Crear usuario en Supabase Auth
    const {
        data,
        error
    } = await supabase.auth.signUp({
        email: `${nombre}@buscaminas.com`,
        password: password
    });

    if (error) {
        alert(error.message);
        return;
    }

    // 2️⃣ Guardar datos en tu tabla Usuarios
    await supabase.from("Usuarios").insert({
        id: data.user.id,
        nombre: nombre,
        partidasGanadas: 0,
        partidasPerdidas: 0
    });

    alert("Usuario registrado correctamente");
});
