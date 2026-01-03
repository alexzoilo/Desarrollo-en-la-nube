import { supabase } from './Supabaseclient.js';

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
        // 1️⃣ Login con Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error("Error login:", error);
            alert("Credenciales incorrectas");
            return;
        }

        const usuarioId = data.user.id; // ✅ UUID del usuario desde Auth

        // 2️⃣ Opcional: verificar que exista en tabla Usuarios
        const { data: usuarioDB, error: usuarioError } = await supabase
            .from("Usuarios")
            .select("*")
            .eq("id", usuarioId)
            .single();

        if (usuarioError || !usuarioDB) {
            alert("Usuario no encontrado en la base de datos");
            console.error(usuarioError);
            return;
        }

        // 3️⃣ Guardar en sessionStorage para usar en tablero.js
        sessionStorage.setItem("usuarioActual", JSON.stringify({
            id: usuarioId,
            nombre: usuarioDB.nombre
        }));

        console.log("Login correcto:", usuarioDB);

        // 4️⃣ Redirigir a tablero
        window.location.href = "tablero.html";

    } catch (err) {
        console.error("Error inesperado:", err);
        alert("Ocurrió un error, intenta de nuevo");
    }
});
