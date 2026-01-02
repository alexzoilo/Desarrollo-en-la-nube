import { Buscaminas } from "./Clases/Buscaminas.js";
import { Dificultad } from "./Clases/Dificultad.js";
import { DAOBuscaminas } from "./DAO/DaoBuscaminas.js";

const dao = new DAOBuscaminas();
const usuarioId = 1; // usuario logueado

let juego = null;
let filas = 9;
let columnas = 9;
let dificultadActual = "FACIL";
let timerInterval = null;

const tableroDiv = document.getElementById("tablero");
const selectDificultad = document.getElementById("dificultad");
const mensajeDiv = document.getElementById("mensaje");
const btnControl = document.getElementById("btnControl");
const btnGuardar = document.getElementById("btnGuardar");

/* ================= UTILIDADES ================= */
function ajustarFilasColumnas(dif) {
    dificultadActual = dif;
    filas = columnas = dif === "FACIL" ? 10 : dif === "MEDIO" ? 15 : 20;
}

function mostrarMensaje(txt) {
    mensajeDiv.textContent = txt;
}

function ocultarMensaje() {
    mensajeDiv.textContent = "";
}

/* ================= TABLERO ================= */
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

/* ================= PARTIDA ================= */
async function iniciarJuego(dif) {
    ajustarFilasColumnas(dif);

    juego = new Buscaminas(null, filas, columnas, Dificultad[dif]);
    juego.usuarioId = usuarioId;

    await dao.crearPartida(juego); // solo crea partida con campos de la BBDD

    crearTableroHTML();
    actualizarTablero();
    btnControl.textContent = "⏸ Pausar";
}

function clickCelda(f, c) {
    if (!juego) return;

    const ok = juego.descubrir(f, c);
    actualizarTablero();

    if (!ok) finalizar("💥 Has perdido");
    else if (juego.verificarVictoria()) finalizar("🏆 Has ganado");
}

async function finalizar(msg) {
    mostrarMensaje(msg);
    await dao.finalizarPartida(juego.id);
    juego = null;
    btnControl.textContent = "▶ Iniciar";
}

/* ================= GUARDAR ================= */
btnGuardar.onclick = async () => {
    if (!juego) return mostrarMensaje("❌ No hay partida");
    await dao.guardarPartida(juego.id, juego.descubiertas, juego.tablero);
    mostrarMensaje("💾 Partida guardada");
};

/* ================= CARGAR ================= */
async function cargarPartida() {
    const data = await dao.findPartidaActiva(usuarioId);
    if (!data) return;

    dificultadActual = data.dificultad;
    filas = data.filas;
    columnas = data.columnas;

    juego = new Buscaminas(null, filas, columnas, Dificultad[dificultadActual]);
    juego.id = data.id;
    juego.tablero = data.tablero;
    juego.descubiertas = data.celdasDescubiertas;
    juego.minas = data.minas;

    crearTableroHTML();
    actualizarTablero();
}

window.onload = cargarPartida;

/* ================= BOTÓN CONTROL ================= */
btnControl.onclick = () => {
    if (!juego) iniciarJuego(selectDificultad.value);
};
