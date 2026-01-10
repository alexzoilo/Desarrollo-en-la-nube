import { Buscaminas } from "./Clases/Buscaminas.js";
import { Dificultad } from "./Clases/Dificultad.js";
import { DAOBuscaminas } from "./DAO/DaoBuscaminas.js";
import { supabase } from "./Supabaseclient.js";
import { mostrarMensaje, ocultarMensaje } from './extras/mensajes.js';

document.addEventListener("DOMContentLoaded", () => {

    const dao = new DAOBuscaminas();
    let juego = null;
    let filas = 9;
    let columnas = 9;
    let dificultadActual = "FACIL";
    let juegoPausado = false;
    let segundosTotales = 0;
    let timerInterval = null;

    const tableroDiv = document.getElementById("tablero");
    const selectDificultad = document.getElementById("dificultad");
    const temporizadorSpan = document.getElementById("temporizador");
    const btnControl = document.getElementById("btnControl");
    const btnListaPartidas = document.getElementById('btnListaPartidas');

    // Formatea el cronómetro
    function formatTiempo(s) {
        const h = String(Math.floor(s / 3600)).padStart(2, "0");
        const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
        const ss = String(s % 60).padStart(2, "0");
        return `Cronometro: ${h}:${m}:${ss}`;
    }

    function ajustarFilasColumnas(dif) {
        dificultadActual = dif;
        filas = columnas = dif === "FACIL" ? 10 : dif === "MEDIO" ? 15 : 20;
        selectDificultad.value = dificultadActual;
    }

    async function obtenerUsuarioLogueado() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return null;
        return user.id;
    }

    function crearTableroHTML() {
        tableroDiv.innerHTML = "";
        tableroDiv.style.gridTemplateColumns = `repeat(${columnas}, 40px)`;
        for (let i = 0; i < filas; i++) {
            for (let j = 0; j < columnas; j++) {
                const c = document.createElement("div");
                c.className = "celda";
                c.onclick = () => clickCelda(i, j);
                tableroDiv.appendChild(c);
            }
        }
    }

    function actualizarTablero() {
        if (!juego) return;
        for (let i = 0; i < filas; i++) {
            for (let j = 0; j < columnas; j++) {
                const c = tableroDiv.children[i * columnas + j];
                c.textContent = "";
                c.classList.remove("revelada");
                if (juego.descubiertas[i][j]) {
                    c.classList.add("revelada");
                    if (juego.tablero[i][j] === -1) c.textContent = "💣";
                    else if (juego.tablero[i][j] > 0) c.textContent = juego.tablero[i][j];
                }
            }
        }
    }

    function iniciarTemporizador() {
        temporizadorSpan.textContent = formatTiempo(segundosTotales);
        timerInterval = setInterval(() => {
            segundosTotales++;
            temporizadorSpan.textContent = formatTiempo(segundosTotales);
        }, 1000);
    }

    function detenerTemporizador() {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    async function iniciarJuego(dificultad) {
        const usuarioId = await obtenerUsuarioLogueado();
        if (!usuarioId) {
            mostrarMensaje("Debes iniciar sesión para jugar");
            return;
        }

        ajustarFilasColumnas(dificultad);

        // Si ya hay un juego cargado, no crear otra partida
        if (!juego) {
            juego = new Buscaminas(usuarioId, filas, columnas, Dificultad[dificultad]);
            try {
                await dao.crearPartida(juego);
            } catch (e) {
                console.error("Error creando la partida:", e);
                mostrarMensaje("No se pudo crear la partida.");
                juego = null;
                return;
            }
        }

        crearTableroHTML();
        actualizarTablero();
        iniciarTemporizador();

        btnControl.textContent = "⏸ Pausar";
        selectDificultad.disabled = true; // Bloquea dificultad al iniciar
        ocultarMensaje();
    }

    function clickCelda(f, c) {
        if (!juego || juegoPausado) return;

        const ok = juego.descubrir(f, c);
        actualizarTablero();

        if (!ok) finalizar("💥 Has perdido", "error");
        else if (juego.verificarVictoria()) finalizar("🏆 Has ganado", "correcto");
    }

    async function finalizar(msg, tipo = "info") {
        detenerTemporizador();
        mostrarMensaje(msg, tipo);

        if (juego?.id) {
            try { await dao.finalizarPartida(juego.id); } 
            catch (e) { console.error("Error finalizando partida:", e); }
        }

        juego = null;
        btnControl.textContent = "▶ Iniciar";
        selectDificultad.disabled = false; // Permite cambiar dificultad
    }

    btnControl.addEventListener("click", async () => {
        if (!juego) {
            await iniciarJuego(selectDificultad.value);
            return;
        }

        if (!juegoPausado) {
            juegoPausado = true;
            detenerTemporizador();
            btnControl.textContent = "▶ Reanudar";
            mostrarMensaje("⏸ Juego en pausa", "info");
        } else {
            juegoPausado = false;
            iniciarTemporizador();
            btnControl.textContent = "⏸ Pausar";
            selectDificultad.disabled = true;
            ocultarMensaje();
        }
    });

    btnListaPartidas?.addEventListener('click', () => {
        window.location.href = 'cargarPartida.html';
    });

    // === Cargar partida si existe ID ===
    const cargarPartidaId = sessionStorage.getItem('cargarPartidaId');
    if (cargarPartidaId) {
        cargarPartida(cargarPartidaId);
    }

    async function cargarPartida(idPartida) {
        try {
            const { data: partida, error } = await supabase
                .from('Buscaminas')
                .select('*')
                .eq('id', idPartida)
                .single();

            if (error || !partida) {
                mostrarMensaje('No se pudo cargar la partida', 'error');
                return;
            }

            juego = new Buscaminas(
                partida.usuarioId,
                partida.filas,
                partida.columnas,
                partida.dificultad
            );

            // Restaurar estado
            juego.id = partida.id;  // Muy importante: evita crear otra partida
            juego.tablero = partida.tablero;
            juego.descubiertas = partida.celdasDescubiertas;
            juego.minas = partida.minas;
            juego.totalCeldas = partida.totalCeldas || partida.filas * partida.columnas;

            filas = partida.filas;
            columnas = partida.columnas;
            dificultadActual = partida.dificultad;

            selectDificultad.value = dificultadActual;
            selectDificultad.disabled = false; // Permite cambiar antes de iniciar

            crearTableroHTML();
            actualizarTablero();

            mostrarMensaje('Partida cargada. Puedes cambiar la dificultad antes de iniciar.', 'info');

        } catch (e) {
            console.error('Error cargando partida:', e);
            mostrarMensaje('Error al cargar la partida', 'error');
        } finally {
            sessionStorage.removeItem('cargarPartidaId');
        }
    }

});
