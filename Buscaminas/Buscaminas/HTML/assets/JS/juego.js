// juego.js
import { supabase } from "./Supabaseclient.js";
import { Buscaminas } from "./Clases/Buscaminas.js";
import { Dificultad } from "./Clases/Dificultad.js";

let juego = null;
let timerInterval = null;
let filas = 9;
let columnas = 9;
let dificultadActual = "FACIL";
let juegoPausado = false;
let segundosTotales = 0;

// Elementos DOM
const tableroDiv = document.getElementById('tablero');
const selectDificultad = document.getElementById('dificultad');
const temporizadorSpan = document.getElementById('temporizador');
const mensajeDiv = document.getElementById('mensaje');
const btnControl = document.getElementById('btnControl');
const btnGuardar = document.getElementById('btnGuardar');

// =====================================
// UTILIDADES
// =====================================
function ajustarFilasColumnas(dificultad) {
    dificultadActual = dificultad;
    switch(dificultad) {
        case "FACIL": filas = columnas = 10; break;
        case "MEDIO": filas = columnas = 15; break;
        case "DIFICIL": filas = columnas = 20; break;
    }
}

function formatTiempo(segundos) {
    const h = String(Math.floor(segundos / 3600)).padStart(2,'0');
    const m = String(Math.floor((segundos % 3600) / 60)).padStart(2,'0');
    const s = String(segundos % 60).padStart(2,'0');
    return `Cronómetro: ${h} : ${m} : ${s}`;
}

function mostrarMensaje(texto, tipo='') {
    mensajeDiv.textContent = texto;
    mensajeDiv.className = tipo;
}

function ocultarMensaje() {
    mensajeDiv.textContent = '';
    mensajeDiv.className = '';
}

// =====================================
// TEMPORIZADOR
// =====================================
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

// =====================================
// TABLERO
// =====================================
function crearTableroHTML() {
    tableroDiv.innerHTML = '';
    tableroDiv.style.gridTemplateColumns = `repeat(${columnas}, 40px)`;
    tableroDiv.style.gridTemplateRows = `repeat(${filas}, 40px)`;

    for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
            const celdaDiv = document.createElement('div');
            celdaDiv.classList.add('celda');
            celdaDiv.dataset.fila = i;
            celdaDiv.dataset.col = j;

            celdaDiv.addEventListener('click', () => handleClick(i, j));
            celdaDiv.addEventListener('contextmenu', (e) => handleRightClick(e, celdaDiv));

            tableroDiv.appendChild(celdaDiv);
        }
    }
}

function actualizarTablero() {
    for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
            const celdaDiv = tableroDiv.children[i * columnas + j];
            celdaDiv.textContent = '';
            celdaDiv.classList.remove('revelada', 'bandera');

            if (juego && juego.descubiertas[i][j]) {
                celdaDiv.classList.add('revelada');
                if (juego.tablero[i][j] === -1) celdaDiv.textContent = '💣';
                else if (juego.tablero[i][j] > 0) celdaDiv.textContent = juego.tablero[i][j];
            }
        }
    }
}

// =====================================
// EVENTOS CELDAS
// =====================================
function handleClick(fila, col) {
    if (!juego || juegoPausado) return;

    const exito = juego.descubrir(fila, col);
    actualizarTablero();

    if (!exito) perderJuego();
    else if (juego.verificarVictoria()) ganarNivel();
}

function handleRightClick(e, celdaDiv) {
    e.preventDefault();
    if (!juego || celdaDiv.classList.contains('revelada') || juegoPausado) return;
    celdaDiv.classList.toggle('bandera');
}

// =====================================
// SUPABASE: usuario logueado
// =====================================
async function getUsuarioLogueado() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error("No hay usuario logueado");
    return user;
}

