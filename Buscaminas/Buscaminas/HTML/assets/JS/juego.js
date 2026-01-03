import { supabase } from "./Supabaseclient.js";
import { Buscaminas } from "./Clases/Buscaminas.js";
import { Dificultad } from "./Clases/Dificultad.js";
import { DAOBuscaminas } from "./DAO/DaoBuscaminas.js";

const dao = new DAOBuscaminas();

let juego = null;
let partidaId = null;
let timerInterval = null;

let filas = 9;
let columnas = 9;
let dificultadActual = "FACIL";
let juegoPausado = false;
let segundosTotales = 0;

const tableroDiv = document.getElementById("tablero");
const selectDificultad = document.getElementById("dificultad");
const temporizadorSpan = document.getElementById("temporizador");
const mensajeDiv = document.getElementById("mensaje");
const btnControl = document.getElementById("btnControl");

/* =========================
   UTILIDADES
========================= */

function ajustarFilasColumnas(dificultad) {
    dificultadActual = dificultad;
    if (dificultad === "FACIL") { filas = 10; columnas = 10; }
    if (dificultad === "MEDIO") { filas = 15; columnas = 15; }
    if (dificultad === "DIFICIL") { filas = 20; columnas = 20; }
}

function formatTiempo(segundos) {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

function mostrarMensaje(txt, clase = "") {
    mensajeDiv.textContent = txt;
    mensajeDiv.className = clase;
}

function ocultarMensaje() {
    mensajeDiv.textContent = "";
    mensajeDiv.className = "";
}

/* =========================
   TABLERO
========================= */

function crearTableroHTML() {
    tableroDiv.innerHTML = "";
    tableroDiv.style.gridTemplateColumns = `repeat(${columnas}, 40px)`;

    for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
            const d = document.createElement("div");
            d.classList.add("celda");
            d.dataset.fila = i;
            d.dataset.col = j;

            d.addEventListener("click", () => clickCelda(i, j));
            tableroDiv.appendChild(d);
        }
    }
}

function actualizarTablero() {
    for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
            const celda = tableroDiv.children[i * columnas + j];
            celda.textContent = "";
            celda.className = "celda";

            if (juego.descubiertas[i][j]) {
                celda.classList.add("revelada");
                if (juego.tablero[i][j] === -1) celda.textContent = "💣";
                else if (juego.tablero[i][j] > 0) celda.textContent = juego.tablero[i][j];
            }
        }
    }
}

/* =========================
   TEMPORIZADOR
========================= */

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

/* =========================
   JUEGO
========================= */

async function iniciarJuego(dificultad) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    ajustarFilasColumnas(dificultad);

    juego = new Buscaminas(
        null,
        filas,
        columnas,
        Dificultad[dificultadActual]
    );

    crearTableroHTML();
    actualizarTablero();
    iniciarTemporizador();
    ocultarMensaje();

    const partida = await dao.crearPartida({
        usuarioId: user.id,
        filas,
        columnas,
        totalCeldas: filas * columnas,
        dificultad: dificultadActual,
        tablero: juego.tablero,
        minas: juego.minas,
        descubiertas: juego.descubiertas
    });

    partidaId = partida.id;
}

async function clickCelda(fila, col) {
    if (!juego || juegoPausado) return;

    const ok = juego.descubrir(fila, col);
    actualizarTablero();

    await dao.guardarPartida(
        partidaId,
        juego.tablero,
        juego.descubiertas
    );

    if (!ok) perder();
    else if (juego.verificarVictoria()) ganar();
}

async function perder() {
    detenerTemporizador();
    mostrarMensaje("💥 Has perdido", "perdido");
    await dao.finalizarPartida(partidaId);
    resetJuego();
}

async function ganar() {
    detenerTemporizador();
    mostrarMensaje("🏆 Has ganado", "ganado");
    await dao.finalizarPartida(partidaId);
    resetJuego();
}

function resetJuego() {
    juego = null;
    partidaId = null;
    segundosTotales = 0;
}

/* =========================
   CARGAR PARTIDA ACTIVA
========================= */

window.onload = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const partida = await dao.cargarPartidaActiva(user.id);
    if (!partida) return;

    filas = partida.filas;
    columnas = partida.columnas;
    dificultadActual = partida.dificultad;
    partidaId = partida.id;

    juego = new Buscaminas(
        partida.id,
        filas,
        columnas,
        Dificultad[dificultadActual]
    );

    juego.tablero = partida.tablero;
    juego.minas = partida.minas;
    juego.descubiertas = partida.celdasDescubiertas;

    crearTableroHTML();
    actualizarTablero();
    iniciarTemporizador();
};

/* =========================
   BOTÓN
========================= */

btnControl.addEventListener("click", () => {
    if (!juego) iniciarJuego(selectDificultad.value);
});
