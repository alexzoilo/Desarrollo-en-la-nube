import { Buscaminas } from "./Clases/Buscaminas.js";
import { Dificultad } from "./Clases/Dificultad.js";
import { DAOBuscaminas } from "./DAO/DaoBuscaminas.js";
import { supabase } from "./Supabaseclient.js";
import { mostrarMensaje, ocultarMensaje } from './extras/mensajes.js';

const dao = new DAOBuscaminas();

let juego = null;
let filas = 9;
let columnas = 9;
let dificultadActual = "FACIL";
let juegoPausado = false;
let segundosTotales = 0;
let timerInterval = null;
let partidaFinalizada = false;

const tableroDiv = document.getElementById("tablero");
const selectDificultad = document.getElementById("dificultad");
const temporizadorSpan = document.getElementById("temporizador");
const btnControl = document.getElementById("btnControl");
const btnListaPartidas = document.getElementById('btnListaPartidas');

const niveles = ["FACIL", "MEDIO", "DIFICIL"];

// ==================== AUX ====================
function obtenerSiguienteDificultad(ganado) {
    let index = niveles.indexOf(dificultadActual);
    if (ganado && index < niveles.length - 1) index++;
    else if (!ganado && index > 0) index--;
    return niveles[index];
}

function formatTiempo(s) {
    const h = String(Math.floor(s / 3600)).padStart(2,"0");
    const m = String(Math.floor((s % 3600)/60)).padStart(2,"0");
    const ss = String(s % 60).padStart(2,"0");
    return `Cronómetro: ${h}:${m}:${ss}`;
}

async function obtenerUsuarioLogueado() {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
}

// ==================== TABLERO ====================
function crearTableroHTML() {
    tableroDiv.innerHTML = "";
    tableroDiv.style.gridTemplateColumns = `repeat(${columnas}, 40px)`;
    for (let i=0;i<filas;i++){
        for(let j=0;j<columnas;j++){
            const c = document.createElement("div");
            c.className = "celda";
            c.onclick = () => clickCelda(i,j);
            tableroDiv.appendChild(c);
        }
    }
}

function actualizarTablero() {
    if(!juego) return;
    for(let i=0;i<filas;i++){
        for(let j=0;j<columnas;j++){
            const c = tableroDiv.children[i*columnas+j];
            c.textContent = "";
            c.classList.remove("revelada");
            if(juego.descubiertas[i][j]){
                c.classList.add("revelada");
                if(juego.tablero[i][j] === -1) c.textContent="💣";
                else if(juego.tablero[i][j] > 0) c.textContent=juego.tablero[i][j];
            }
        }
    }
}

// ==================== TIMER ====================
function iniciarTemporizador() {
    temporizadorSpan.textContent = formatTiempo(segundosTotales);
    timerInterval = setInterval(()=>{
        segundosTotales++;
        temporizadorSpan.textContent = formatTiempo(segundosTotales);
    },1000);
}

function detenerTemporizador() {
    clearInterval(timerInterval);
    timerInterval = null;
}

// ==================== JUEGO ====================
async function iniciarJuego(dificultad){
    const usuarioId = await obtenerUsuarioLogueado();
    if(!usuarioId){
        mostrarMensaje("Debes iniciar sesión", "error");
        return;
    }

    dificultadActual = dificultad;
    filas = columnas = dificultad === "FACIL" ? 10 : dificultad === "MEDIO" ? 15 : 20;
    selectDificultad.disabled = true;

    juego = new Buscaminas(usuarioId, filas, columnas, Dificultad[dificultad]);
    partidaFinalizada = false;

    try {
        await dao.crearPartida(juego);
    } catch(e){
        console.error(e);
        mostrarMensaje("No se pudo crear la partida","error");
        juego = null;
        selectDificultad.disabled = false;
        return;
    }

    crearTableroHTML();
    actualizarTablero();
    segundosTotales = 0;
    iniciarTemporizador();
    juegoPausado = false;
    btnControl.textContent = "⏸ Pausar";
    ocultarMensaje();
}

function clickCelda(f,c){
    if(!juego || juegoPausado || partidaFinalizada) return;

    const ok = juego.descubrir(f,c);
    actualizarTablero();

    if(!ok) finalizar(false);
    else if(juego.verificarVictoria()) finalizar(true);
}

// ==================== FINALIZAR ====================
async function finalizar(ganado){
    if(partidaFinalizada) return;
    partidaFinalizada = true;

    detenerTemporizador();

    mostrarMensaje(
        ganado ? "🏆 ¡Has ganado!" : "💥 Has perdido",
        ganado ? "correcto" : "error"
    );
    setTimeout(ocultarMensaje, 4000);

    try {
        await dao.finalizarPartida({
            id: juego.id,
            ganado,
            segundos: segundosTotales
        });

        await supabase
            .from("Usuarios")
            .update({
                partidasGanadas: ganado ? supabase.raw("partidasGanadas + 1") : undefined,
                partidasPerdidas: !ganado ? supabase.raw("partidasPerdidas + 1") : undefined,
                tiempoUltimaPartida: segundosTotales,
                tiempoTotalJugado: supabase.raw(`tiempoTotalJugado + ${segundosTotales}`)
            })
            .eq("id", juego.usuarioId);

    } catch(e){
        console.error(e);
    }

    dificultadActual = obtenerSiguienteDificultad(ganado);
    selectDificultad.value = dificultadActual;
    selectDificultad.disabled = false;

    juego = null;
    segundosTotales = 0;
    btnControl.textContent = "▶ Iniciar";
}

// ==================== CONTROLES ====================
btnControl.addEventListener("click", async ()=>{
    if(!juego){
        await iniciarJuego(selectDificultad.value);
        return;
    }

    if(!juegoPausado){
        juegoPausado = true;
        detenerTemporizador();
        btnControl.textContent = "▶ Reanudar";
        mostrarMensaje("⏸ Pausa","info");
    } else {
        juegoPausado = false;
        iniciarTemporizador();
        btnControl.textContent = "⏸ Pausar";
        ocultarMensaje();
    }
});

btnListaPartidas.addEventListener('click', ()=>{
    window.location.href = 'cargarPartida.html';
});
