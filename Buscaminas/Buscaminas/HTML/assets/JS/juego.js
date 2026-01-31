import { Buscaminas } from "./Clases/Buscaminas.js";
import { Dificultad } from "./Clases/Dificultad.js";
import { DAOBuscaminas } from "./DAO/DaoBuscaminas.js";
import { supabase } from "./Supabaseclient.js";
import { mostrarMensaje, ocultarMensaje } from './extras/mensajes.js';

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

const niveles = ["FACIL", "MEDIO", "DIFICIL"];

// ---------------------- Funciones Auxiliares ----------------------
function obtenerSiguienteDificultad(ganado) {
    let index = niveles.indexOf(dificultadActual);
    if (ganado && index < niveles.length - 1) index++;
    else if (!ganado && index > 0) index--;
    return niveles[index];
}

function formatTiempo(s) {
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `Cronómetro: ${h}:${m}:${ss}`;
}

function ajustarFilasColumnas(dif) {
    dificultadActual = dif;
    filas = columnas = dif === "FACIL" ? 10 : dif === "MEDIO" ? 15 : 20;
    selectDificultad.value = dificultadActual;
}

async function obtenerUsuarioLogueado() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) { console.error("Error obteniendo usuario:", error); return null; }
    if (!user) { console.warn("No hay usuario logueado"); return null; }
    return user.id;
}

// ---------------------- Tablero ----------------------
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

// ---------------------- Temporizador ----------------------
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

// ---------------------- Juego ----------------------
async function iniciarJuego(dificultad) {
    const usuarioId = await obtenerUsuarioLogueado();
    if (!usuarioId) { mostrarMensaje("Debes iniciar sesión para jugar"); return; }

    ajustarFilasColumnas(dificultad);
    selectDificultad.disabled = true;

    juego = new Buscaminas(usuarioId, filas, columnas, Dificultad[dificultad]);

    try {
        await dao.crearPartida(juego);
    } catch (e) {
        console.error("Error creando partida:", e);
        mostrarMensaje("No se pudo crear la partida.");
        juego = null;
        selectDificultad.disabled = false;
        return;
    }

    crearTableroHTML();
    actualizarTablero();
    segundosTotales = 0;
    iniciarTemporizador();
    juegoPausado = false;
    btnControl.textContent = "⏸ Pausar";
    ocultarMensaje();
}

function clickCelda(f, c) {
    if (!juego || juegoPausado) return;

    const ok = juego.descubrir(f, c);
    actualizarTablero();

    if (!ok) finalizar(false);
    else if (juego.verificarVictoria()) finalizar(true);
}

// ---------------------- Finalizar partida ----------------------
async function finalizar(ganado) {
    detenerTemporizador();

    const nuevaDificultad = obtenerSiguienteDificultad(ganado);

    mostrarMensaje(
        ganado ? `🏆 Nivel superado → ${nuevaDificultad}` : `💥 Bajas a ${nuevaDificultad}`,
        ganado ? "correcto" : "error"
    );
    setTimeout(() => ocultarMensaje(), 4000);

    if (juego?.id) {
        try { await dao.finalizarPartida(juego.id); } 
        catch (e) { console.error("Error finalizando partida:", e); }
    }

    dificultadActual = nuevaDificultad;
    selectDificultad.value = nuevaDificultad;

    juego = null;
    juegoPausado = false;
    segundosTotales = 0;
    btnControl.textContent = "▶ Iniciar";
    selectDificultad.disabled = false;
}

// ---------------------- Botones ----------------------
btnControl.addEventListener("click", async () => {
    if (!juego) { await iniciarJuego(selectDificultad.value); return; }

    if (!juegoPausado) {
        juegoPausado = true;
        detenerTemporizador();
        btnControl.textContent = "▶ Reanudar";
        mostrarMensaje("⏸ Juego en pausa", "info");
    } else {
        juegoPausado = false;
        iniciarTemporizador();
        btnControl.textContent = "⏸ Pausar";
        ocultarMensaje();
    }
});

btnListaPartidas.addEventListener('click', () => {
    window.location.href = 'cargarPartida.html';
});

// ---------------------- Cargar partida guardada ----------------------
const cargarPartidaId = sessionStorage.getItem('cargarPartidaId');
if (cargarPartidaId) cargarPartida(cargarPartidaId);

async function cargarPartida(idPartida) {
    try {
        const { data: partida, error } = await supabase
            .from('Buscaminas')
            .select('*')
            .eq('id', idPartida)
            .single();

        if (error || !partida) { mostrarMensaje('No se pudo cargar la partida', 'error'); return; }

        juego = new Buscaminas(partida.usuarioId, partida.filas, partida.columnas, partida.dificultad);
        juego.tablero = partida.tablero;
        juego.descubiertas = partida.celdasDescubiertas;
        juego.minas = partida.minas;
        juego.totalCeldas = partida.totalCeldas;

        filas = partida.filas;
        columnas = partida.columnas;
        dificultadActual = partida.dificultad;

        selectDificultad.value = dificultadActual;
        selectDificultad.disabled = true;

        crearTableroHTML();
        actualizarTablero();

        segundosTotales = partida.segundosTotales || 0;
        juegoPausado = false;
        btnControl.textContent = "⏸ Pausar";
        iniciarTemporizador();

        mostrarMensaje('Partida cargada. ¡A jugar!', 'info');
        setTimeout(() => ocultarMensaje(), 3000);

    } catch (e) {
        console.error('Error cargando partida:', e);
        mostrarMensaje('Error al cargar la partida', 'error');
    } finally {
        sessionStorage.removeItem('cargarPartidaId');
    }
}
