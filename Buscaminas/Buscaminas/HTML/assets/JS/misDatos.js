import {
    supabase
} from './Supabaseclient.js';
import {
    mostrarMensaje,
    ocultarMensaje
} from './extras/mensajes.js';
import {
    togglePassword
} from './extras/Comprobaciones.js';

document.addEventListener("DOMContentLoaded", async () => {
    togglePassword();

    const nombreInput = document.getElementById("nombreUsuario");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("passwordUsuario");
    const botonGuardar = document.querySelector(".boton-guardar");
    const botonEliminar = document.querySelector(".boton-eliminar");

    const modal = document.getElementById("modal-confirmacion");
    const btnConfirmar = document.getElementById("confirmar-eliminar");
    const btnCancelar = document.getElementById("cancelar-eliminar");


    const {
        data: {
            user
        },
        error: authError
    } = await supabase.auth.getUser();
    if (authError || !user) return window.location.href = "login.html";
    const userId = user.id;


    const {
        data: usuarioData,
        error: userError
    } = await supabase
        .from("Usuarios")
        .select("nombre, email")
        .eq("id", userId)
        .single();

    if (userError || !usuarioData) return mostrarMensaje("No se pudieron cargar tus datos", "error");

    const usuario = usuarioData;
    nombreInput.value = usuario.nombre;
    emailInput.value = usuario.email;
    emailInput.disabled = true;


    botonGuardar.addEventListener("click", async () => {
        ocultarMensaje();
        botonGuardar.disabled = true;
        botonEliminar.disabled = true;

        const nuevoNombre = nombreInput.value.trim();
        const nuevaPass = passwordInput.value.trim();

        if (!nuevoNombre) {
            mostrarMensaje("El nombre no puede estar vacío", "error");
            botonGuardar.disabled = false;
            botonEliminar.disabled = false;
            return;
        }

        if (nuevaPass.length > 0 && nuevaPass.length < 6) {
            mostrarMensaje("La contraseña debe tener al menos 6 caracteres", "error");
            botonGuardar.disabled = false;
            botonEliminar.disabled = false;
            return;
        }

        try {

            if (nuevoNombre !== usuario.nombre) {
                const {
                    error: nombreError
                } = await supabase
                    .from("Usuarios")
                    .update({
                        nombre: nuevoNombre
                    })
                    .eq("id", userId);
                if (nombreError) throw nombreError;
                usuario.nombre = nuevoNombre;
            }


            if (nuevaPass.length >= 6) {
                try {
                    await supabase.auth.updateUser({
                        password: nuevaPass
                    });
                } catch (err) {
                    if (!err.message.includes("La nueva contrasseña tiene que ser diferente a la antigua")) {
                        throw err;
                    } else {
                        mostrarMensaje("La nueva contrasseña tiene que ser diferente a la antigua", "info");
                    }
                }
            }

            passwordInput.value = "";
            mostrarMensaje("Datos actualizados correctamente", "success");

        } catch (err) {
            mostrarMensaje(err.message || "Error al actualizar los datos", "error");
            console.error(err);
        } finally {
            botonGuardar.disabled = false;
            botonEliminar.disabled = false;
        }
    });


    botonEliminar.addEventListener("click", () => {
        modal.style.display = "flex";
    });


    btnCancelar.addEventListener("click", () => {
        modal.style.display = "none";
    });


    btnConfirmar.addEventListener("click", async () => {
        modal.style.display = "none";
        botonGuardar.disabled = true;
        botonEliminar.disabled = true;
        ocultarMensaje();

        try {
            const response = await fetch('/api/DeleteUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId
                })
            });


            const text = await response.text();
            console.log("Respuesta cruda del servidor:", text);

            if (!response.ok) throw new Error(`Error HTTP ${response.status}`);

            let result;
            try {
                result = JSON.parse(text);
            } catch {
                throw new Error("La API no devolvió JSON válido");
            }

            if (result.error) throw new Error(result.error);


            await supabase.auth.signOut();
            window.location.href = "login.html";

        } catch (err) {
            console.error("Error eliminar usuario:", err);
            alert(err.message || "Error al eliminar la cuenta");
        } finally {
            botonGuardar.disabled = false;
            botonEliminar.disabled = false;
        }
    });

const btn = document.getElementById("btnDesplegar");
const panel = document.getElementById("panelDesplegable");

btn.addEventListener("click", () => {
    panel.classList.toggle("abierto");
});



});
