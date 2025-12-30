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

            const target = boton.getAttribute("data-target");
            if (target) {
                window.location.href = target;
            }
        });
    });

    const paginaActual = window.location.pathname.split("/").pop();
    botones.forEach(boton => {
        if (boton.getAttribute("data-target") === paginaActual) {
            boton.classList.add("active");
            moverIndicador(boton);
        }
    });
});
