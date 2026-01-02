import { supabase } from "./Supabaseclient.js";
import { Buscaminas } from "./Clases/Buscaminas.js";
import { Dificultad } from "./Clases/Dificultad.js";
import { DAOBuscaminas } from "./DAO/DaoBuscaminas.js";

const dao = new DAOBuscaminas();
let usuarioId = null; // se obtiene dinámicamente

/* ================= ESTADO ================= */
let juego = null;
let filas = 9;
let columnas = 9;
let dificultadActual = "FACIL";
let juegoPausado = false;
let segundosTotales = 0;
let timerInterval = null;

/* ================= ELEMENTOS ================= */
const tableroDiv = document.getElementById("tablero");
const selectDificultad = document.getElementById("dificultad");
const temporizadorSpan = document.getElementById("temporizador");
const mensajeDiv = document.getElementById("mensaje");
const btnControl = document.getElementById("btnControl");
const btnGuardar = document.getElementById("btnGuardar");

/* ================= UTILIDADES ================= */
function ajustarFilasColumnas(dif) {
    dificultadActual = dif;
    if (dif === "FACIL") filas = columnas = 10;
    else if (dif === "MEDIO") filas = columnas = 15;
    else if (dif === "DIFICIL") filas = columnas = 20;

    selectDificultad.value = dificultadActual;
}

function formatTiempo(segundos) {
    const h = String(Math.floor(segundos / 3600)).padStart(2, "0");
    const m = String(Math.floor((segundos % 3600) / 60)).padStart(2, "0");
    const s = String(segundos % 60).padStart(2, "0");
    return `Cronometro: ${h} : ${m} : ${s}`;
}

function mostrarMensaje(txt, tipo = "") {
    mensajeDiv.textContent = txt;
    mensajeDiv.className = tipo;
}

function ocultarMensaje() {
    mensajeDiv.textContent = "";
    mensajeDiv.className = "";
}

/* ================= TABLERO ================= */
function crearTableroHTML() {
    tableroDiv.innerHTML = "";
    tableroDiv.style.gridTemplateColumns = `repeat(${columnas}, 40px)`;
    tableroDiv.style.gridTemplateRows = `repeat(${filas}, 40px)`;

    for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
            const celda = document.createElement("div");
            celda.className = "celda";
            celda.dataset.fila = i;
            celda.dataset.col = j;
            celda.addEventListener("click", () => clickCelda(i, j));
            celda.addEventListener("contextmenu", (e) => handleRightClick(e, celda));
            tableroDiv.appendChild(celda);
        }
    }
}

function actualizarTablero() {
    for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
            const celda = tableroDiv.children[i * columnas + j];
            celda.textContent = "";
            celda.classList.remove("revelada", "bandera");

            if (juego && juego.descubiertas[i][j]) {
                celda.classList.add("revelada");
                if (juego.tablero[i][j] === -1) celda.textContent = "💣";
                else if (juego.tablero[i][j] > 0) celda.textContent = juego.tablero[i][j];
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
    selectDificultad.disabled = true;
}

function detenerTemporizador() {
    clearInterval(timerInterval);
    timerInterval = null;
    selectDificultad.disabled = false;
}

/* ================= PARTIDA ================= */
async function iniciarJuego(dif) {
    if (!usuarioId) {
        mostrarMensaje("❌ Usuario no logueado");
        return;
    }

    ajustarFilasColumnas(dif);

    juego = new Buscaminas(null, filas, columnas, Dificultad[dif]);
    juego.usuarioId = usuarioId;

    // Crear partida en Supabase
    await dao.crearPartida(juego);

    crearTableroHTML();
    actualizarTablero();
    iniciarTemporizador();
    ocultarMensaje();
    juegoPausado = false;
    segundosTotales = 0;
    btnControl.textContent = "⏸ Pausar";
}

function clickCelda(fila, col) {
    if (!juego || juegoPausado) return;

    const exito = juego.descubrir(fila, col);
    actualizarTablero();

    if (!exito) perderJuego();
    else if (juego.verificarVictoria()) ganarNivel();
}

function handleRightClick(e, celda) {
    e.preventDefault();
    if (!juego || celda.classList.contains("revelada") || juegoPausado) return;
    celda.classList.toggle("bandera");
}

async function perderJuego() {
    detenerTemporizador();
    mostrarMensaje("💥 Has perdido", "perdido");

    // Revelar bombas
    for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
            if (juego.tablero[i][j] === -1) {
                const celda = tableroDiv.children[i * columnas + j];
                celda.textContent = "💣";
                celda.classList.add("revelada");
            }
        }
    }

    // Ajustar dificultad
    if (dificultadActual === "DIFICIL") dificultadActual = "MEDIO";
    else if (dificultadActual === "MEDIO") dificultadActual = "FACIL";
    selectDificultad.value = dificultadActual;

    await dao.finalizarPartida(juego.id);
    juego = null;
    btnControl.textContent = "▶ Iniciar";
}

async function ganarNivel() {
    detenerTemporizador();
    mostrarMensaje("🏆 Has ganado! Subiendo de nivel", "ganado");

    if (dificultadActual === "FACIL") dificultadActual = "MEDIO";
    else if (dificultadActual === "MEDIO") dificultadActual = "DIFICIL";
    selectDificultad.value = dificultadActual;

    setTimeout(() => {
        juego = null;
        iniciarJuego(dificultadActual);
        ocultarMensaje();
    }, 1200);
}

/* ================= BOTONES ================= */
btnControl.addEventListener("click", () => {
    if (!juego) iniciarJuego(selectDificultad.value);
    else if (!juegoPausado) {
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
});

btnGuardar.addEventListener("click", async () => {
    if (!juego) return mostrarMensaje("❌ No hay partida");
    await dao.guardarPartida(juego.id, juego.descubiertas, juego.tablero);
    mostrarMensaje("💾 Partida guardada");
});

/* ================= OBTENER USUARIO LOGUEADO ================= */
async function obtenerUsuario() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        usuarioId = user.id;
        // Opcional: cargar última partida automáticamente
        // cargarPartida();
    } else {
        mostrarMensaje("❌ No hay usuario logueado");
    }
}

window.onload = obtenerUsuario;
