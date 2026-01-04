export function togglePassword() {
    document.querySelectorAll(".toggle-password").forEach(btn => {
        btn.addEventListener("click", () => {
            const input = document.getElementById(btn.dataset.target);
            if (!input) return;
            if (input.type === "password") {
                input.type = "text";
                btn.textContent = "🔓";
            } else {
                input.type = "password";
                btn.textContent = "🔒";
            }
        });
    });
}


export function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,6}$/;
    return re.test(email);
}
