import {
    supabase
} from '../JS/Supabaseclient.js';

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1️⃣ Leer datos
    const nombre = document.getElementById("nombre").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    // 2️⃣ Validar campos
    if (!nombre || !password) {
        alert("Debes completar todos los campos");
        return;
    }

    // 3️⃣ Generar email interno
    const email = `${nombre}@buscaminas.com`;

    // 4️⃣ Intentar login en Supabase Auth
    const {
        data,
        error
    } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    // 5️⃣ Si falla → usuario no existe o password incorrecta
    if (error) {
        console.error("Login fallido:", error.message);
        alert("Usuario o contraseña incorrectos");
        return;
    }

    // 6️⃣ Login correcto
    console.log("Login correcto:", data.user);

    // 7️⃣ Redirigir al tablero
    window.location.href = "tablero.html";
});
