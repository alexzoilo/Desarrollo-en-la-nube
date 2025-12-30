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
            document.querySelector(".nav-btn.active")?.classList.remove("active");
            boton.classList.add("active");
            moverIndicador(boton);

            const texto = boton.textContent.trim().toLowerCase();
            if (texto === "mis datos") {
                window.location.href = "misDatos.html";
            } else if (texto === "ayuda") {
                window.location.href = "ayuda.html";
            }
        });
    });

    // Detectar página actual y marcar el botón correcto
    const pagina = window.location.pathname.split("/").pop().toLowerCase();
    botones.forEach(boton => {
        const texto = boton.textContent.trim().toLowerCase();
        if ((pagina === "misdatos.html" && texto === "mis datos") ||
            (pagina === "ayuda.html" && texto === "ayuda") ||
            (pagina === "tablero.html" && texto === "jugar partida")) {
            boton.classList.add("active");
            moverIndicador(boton);
        }
    });
});
