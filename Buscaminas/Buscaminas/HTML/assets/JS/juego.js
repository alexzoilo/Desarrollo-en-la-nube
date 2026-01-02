import { Buscaminas } from "./Clases/Buscaminas.js";
import { Dificultad } from "./Clases/Dificultad.js";
import { DAOBuscaminas } from "./DAO/DaoBuscaminas.js";
import { supabase } from "./Supabaseclient.js";

const dao = new DAOBuscaminas();

let juego = null;
let filas = 9;
let columnas = 9;
let dificultadActual = "FACIL";
let juegoPausado = false;
let segundosTotales = 0;
let timerInterval = null;

const tableroDiv = document.getElementById('tablero');
const selectDificultad = document.getElementById('dificultad');
const temporizadorSpan = document.getElementById('temporizador');
const mensajeDiv = document.getElementById('mensaje');
const btnControl = document.getElementById('btnControl');
const btnGuardar = document.getElementById('btnGuardar');

/* ================= UTILIDADES ================= */

async function obtenerUsuarioId() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error("Usuario no logueado");
    return user.id;
}

function ajustarFilasColumnas(dif) {
    dificultadActual = dif;
    filas = columnas = dif === "FACIL" ? 10 : dif === "MEDIO" ? 15 : 20;
}

function formatTiempo(segundos) {
    const h = String(Math.floor(segundos / 3600)).padStart(2, "0");
    const m = String(Math.floor((segundos % 3600) / 60)).padStart(2, "0");
    const s = String(segundos % 60).padStart(2, "0");
    return `Cronometro: ${h} : ${m} : ${s}`;
}

function mostrarMensaje(texto) {
    mensajeDiv.textContent = texto;
}

function ocultarMensaje() {
    mensajeDiv.textContent = "";
}

/* ================= TABLERO ================= */

function crearTableroHTML() {
    tableroDiv.innerHTML = '';
    tableroDiv.style.gridTemplateColumns = `repeat(${columnas}, 40px)`;
    tableroDiv.style.gridTemplateRows = `repeat(${filas}, 40px)`;

    for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
            const celdaDiv = document.createElement('div');
            celdaDiv.classList.add('celda');
            celdaDiv.onclick = () => clickCelda(i, j);
            celdaDiv.oncontextmenu = (e) => {
                e.preventDefault();
                if (!juego || juego.descubiertas[i][j]) return;
                celdaDiv.classList.toggle('bandera');
            };
            tableroDiv.appendChild(celdaDiv);
        }
    }
}

function actualizarTablero() {
    for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
            const c = tableroDiv.children[i*columnas + j];
            c.textContent = '';
            c.classList.remove('revelada');
            if (juego.descubiertas[i][j]) {
                c.classList.add('revelada');
                if (juego.tablero[i][j] === -1) c.textContent = '💣';
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

/* ================= PARTIDA ================= */

async function iniciarJuego(dif) {
    const usuarioId = await obtenerUsuarioId();
    ajustarFilasColumnas(dif);

    juego = new Buscaminas(null, filas, columnas, Dificultad[dif]);
    juego.usuarioId = usuarioId;

    // Crear partida en Supabase
    await dao.crearPartida({
        ...juego,
        tablero: JSON.stringify(juego.tablero),
        celdasDescubiertas: JSON.stringify(juego.descubiertas)
    });

    crearTableroHTML();
    actualizarTablero();
    iniciarTemporizador();
    btnControl.textContent = '⏸ Pausar';
    juegoPausado = false;
    segundosTotales = 0;
}

function clickCelda(f, c) {
    if (!juego || juegoPausado) return;

    const exito = juego.descubrir(f, c);
    actualizarTablero();

    if (!exito) finalizar('💥 Has perdido');
    else if (juego.verificarVictoria()) finalizar('🏆 Has ganado');
}

async function finalizar(msg) {
    detenerTemporizador();
    mostrarMensaje(msg);

    await dao.finalizarPartida(juego.id);
    juego = null;
    btnControl.textContent = '▶ Iniciar';
}

/* ================= GUARDAR ================= */

btnGuardar.onclick = async () => {
    if (!juego) return mostrarMensaje("❌ No hay partida activa");
    await dao.guardarPartida(
        juego.id,
        JSON.stringify(juego.descubiertas),
        JSON.stringify(juego.tablero)
    );
    mostrarMensaje("💾 Partida guardada");
};

/* ================= CARGAR ================= */

async function cargarPartida() {
    const usuarioId = await obtenerUsuarioId();
    const data = await dao.findPartidaActiva(usuarioId);
    if (!data) return;

    dificultadActual = data.dificultad;
    filas = data.filas;
    columnas = data.columnas;

    juego = new Buscaminas(null, filas, columnas, Dificultad[dificultadActual]);
    juego.id = data.id;
    juego.tablero = JSON.parse(data.tablero);
    juego.descubiertas = JSON.parse(data.celdasDescubiertas);
    juego.minas = data.minas;

    crearTableroHTML();
    actualizarTablero();
}

window.onload = cargarPartida;

/* ================= BOTÓN CONTROL ================= */

btnControl.onclick = () => {
    if (!juego) iniciarJuego(selectDificultad.value);
    else if (!juegoPausado) {
        juegoPausado = true;
        detenerTemporizador();
        btnControl.textContent = '▶ Reanudar';
    } else {
        juegoPausado = false;
        iniciarTemporizador();
        btnControl.textContent = '⏸ Pausar';
    }
};
