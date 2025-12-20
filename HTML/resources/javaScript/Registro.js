// JS/register.js
import { supabase } from "./supabase";

const form = document.getElementById("registroForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = form.nombre.value.trim();
    const password = form.password.value;
    const repeatPassword = form.repeatpassword.value;

    if (password !== repeatPassword) {
        alert("Las contraseñas no coinciden");
        return;
    }

    try {
        const hashedPassword = await hashPassword(password);

        const { data, error } = await supabase
            .from("Usuarios")
            .insert({
                nombre,
                contraseña: hashedPassword,
                partidasGanadas: 0,
                partidasPerdidas: 0,
                tiempoTotalJugado: 0,
                tiempoUltimaPartida: null
            })
            .select("id")
            .single();

        if (error) throw error;

        alert("Usuario creado correctamente. Ahora puedes iniciar sesión.");
        window.location.href = "login.html";
    } catch (err) {
        console.error(err);
        alert("Error al registrar usuario: " + err.message);
    }
});

// Función para hashear la contraseña en SHA-256
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}
