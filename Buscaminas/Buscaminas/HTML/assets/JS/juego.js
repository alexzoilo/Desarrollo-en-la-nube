import { Buscaminas } from "./Clases/Buscaminas.js";
import { Dificultad } from "./Clases/Dificultad.js";
import { DAOBuscaminas } from "./DAO/DaoBuscaminas.js";

const dao = new DAOBuscaminas();
let juego = null;
let timerInterval = null;
let filas = 9;
let columnas = 9;
let dificultadActual = "FACIL";
let juegoPausado = false;
let segundosTotales = 0;

// Usuario logueado
const usuario = await supabase.auth.getUser();
const usuarioId = usuario.data.user.id; // TU USUARIO LOGUEADO

const tableroDiv = document.getElementById('tablero');
const selectDificultad = document.getElementById('dificultad');
const temporizadorSpan = document.getElementById('temporizador');
const mensajeDiv = document.getElementById('mensaje');
const btnControl = document.getElementById('btnControl');
const btnGuardar = document.getElementById('btnGuardar');

/* ================= FUNCIONES ================= */
function ajustarFilasColumnas(dif) {
    dificultadActual = dif;
    filas = columnas = dif === "FACIL" ? 10 : dif === "MEDIO" ? 15 : 20;
}

function mostrarMensaje(txt) { mensajeDiv.textContent = txt; }
function ocultarMensaje() { mensajeDiv.textContent = ""; }

function crearTableroHTML() {
    tableroDiv.innerHTML = "";
    tableroDiv.style.gridTemplateColumns = `repeat(${columnas}, 40px)`;
    for (let i=0; i<filas; i++)
        for (let j=0; j<columnas; j++){
            const c = document.createElement("div");
            c.className = "celda";
            c.onclick = () => clickCelda(i,j);
            tableroDiv.appendChild(c);
        }
}

function actualizarTablero() {
    for (let i=0; i<filas; i++){
        for (let j=0; j<columnas; j++){
            const c = tableroDiv.children[i*columnas + j];
            c.textContent = "";
            c.classList.remove("revelada");
            if (juego && juego.descubiertas[i][j]){
                c.classList.add("revelada");
                if (juego.tablero[i][j]===-1) c.textContent="💣";
                else if(juego.tablero[i][j]>0) c.textContent=juego.tablero[i][j];
            }
        }
    }
}

function iniciarTemporizador() {
    temporizadorSpan.textContent = formatTiempo(segundosTotales);
    timerInterval = setInterval(() => {
        segundosTotales++;
        temporizadorSpan.textContent = formatTiempo(segundosTotales);
    }, 1000);
}

function detenerTemporizador() { clearInterval(timerInterval); timerInterval=null; }

function formatTiempo(s) {
    const h = String(Math.floor(s/3600)).padStart(2,'0');
    const m = String(Math.floor((s%3600)/60)).padStart(2,'0');
    const ss = String(s%60).padStart(2,'0');
    return `Cronometro: ${h} : ${m} : ${ss}`;
}

function estadoJuego() { return { tablero: juego.tablero, descubiertas: juego.descubiertas }; }

async function iniciarJuego(dif) {
    ajustarFilasColumnas(dif);
    juego = new Buscaminas(null, filas, columnas, Dificultad[dif]);
    juego.usuarioId = usuarioId;

    await dao.crearPartida(juego);
    crearTableroHTML();
    actualizarTablero();
    iniciarTemporizador();
    btnControl.textContent = "⏸ Pausar";
}

function clickCelda(f,c){
    if(!juego || juegoPausado) return;
    const ok = juego.descubrir(f,c);
    actualizarTablero();
    if(!ok) finalizar("💥 Has perdido");
    else if(juego.verificarVictoria()) finalizar("🏆 Has ganado");
}

async function finalizar(msg){
    detenerTemporizador();
    mostrarMensaje(msg);
    await dao.finalizarPartida(juego.id);
    juego = null;
    btnControl.textContent="▶ Iniciar";
}

// Guardar partida
btnGuardar.onclick = async () => {
    if(!juego) return mostrarMensaje("❌ No hay partida");
    await dao.guardarPartida(juego.id,juego.descubiertas,juego.tablero);
    mostrarMensaje("💾 Partida guardada");
}

// Cargar partida activa
async function cargarPartida() {
    const data = await dao.findPartidaActiva(usuarioId);
    if(!data) return;
    filas = data.filas;
    columnas = data.columnas;
    dificultadActual = data.dificultad;

    juego = new Buscaminas(null, filas, columnas, Dificultad[dificultadActual]);
    juego.id = data.id;
    juego.tablero = data.tablero;
    juego.descubiertas = data.celdasDescubiertas;
    juego.minas = data.minas;

    crearTableroHTML();
    actualizarTablero();
}

window.onload = cargarPartida;

btnControl.onclick = () => { if(!juego) iniciarJuego(selectDificultad.value); };
