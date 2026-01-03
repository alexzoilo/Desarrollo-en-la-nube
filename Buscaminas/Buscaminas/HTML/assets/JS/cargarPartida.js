
btnGuardar.onclick = async () => {
    try {
        // 1️⃣ Obtener usuario logueado
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            mostrarMensaje("❌ Debes iniciar sesión");
            return;
        }

        const usuarioId = user.id;

        // 2️⃣ Consultar partidas del usuario
        const partidas = await dao.listarPartidas(usuarioId);
        if (!partidas || partidas.length === 0) {
            mostrarMensaje("❌ No tienes partidas guardadas");
            return;
        }

        // 3️⃣ Mostrar lista de partidas
        const listaDiv = document.createElement("div");
        listaDiv.className = "lista-partidas";

        partidas.forEach(p => {
            const btn = document.createElement("button");
            btn.textContent = `Partida ${p.id.slice(0, 8)} | ${p.dificultad} | ${new Date(p.tiempoInicio).toLocaleString()}`;
            btn.onclick = () => cargarPartida(p, usuarioId); // pasamos usuarioId
            listaDiv.appendChild(btn);
        });

        tableroDiv.innerHTML = "";
        tableroDiv.appendChild(listaDiv);

    } catch (e) {
        console.error("Error cargando partidas:", e);
        mostrarMensaje("❌ Error al cargar partidas");
    }
};

// ---------------- FUNCION PARA CARGAR UNA PARTIDA ----------------
function cargarPartida(partida, usuarioId) {
    if (juego) {
        detenerTemporizador();
        juego = null;
    }

    juego = new Buscaminas(
        usuarioId,
        partida.filas,
        partida.columnas,
        Dificultad[partida.dificultad]
    );

    juego.id = partida.id;
    juego.tablero = partida.tablero;
    juego.descubiertas = partida.celdasDescubiertas;
    juego.minas = partida.minas;

    filas = partida.filas;
    columnas = partida.columnas;
    dificultadActual = partida.dificultad;

    crearTableroHTML();
    actualizarTablero();

    segundosTotales = 0;
    iniciarTemporizador();

    btnControl.textContent = "⏸ Pausar";
    selectDificultad.disabled = true;
    ocultarMensaje();
}