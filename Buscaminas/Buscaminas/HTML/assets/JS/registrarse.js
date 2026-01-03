import { supabase } from './Supabaseclient.js';

const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!nombre || !password) {
        alert("Debes completar todos los campos");
        return;
    }

    try {
        // 1️⃣ Registramos al usuario en Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email: `${nombre}@buscaminas.com`.toLowerCase(),
            password
        });

        if (error) {
            alert(error.message);
            return;
        }

        // 2️⃣ Insertamos en tabla Usuarios usando el mismo UUID de Auth
        const { error: insertError } = await supabase
            .from("Usuarios")
            .insert({
                id: data.user.id,  // ✅ Mismo UUID que Auth
                nombre: nombre,
                password: password, // opcional si quieres guardar la contraseña (Auth ya la gestiona)
                partidasGanadas: 0,
                partidasPerdidas: 0
            });

        if (insertError) {
            alert(insertError.message);
            return;
        }

        alert("Registro exitoso");
        window.location.href = "tablero.html";

    } catch (err) {
        console.error("Error inesperado:", err);
        alert("Ocurrió un error, intenta de nuevo");
    }
});
