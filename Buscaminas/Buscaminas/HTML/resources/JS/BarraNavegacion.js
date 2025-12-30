document.addEventListener("DOMContentLoaded", () => {
    const botones = document.querySelectorAll(".nav-btn");
    const indicador = document.querySelector(".indicador");

    function moverIndicador(boton) {
        const extra = 20;
        indicador.style.width = boton.offsetWidth + extra + "px";
        indicador.style.left = boton.offsetLeft - extra / 2 + "px";
    }

    botones.forEach(boton => {
        boton.addEventListener("click", () => {
            // Cambiar la clase activa
            document.querySelector(".nav-btn.active")?.classList.remove("active");
            boton.classList.add("active");
            moverIndicador(boton);

            // Redirecciones solo para "Mis datos" y "Ayuda"
            const texto = boton.textContent.trim().toLowerCase();
            if (texto === "mis datos") {
                window.location.href = "misDatos.html";
            } else if (texto === "ayuda") {
                window.location.href = "ayuda.html";
            }
            // "Jugar partida" se queda en esta página, no hace nada
        });
    });

    // Inicializar indicador
    const activo = document.querySelector(".nav-btn.active");
    if (activo) moverIndicador(activo);
});
