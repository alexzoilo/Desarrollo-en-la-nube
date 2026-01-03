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
        // Login con Supabase Auth
        const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (loginError || !user) {
            console.error("Error login:", loginError);
            alert("Credenciales incorrectas");
            return;
        }

        console.log("Login correcto:", user);

        // Verificamos si el usuario ya existe en la tabla Usuarios
        const { data: usuarios, error: usuarioError } = await supabase
            .from("Usuarios")
            .select("*")
            .eq("id", user.id)
            .limit(1);

        if (usuarioError) {
            console.error("Error comprobando tabla Usuarios:", usuarioError);
            return;
        }

        // Si no existe, lo creamos
        if (!usuarios || usuarios.length === 0) {
            const { data: nuevoUsuario, error: crearError } = await supabase
                .from("Usuarios")
                .insert([{ id: user.id, nombre, password }]); // opcionalmente guarda hash real
            if (crearError) {
                console.error("Error creando usuario en BBDD:", crearError);
                return;
            }
            console.log("Usuario creado en tabla Usuarios:", nuevoUsuario);
        }

        // Redirigimos a tablero
        window.location.href = "tablero.html";

    } catch (err) {
        console.error("Error inesperado:", err);
        window.location.href = "login.html";
    }
});
