// juego.js
import { supabase } from "./Supabaseclient.js";
import { Buscaminas } from "./Clases/Buscaminas.js";
import { Dificultad } from "./Clases/Dificultad.js";

/* ================= VARIABLES ================= */
let juego = null;
let timerInterval = null;
let filas = 9;
let columnas = 9;
let dificultadActual = "FACIL";
let juegoPausado = false;
let segundosTotales = 0;

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
    selectDificultad.value = dificultadActual;
}

function formatTiempo(seg) {
    const h = String(Math.floor(seg / 3600)).padStart(2, '0');
    const m = String(Math.floor((seg % 3600) / 60)).padStart(2, '0');
    const s = String(seg % 60).padStart(2, '0');
    return `Cronómetro: ${h}:${m}:${s}`;
}

function mostrarMensaje(txt) {
    mensajeDiv.textContent = txt;
}

function ocultarMensaje() {
    mensajeDiv.textContent = '';
}

/* ================= TABLERO ================= */
function crearTableroHTML() {
    tableroDiv.innerHTML = '';
    tableroDiv.style.gridTemplateColumns = `repeat(${columnas}, 40px)`;

    for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
            const c = document.createElement('div');
            c.className = 'celda';
            c.onclick = () => clickCelda(i, j);
            tableroDiv.appendChild(c);
        }
    }
}

function actualizarTablero() {
    for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
            const c = tableroDiv.children[i * columnas + j];
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

/* ================= API SUPABASE ================= */
async function crearPartidaEnBD() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no logueado");

    const { data, error } = await supabase
        .from('Buscaminas')
        .insert({
            usuarioId: user.id,   // UUID del usuario logueado
            filas,
            columnas,
            totalCeldas: filas * columnas,
            celdasDescubiertas: juego.descubiertas,
            dificultad: dificultadActual,
            tiempoInicio: new Date().toISOString(),
            tiempoFin: null,
            tablero: juego.tablero,
            minas: juego.minas
        })
        .select('id')
        .single();

    if (error) throw error;
    juego.id = data.id;
}

async function guardarPartidaEnBD() {
    if (!juego) return;
    const { error } = await supabase
        .from('Buscaminas')
        .update({
            celdasDescubiertas: juego.descubiertas,
            tablero: juego.tablero
        })
        .eq('id', juego.id);

    if (error) throw error;
}

async function finalizarPartidaEnBD() {
    if (!juego) return;
    const { error } = await supabase
        .from('Buscaminas')
        .update({ tiempoFin: new Date().toISOString() })
        .eq('id', juego.id);

    if (error) throw error;
}

async function cargarPartidaActiva() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('Buscaminas')
        .select('*')
        .eq('usuarioId', user.id)
        .is('tiempoFin', null)
        .order('tiempoInicio', { ascending: false })
        .limit(1)
        .single();

    if (error || !data) return null;
    return data;
}

/* ================= PARTIDA ================= */
async function iniciarJuego(dif) {
    ajustarFilasColumnas(dif);
    juego = new Buscaminas(null, filas, columnas, Dificultad[dif]);
    juego.descubiertas = Array.from({ length: filas }, () => Array(columnas).fill(false));
    juego.minas = juego.generarMinas(); // función propia de la clase Buscaminas

    crearTableroHTML();
    actualizarTablero();
    iniciarTemporizador();
    ocultarMensaje();

    await crearPartidaEnBD();
}

function clickCelda(f, c) {
    if (!juego) return;
    const exito = juego.descubrir(f, c);
    actualizarTablero();

    if (!exito) perderJuego();
    else if (juego.verificarVictoria()) ganarNivel();
}

function perderJuego() {
    detenerTemporizador();
    mostrarMensaje('💥 Has perdido');
    finalizarPartidaEnBD();
    juego = null;
    btnControl.textContent = '▶ Iniciar';
}

function ganarNivel() {
    detenerTemporizador();
    mostrarMensaje('🏆 Has ganado');
    finalizarPartidaEnBD();
    juego = null;
    btnControl.textContent = '▶ Iniciar';
}

/* ================= EVENTOS ================= */
btnControl.onclick = async () => {
    if (!juego) {
        await iniciarJuego(selectDificultad.value);
    } else {
        juegoPausado = !juegoPausado;
        if (juegoPausado) {
            detenerTemporizador();
            btnControl.textContent = '▶ Reanudar';
            mostrarMensaje('⏸ Juego en pausa');
        } else {
            iniciarTemporizador();
            btnControl.textContent = '⏸ Pausar';
            ocultarMensaje();
        }
    }
};

btnGuardar.onclick = async () => {
    if (!juego) return mostrarMensaje('❌ No hay partida');
    await guardarPartidaEnBD();
    mostrarMensaje('💾 Partida guardada');
};

/* ================= CARGA INICIAL ================= */
window.onload = async () => {
    const data = await cargarPartidaActiva();
    if (!data) return;

    juego = new Buscaminas(null, data.filas, data.columnas, Dificultad[data.dificultad]);
    juego.id = data.id;
    juego.tablero = data.tablero;
    juego.descubiertas = data.celdasDescubiertas;
    juego.minas = data.minas;
    filas = data.filas;
    columnas = data.columnas;
    dificultadActual = data.dificultad;

    crearTableroHTML();
    actualizarTablero();
    iniciarTemporizador();
};