// =====================================
// CRUD PARTIDA
// =====================================
async function crearPartida() {
    const usuario = await getUsuarioLogueado();

    juego = new Buscaminas(null, filas, columnas, Dificultad[dificultadActual]);

    const { data, error } = await supabase
        .from('Buscaminas')
        .insert({
            usuarioId: usuario.id,
            filas,
            columnas,
            totalCeldas: filas * columnas,
            dificultad: dificultadActual,
            tiempoInicio: new Date().toISOString(),
            tiempoFin: null,
            tablero: JSON.stringify(juego.tablero),
            minas: JSON.stringify(juego.minas),
            celdasDescubiertas: JSON.stringify(juego.descubiertas)
        })
        .select('id')
        .single();

    if (error) throw error;
    juego.id = data.id;

    crearTableroHTML();
    actualizarTablero();
    iniciarTemporizador();
    ocultarMensaje();
    btnControl.textContent = '⏸ Pausar';
    segundosTotales = 0;
    juegoPausado = false;
}

async function guardarPartida() {
    if (!juego) return;
    const usuario = await getUsuarioLogueado();

    const { error } = await supabase
        .from('Buscaminas')
        .update({
            tablero: JSON.stringify(juego.tablero),
            minas: JSON.stringify(juego.minas),
            celdasDescubiertas: JSON.stringify(juego.descubiertas)
        })
        .eq('id', juego.id)
        .eq('usuarioId', usuario.id);

    if (error) throw error;
    mostrarMensaje('💾 Partida guardada');
}

async function cargarPartida() {
    const usuario = await getUsuarioLogueado();

    const { data, error } = await supabase
        .from('Buscaminas')
        .select('*')
        .eq('usuarioId', usuario.id)
        .is('tiempoFin', null)
        .order('tiempoInicio', { ascending: false })
        .limit(1)
        .single();

    if (error || !data) return;

    filas = data.filas;
    columnas = data.columnas;
    dificultadActual = data.dificultad;
    segundosTotales = 0;

    juego = new Buscaminas(null, filas, columnas, Dificultad[dificultadActual]);
    juego.id = data.id;
    juego.tablero = JSON.parse(data.tablero);
    juego.minas = JSON.parse(data.minas);
    juego.descubiertas = JSON.parse(data.celdasDescubiertas);

    crearTableroHTML();
    actualizarTablero();
    iniciarTemporizador();
}

// Finalizar partida
async function finalizarPartida() {
    if (!juego) return;
    await supabase
        .from('Buscaminas')
        .update({ tiempoFin: new Date().toISOString() })
        .eq('id', juego.id);

    juego = null;
    btnControl.textContent = '▶ Iniciar';
}

// =====================================
// GANAR / PERDER
// =====================================
function perderJuego() {
    detenerTemporizador();
    mostrarMensaje('💥 Has perdido', 'perdido');

    for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
            if (juego.tablero[i][j] === -1) {
                const celdaDiv = tableroDiv.children[i*columnas + j];
                celdaDiv.textContent = '💣';
                celdaDiv.classList.add('revelada');
            }
        }
    }

    juego = null;
    btnControl.textContent = '▶ Iniciar';
}

function ganarNivel() {
    detenerTemporizador();
    mostrarMensaje('🏆 Has ganado!', 'ganado');
    setTimeout(() => {
        juego = null;
        crearPartida(); // nueva partida
        ocultarMensaje();
    }, 1000);
}

// =====================================
// EVENTOS BOTONES
// =====================================
btnControl.addEventListener('click', () => {
    if (!juego) crearPartida();
    else if (!juegoPausado) {
        juegoPausado = true;
        detenerTemporizador();
        btnControl.textContent = '▶ Reanudar';
        mostrarMensaje('⏸ Juego en pausa');
    } else {
        juegoPausado = false;
        iniciarTemporizador();
        btnControl.textContent = '⏸ Pausar';
        ocultarMensaje();
    }
});

btnGuardar.addEventListener('click', guardarPartida);

// =====================================
// INICIO AUTOMÁTICO
// =====================================
window.onload = async () => {
    try {
        await cargarPartida();
    } catch (e) {
        console.log("No hay partida activa: ", e.message);
    }
};
