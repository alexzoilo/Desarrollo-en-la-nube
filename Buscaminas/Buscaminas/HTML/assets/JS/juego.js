// juego.js
import { supabase } from './Supabaseclient.js';
import { Buscaminas } from './Clases/Buscaminas.js';
import { Dificultad } from './Clases/Dificultad.js';
import { DAOBuscaminas } from './DAO/DaoBuscaminas.js';

const dao = new DAOBuscaminas();

let juego = null;
let filas = 9;
let columnas = 9;
let dificultadActual = "FACIL";
let timerInterval = null;
let segundosTotales = 0;
let juegoPausado = false;

const tableroDiv = document.getElementById('tablero');
const selectDificultad = document.getElementById('dificultad');
const temporizadorSpan = document.getElementById('temporizador');
const mensajeDiv = document.getElementById('mensaje');
const btnControl = document.getElementById('btnControl');
const btnGuardar = document.getElementById('btnGuardar');

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

function formatTiempo(s) {
    const h = String(Math.floor(s / 3600)).padStart(2,"0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2,"0");
    const ss = String(s % 60).padStart(2,"0");
    return `Cronometro: ${h} : ${m} : ${ss}`;
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

/* ================= TEMPORIZADOR ================= */
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

/* ================= USUARIO ================= */
async function obtenerUsuarioLogueado() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
        mostrarMensaje("❌ Usuario no logueado");
        return null;
    }
    return data.user.id; // UUID del usuario
}

/* ================= PARTIDA ================= */
async function iniciarJuego(dif) {
    ajustarFilasColumnas(dif);
    const usuarioId = await obtenerUsuarioLogueado();
    if (!usuarioId) return;

    juego = new Buscaminas(null, filas, columnas, Dificultad[dif]);
    juego.usuarioId = usuarioId;

    // Crear partida en BBDD
    await dao.crearPartida(juego);

    crearTableroHTML();
    actualizarTablero();
    iniciarTemporizador();
    ocultarMensaje();
    btnControl.textContent = "⏸ Pausar";
    segundosTotales = 0;
}

function clickCelda(f, c) {
    if (!juego || juegoPausado) return;

    const ok = juego.descubrir(f, c);
    actualizarTablero();

    if (!ok) finalizar("💥 Has perdido");
    else if (juego.verificarVictoria()) finalizar("🏆 Has ganado");
}

async function finalizar(msg) {
    detenerTemporizador();
    mostrarMensaje(msg);
    if (juego) {
        await dao.finalizarPartida(juego.id);
        juego = null;
    }
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
    const usuarioId = await obtenerUsuarioLogueado();
    if (!usuarioId) return;

    const data = await dao.findPartidaActiva(usuarioId);
    if (!data) return;

    dificultadActual = data.dificultad;
    filas = data.filas;
    columnas = data.columnas;
    segundosTotales = 0; // opcional, puedes guardarlo en json si quieres
    juegoPausado = false;

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
    if (!juego) {
        iniciarJuego(selectDificultad.value);
        return;
    }

    if (!juegoPausado) {
        juegoPausado = true;
        detenerTemporizador();
        btnControl.textContent = "▶ Reanudar";
        mostrarMensaje("⏸ Juego en pausa");
    } else {
        juegoPausado = false;
        iniciarTemporizador();
        btnControl.textContent = "⏸ Pausar";
        ocultarMensaje();
    }
};
