// JS/login.js
import { supabase } from "./supabaseClient.js";

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = form.nombre.value.trim();
    const password = form.password.value;

    try {
        const { data, error } = await supabase
            .from("Usuarios")
            .select("*")
            .eq("nombre", nombre)
            .single();

        if (error || !data) {
            alert("Usuario no encontrado");
            return;
        }

        const ok = await checkPassword(password, data.contraseña);
        if (!ok) {
            alert("Contraseña incorrecta");
            return;
        }

        alert("Login correcto");
        // Guardar info en localStorage (opcional)
        localStorage.setItem("usuarioId", data.id);
        localStorage.setItem("usuarioNombre", data.nombre);

        // Redirigir a la página de juego
        window.location.href = "tablero.html";
    } catch (err) {
        console.error(err);
        alert("Error en login: " + err.message);
    }
});

// Función para comparar contraseñas
async function checkPassword(raw, hashed) {
    const encoder = new TextEncoder();
    const data = encoder.encode(raw);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const rawHash = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
    return rawHash === hashed;
}
