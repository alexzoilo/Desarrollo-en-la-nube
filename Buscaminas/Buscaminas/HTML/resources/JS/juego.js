import { Buscaminas } from "../../../Clases/Buscaminas.js";
import { Dificultad } from "../../../Clases/Dificultad.js";

/* =========================
   VARIABLES DE ESTADO
========================= */
let juego = null;
let timerInterval = null;
let filas = 10;
let columnas = 10;
let dificultadActual = "FACIL";
let juegoPausado = false;
let segundosTotales = 0;

/* =========================
   ELEMENTOS DOM
========================= */
const tableroDiv = document.getElementById('tablero');
const selectDificultad = document.getElementById('dificultad');
const temporizadorSpan = document.getElementById('temporizador');
const mensajeDiv = document.getElementById('mensaje');
const btnControl = document.getElementById('btnControl');

/* =========================
   CONFIGURACIÓN
========================= */
function ajustarFilasColumnas(dificultad) {
    dificultadActual = dificultad;
    switch(dificultad) {
        case "FACIL": filas = 10; columnas = 10; break;
        case "MEDIO": filas = 15; columnas = 15; break;
        case "DIFICIL": filas = 20; columnas = 20; break;
    }
    selectDificultad.value = dificultadActual;
}

/* =========================
   TABLERO
========================= */
function crearTableroHTML() {
    tableroDiv.innerHTML = '';
    tableroDiv.style.gridTemplateColumns = `repeat(${columnas}, 40px)`;
    tableroDiv.style.gridTemplateRows = `repeat(${filas}, 40px)`;

    for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
            const celda = document.createElement('div');
            celda.classList.add('celda');
            celda.dataset.fila = i;
            celda.dataset.col = j;

            celda.addEventListener('click', () => handleClick(i, j));
            celda.addEventListener('contextmenu', e => handleRightClick(e, celda));

            tableroDiv.appendChild(celda);
        }
    }
}

function actualizarTablero() {
    for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
            const celda = tableroDiv.children[i * columnas + j];
            celda.textContent = '';
            celda.classList.remove('revelada', 'bandera');

            if (juego && juego.descubiertas[i][j]) {
                celda.classList.add('revelada');
                if (juego.tablero[i][j] === -1) celda.textContent = '💣';
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

    selectDificultad.disabled = true;
}

function detenerTemporizador() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function formatTiempo(segundos) {
    const h = String(Math.floor(segundos / 3600)).padStart(2, '0');
    const m = String(Math.floor((segundos % 3600) / 60)).padStart(2, '0');
    const s = String(segundos % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
}

/* =========================
   MENSAJES VISUALES
========================= */
function mostrarMensaje(texto, clase = '') {
    mensajeDiv.textContent = texto;
    mensajeDiv.className = `mensaje ${clase}`;
    mensajeDiv.style.display = 'flex';
}

function ocultarMensaje() {
    mensajeDiv.textContent = '';
    mensajeDiv.style.display = 'none';
}

/* =========================
   JUEGO
========================= */
function iniciarJuego(dificultad) {
    ajustarFilasColumnas(dificultad);
    juego = new Buscaminas(null, filas, columnas, Dificultad[dificultad]);
    segundosTotales = 0;
    juegoPausado = false;

    crearTableroHTML();
    actualizarTablero();
    iniciarTemporizador();

    btnControl.textContent = '⏸ Pausar';
    ocultarMensaje();
}

function perderJuego() {
    detenerTemporizador();
    mostrarMensaje('💥 Has perdido', 'perdido');
    btnControl.textContent = '▶ Iniciar';
    juegoPausado = false;

    if(dificultadActual === "DIFICIL") dificultadActual = "MEDIO";
    else if(dificultadActual === "MEDIO") dificultadActual = "FACIL";

    selectDificultad.value = dificultadActual;

    for(let i=0;i<filas;i++){
        for(let j=0;j<columnas;j++){
            if(juego.tablero[i][j]===-1){
                const celda = tableroDiv.children[i*columnas+j];
                celda.textContent = '💣';
                celda.classList.add('revelada');
            }
        }
    }

    juego = null;
    selectDificultad.disabled = false;
}

function ganarNivel() {
    detenerTemporizador();
    mostrarMensaje('🏆 ¡Ganaste! Subiendo nivel', 'ganado');
    btnControl.textContent = '▶ Iniciar';
    juegoPausado = false;

    if(dificultadActual === "FACIL") dificultadActual = "MEDIO";
    else if(dificultadActual === "MEDIO") dificultadActual = "DIFICIL";

    selectDificultad.value = dificultadActual;

    setTimeout(()=> iniciarJuego(dificultadActual), 1200);
}

/* =========================
   INTERACCIONES
========================= */
function handleClick(fila, col) {
    if(!juego || juegoPausado) return;
    const exito = juego.descubrir(fila, col);
    actualizarTablero();
    if(!exito) perderJuego();
    else if(juego.verificarVictoria()) ganarNivel();
}

function handleRightClick(e, celda){
    e.preventDefault();
    if(!juego || juegoPausado || celda.classList.contains('revelada')) return;
    celda.classList.toggle('bandera');
}

/* =========================
   PAUSA / REANUDAR
========================= */
function togglePausa(){
    if(!juego) return;

    if(!juegoPausado){
        juegoPausado = true;
        detenerTemporizador();
        btnControl.textContent = '▶ Reanudar';
        mostrarMensaje('⏸ Juego en pausa','pausa');
    } else {
        juegoPausado = false;
        iniciarTemporizador();
        btnControl.textContent = '⏸ Pausar';
        ocultarMensaje();
    }
}

/* =========================
   EVENTOS
========================= */
btnControl.addEventListener('click', ()=>{
    if(!juego) iniciarJuego(selectDificultad.value);
    else togglePausa();
});

document.addEventListener('keydown', e=>{
    if(e.code === 'Space'){
        e.preventDefault();
        togglePausa();
    }
});
