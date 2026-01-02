import { Buscaminas } from "../../../Clases/Buscaminas.js";
import { Dificultad } from "../../../Clases/Dificultad.js";

let juego = null;
let timerInterval = null;
let filas = 9;
let columnas = 9;
let dificultadActual = "FACIL";
let juegoIniciado = false;
let juegoPausado = false;
let segundosTotales = 0;

const tableroDiv = document.getElementById('tablero');
const selectDificultad = document.getElementById('dificultad');
const temporizadorSpan = document.getElementById('temporizador');
const mensajeDiv = document.getElementById('mensaje');
const btnControl = document.getElementById('btnControl');

// Ajusta filas y columnas según la dificultad
function ajustarFilasColumnas(dificultad) {
    dificultadActual = dificultad;
    switch(dificultad) {
        case "FACIL": filas = 10; columnas = 10; break;
        case "MEDIO": filas = 15; columnas = 15; break;
        case "DIFICIL": filas = 20; columnas = 20; break;
    }
    selectDificultad.value = dificultadActual;
}

// Crear tablero HTML
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

// Actualiza la visualización del tablero
function actualizarTablero() {
    for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
            const celdaDiv = tableroDiv.children[i*columnas + j];
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

// Temporizador
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
}

function formatTiempo(segundos) {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segundosRestantes = segundos % 60;

    return `Cronometro: ${String(horas).padStart(2,'0')} : ${String(minutos).padStart(2,'0')} : ${String(segundosRestantes).padStart(2,'0')}`;
}

// Mensajes de estado
function mostrarMensaje(texto, tipo) {
    mensajeDiv.textContent = texto;
    mensajeDiv.className = tipo;
}

function ocultarMensaje() {
    mensajeDiv.textContent = '';
    mensajeDiv.className = '';
}

// Eventos de clic en celdas
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

// Iniciar juego
function iniciarJuego(dificultad) {
    ajustarFilasColumnas(dificultad);
    juego = new Buscaminas(null, filas, columnas, Dificultad[dificultad]);
    crearTableroHTML();
    actualizarTablero();
    iniciarTemporizador();
    ocultarMensaje();
    juegoIniciado = true;
    juegoPausado = false;
    btnControl.textContent = '⏸ Pausar';
    segundosTotales = 0;
}

// Perder juego
function perderJuego() {
    detenerTemporizador();
    mostrarMensaje('💥 Has perdido', 'perdido');

    // Revelar todas las bombas
    for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
            if (juego.tablero[i][j] === -1) {
                const celdaDiv = tableroDiv.children[i*columnas+j];
                celdaDiv.textContent = '💣';
                celdaDiv.classList.add('revelada');
            }
        }
    }

    // Ajustar dificultad al perder
    switch(dificultadActual) {
        case "DIFICIL": dificultadActual = "MEDIO"; break;
        case "MEDIO": dificultadActual = "FACIL"; break;
    }
    selectDificultad.value = dificultadActual;

    juego = null;
    btnControl.textContent = '▶ Iniciar';
}

// Ganar nivel
function ganarNivel() {
    detenerTemporizador();
    mostrarMensaje('🏆 Has ganado! Subiendo de nivel', 'ganado');

    switch(dificultadActual) {
        case "FACIL": dificultadActual = "MEDIO"; break;
        case "MEDIO": dificultadActual = "DIFICIL"; break;
    }
    selectDificultad.value = dificultadActual;

    setTimeout(() => {
        iniciarJuego(dificultadActual);
        ocultarMensaje();
    }, 1200);
}

// Control del teclado (solo para iniciar juego si aún no comenzó)
document.addEventListener('keydown', () => {
    if (!juego) {
        iniciarJuego(selectDificultad.value);
    }
});

// Botón iniciar/pausar/reanudar
btnControl.addEventListener('click', () => {
    if (!juego) { // ▶ INICIAR
        iniciarJuego(selectDificultad.value);
        return;
    }

    if (!juegoPausado) { // ⏸ PAUSAR
        juegoPausado = true;
        detenerTemporizador();
        btnControl.textContent = '▶ Reanudar';
        mostrarMensaje('⏸ Juego en pausa', '');
    } else { // ▶ REANUDAR
        juegoPausado = false;
        iniciarTemporizador();
        btnControl.textContent = '⏸ Pausar';
        ocultarMensaje();
    }
});
