import { supabase } from "./Supabaseclient.js";
import { Buscaminas } from "./Clases/Buscaminas.js";
import { Dificultad } from "./Clases/Dificultad.js";
import { DAOBuscaminas } from "./DAO/DaoBuscaminas.js";

const dao = new DAOBuscaminas();

let juego = null;
let usuarioId = null;
let filas = 9;
let columnas = 9;
let dificultadActual = "FACIL";
let juegoPausado = false;
let segundosTotales = 0;
let timerInterval = null;

// DOM
const tableroDiv = document.getElementById("tablero");
const selectDificultad = document.getElementById("dificultad");
const temporizadorSpan = document.getElementById("temporizador");
const mensajeDiv = document.getElementById("mensaje");
const btnControl = document.getElementById("btnControl");
const btnGuardar = document.getElementById("btnGuardar");

/* ================= UTILIDADES ================= */
function ajustarFilasColumnas(dif) {
    dificultadActual = dif;
    filas = columnas = dif === "FACIL" ? 10 : dif === "MEDIO" ? 15 : 20;
    selectDificultad.value = dificultadActual;
}

function formatTiempo(s) {
    const h = String(Math.floor(s / 3600)).padStart(2,"0");
    const m = String(Math.floor((s % 3600)/60)).padStart(2,"0");
    const ss = String(s % 60).padStart(2,"0");
    return `Cronometro: ${h} : ${m} : ${ss}`;
}

function mostrarMensaje(txt, tipo="") {
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

    for(let i=0;i<filas;i++){
        for(let j=0;j<columnas;j++){
            const c = document.createElement("div");
            c.className = "celda";
            c.onclick = () => clickCelda(i,j);
            c.oncontextmenu = e => {
                e.preventDefault();
                c.classList.toggle("bandera");
            };
            tableroDiv.appendChild(c);
        }
    }
}

function actualizarTablero() {
    for(let i=0;i<filas;i++){
        for(let j=0;j<columnas;j++){
            const c = tableroDiv.children[i*columnas+j];
            c.textContent = "";
            c.classList.remove("revelada");

            if(juego && juego.descubiertas[i][j]){
                c.classList.add("revelada");
                if(juego.tablero[i][j]===-1) c.textContent = "💣";
                else if(juego.tablero[i][j]>0) c.textContent = juego.tablero[i][j];
            }
        }
    }
}

/* ================= TEMPORIZADOR ================= */
function iniciarTemporizador(){
    temporizadorSpan.textContent = formatTiempo(segundosTotales);
    timerInterval = setInterval(()=>{
        segundosTotales++;
        temporizadorSpan.textContent = formatTiempo(segundosTotales);
    },1000);
    selectDificultad.disabled = true;
}

function detenerTemporizador(){
    clearInterval(timerInterval);
    timerInterval = null;
    selectDificultad.disabled = false;
}

/* ================= USUARIO ================= */
async function obtenerUsuarioLogueado(){
    const { data, error } = await supabase.auth.getUser();
    if(error || !data.user){
        alert("❌ Usuario no logueado");
        return null;
    }
    return data.user.id; // UUID
}

/* ================= PARTIDA ================= */
function estadoJuego(){
    return {
        tablero: juego.tablero,
        descubiertas: juego.descubiertas,
        segundos: segundosTotales,
        pausado: juegoPausado
    };
}

async function iniciarJuego(dif){
    usuarioId = await obtenerUsuarioLogueado();
    if(!usuarioId) return;

    ajustarFilasColumnas(dif);

    juego = new Buscaminas(usuarioId, filas, columnas, Dificultad[dif]);

    // Crear partida en Supabase
    await dao.crearPartida(juego);

    crearTableroHTML();
    actualizarTablero();
    iniciarTemporizador();
    ocultarMensaje();
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
    if(juego) await dao.finalizarPartida(juego.id);
    juego = null;
    btnControl.textContent = "▶ Iniciar";
}

/* ================= GUARDAR ================= */
btnGuardar.onclick = async ()=>{
    if(!juego) return mostrarMensaje("❌ No hay partida");
    await dao.guardarPartida(juego.id,juego.descubiertas,juego.tablero);
    mostrarMensaje("💾 Partida guardada");
};

/* ================= CARGAR ================= */
async function cargarPartida(){
    usuarioId = await obtenerUsuarioLogueado();
    if(!usuarioId) return;

    const data = await dao.findPartidaActiva(usuarioId);
    if(!data) return;

    dificultadActual = data.dificultad;
    filas = data.filas;
    columnas = data.columnas;
    segundosTotales = data.tiempoInicio ? Math.floor((Date.now()-new Date(data.tiempoInicio))/1000) : 0;
    juegoPausado = false;

    juego = new Buscaminas(usuarioId, filas, columnas, Dificultad[dificultadActual]);
    juego.id = data.id;
    juego.tablero = data.tablero;
    juego.descubiertas = data.celdasDescubiertas;
    juego.minas = data.minas;

    crearTableroHTML();
    actualizarTablero();
    iniciarTemporizador();
    btnControl.textContent = "⏸ Pausar";
}

window.onload = cargarPartida;

/* ================= BOTÓN CONTROL ================= */
btnControl.onclick = ()=>{
    if(!juego) iniciarJuego(selectDificultad.value);
    else if(!juegoPausado){
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
