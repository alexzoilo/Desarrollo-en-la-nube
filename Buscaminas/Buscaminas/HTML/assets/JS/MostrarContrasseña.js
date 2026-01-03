// Mostrar/ocultar contraseñas
document.querySelectorAll(".toggle-password").forEach(btn => {
    btn.addEventListener("click", () => {
        const input = document.getElementById(btn.dataset.target);
        if (input.type === "password") {
            input.type = "text";
            btn.textContent = "🔒";
        } else {
            input.type = "password";
            btn.textContent = "🔓";
        }
    });
});