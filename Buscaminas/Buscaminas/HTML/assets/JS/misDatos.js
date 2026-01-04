import { supabase } from './Supabaseclient.js';
import { mostrarMensaje } from './extras/mensajes.js';

document.addEventListener("DOMContentLoaded", async () => {

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        window.location.href = "login.html";
        return;
    }

    const userId = user.id;

    const { data: usuario, error: userError } = await supabase
        .from("Usuarios")
        .select("nombre, email")
        .eq("id", userId)
        .single();

    if (userError || !usuario) {
        mostrarMensaje("No se pudieron cargar tus datos", "error");
        return;
    }

    const nombreInput = document.getElementById("nombreUsuario");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("passwordUsuario");

    nombreInput.value = usuario.nombre;
    emailInput.value = usuario.email;

    document.querySelector(".boton-guardar").addEventListener("click", async () => {

        const { error: updateError } = await supabase
            .from("Usuarios")
            .update({ nombre: nombreInput.value })
            .eq("id", userId);

        if (updateError) {
            mostrarMensaje("Error al actualizar nombre", "error");
            return;
        }

        if (emailInput.value !== user.email) {
            const { error: emailError } = await supabase.auth.updateUser({
                email: emailInput.value
            });

            if (emailError) {
                mostrarMensaje(emailError.message, "error");
                return;
            }

            mostrarMensaje("Revisa tu email para confirmar el cambio", "info");
        }

        if (passwordInput.value.length >= 6) {
            const { error: passError } = await supabase.auth.updateUser({
                password: passwordInput.value
            });

            if (passError) {
                mostrarMensaje(passError.message, "error");
                return;
            }
        }

        mostrarMensaje("Datos actualizados correctamente", "success");
        passwordInput.value = "";
    });

    document.querySelector(".boton-eliminar").addEventListener("click", async () => {
        if (!confirm("¿Seguro que deseas eliminar tu cuenta?")) return;

        await supabase.from("Usuarios").delete().eq("id", userId);
        await supabase.auth.signOut();

        window.location.href = "login.html";
    });
});
