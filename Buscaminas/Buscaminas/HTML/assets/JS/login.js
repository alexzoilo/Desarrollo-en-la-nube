import { supabase } from './Supabaseclient.js';
import { mostrarMensaje, ocultarMensaje } from './extras/mensajes.js';
import { togglePassword, validarEmail } from './extras/Comprobaciones.js';


const form = document.getElementById("loginForm");

togglePassword();

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    ocultarMensaje();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        mostrarMensaje("Debes completar todos los campos", "error");
        return;
    }

    if (!validarEmail(email)) {
        mostrarMensaje("Ingresa un email válido (ej: pepe@gmail.com)", "error");
        return;
    }

    try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (authError || !authData.user) {
            mostrarMensaje("Credenciales incorrectas", "error");
            console.error("Error login:", authError);
            return;
        }

        const { data: usuarioDB, error: usuarioError } = await supabase
            .from("Usuarios")
            .select("*")
            .eq("id", authData.user.id)
            .single();

        if (usuarioError || !usuarioDB) {
            mostrarMensaje("El usuario no existe", "error");
            console.error("Error usuarioDB:", usuarioError);
            return;
        }

        sessionStorage.setItem("usuarioActual", JSON.stringify({
            id: authData.user.id,
            nombre: usuarioDB.nombre,
            email: email
        }));

        window.location.href = "tablero.html";

    } catch (err) {
        console.error("Error inesperado:", err);
        mostrarMensaje("Ocurrió un error, intenta de nuevo", "error");
    }
});
