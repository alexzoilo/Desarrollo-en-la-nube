import {
    supabase
} from './Supabaseclient.js';

document.addEventListener("DOMContentLoaded", async () => {

    try {
        const {
            data,
            error
        } = await supabase
            .from('Usuarios')
            .select('nombre, password')
            .limit(1);

        if (error) return;

        if (!data || data.length === 0) return;

        const usuario = data[0];

        const nombreInput = document.getElementById("nombreUsuario");
        const passwordInput = document.getElementById("passwordUsuario");

        nombreInput.value = usuario.nombre;
        passwordInput.value = usuario.password;


        document.querySelector(".boton-guardar").addEventListener("click", async () => {
            try {
                const {
                    error: updateError
                } = await supabase
                    .from('Usuarios')
                    .update({
                        nombre: nombreInput.value,
                        password: passwordInput.value
                    })
                    .eq('nombre', usuario.nombre);

                if (updateError) return;

                console.log("Datos guardados");
            } catch (err) {
                console.error("Error al guardar los datos:", err);
            }
        });



        document.querySelector(".boton-eliminar").addEventListener("click", async () => {
            const confirmar = confirm("¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.");
            if (!confirmar) return;

            try {
                const {
                    error: deleteError
                } = await supabase
                    .from('Usuarios')
                    .delete()
                    .eq('nombre', usuario.nombre);

                if (deleteError) {
                    console.error("Error al eliminar la cuenta:", deleteError);
                    return;
                }

                alert("Cuenta eliminada");
                window.location.href = "login.html";

            } catch (err) {
                console.error("Error al eliminar la cuenta:", err);
            }
        });

    } catch (err) {
        console.error("Error al cargar los datos:", err);
    }
});
