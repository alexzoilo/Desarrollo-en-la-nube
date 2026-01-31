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

const tableroDiv = document.getElementById("tablero");
const selectDificultad = document.getElementById("dificultad");
const temporizadorSpan = document.getElementById("temporizador");
const btnControl = document.getElementById("btnControl");
const btnListaPartidas = document.getElementById('btnListaPartidas');

const niveles = ["FACIL","MEDIO","DIFICIL"];


function obtenerSiguienteDificultad(ganado){
    let index = niveles.indexOf(dificultadActual)

    if(ganado && index < niveles.length -1){
        index++
    }else if(!ganado && index > 0){
        index--
    }

    return niveles[index];

}
function formatTiempo(s) {
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `Cronometro: ${h}:${m}:${ss}`;
}

function ajustarFilasColumnas(dif) {
    dificultadActual = dif;
    filas = columnas = dif === "FACIL" ? 10 : dif === "MEDIO" ? 15 : 20;
    selectDificultad.value = dificultadActual;
}

async function obtenerUsuarioLogueado() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
        console.error("Error obteniendo usuario:", error);
        return null;
    }
    if (!user) {
        console.warn("No hay usuario logueado");
        return null;
    }
    return user.id;
}

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
    if (!juego) return;
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

async function iniciarJuego(dificultad) {
    const usuarioId = await obtenerUsuarioLogueado();
    if (!usuarioId) {
        mostrarMensaje("Debes iniciar sesión para jugar");
        return;
    }

    ajustarFilasColumnas(dificultad);
    selectDificultad.disabled = true;

    juego = new Buscaminas(usuarioId, filas, columnas, Dificultad[dificultad]);

    try {
        await dao.crearPartida(juego);
        console.log("Partida creada con id:", juego.id, "usuario:", usuarioId);
    } catch (e) {
        console.error("Error creando partida:", e);
        mostrarMensaje("No se pudo crear la partida.");
        juego = null;
        selectDificultad.disabled = false;
        return;
    }

    crearTableroHTML();
    actualizarTablero();
    iniciarTemporizador();
    ocultarMensaje();
    btnControl.textContent = "⏸ Pausar";
}

function clickCelda(f, c) {
    if (!juego || juegoPausado) return;

    const ok = juego.descubrir(f, c);
    actualizarTablero();

    if (!ok) finalizar(false,"💥 Has perdido","error");
    else if (juego.verificarVictoria()) finalizar(true,"🏆 Has ganado","correcto");
}

async function finalizar(ganado, msg, tipo = "info") {
    detenerTemporizador();
    mostrarMensaje(msg, tipo);

    if (juego?.id) {
        try {
            await dao.finalizarPartida(juego.id);
        } catch (e) {
            console.error("Error finalizando partida:", e);
        }
    }

    const nuevaDificultad = obtenerSiguienteDificultad(ganado);

    dificultadActual = nuevaDificultad;
    selectDificultad.value = nuevaDificultad;

    juego = null;
    juegoPausado = false;
    segundosTotales = 0;

    btnControl.textContent = "▶ Iniciar";
    selectDificultad.disabled = false;
}

btnControl.addEventListener("click", async () => {
    if (!juego) {
        await iniciarJuego(selectDificultad.value);
        return;
    }

    if (!juegoPausado) {
        juegoPausado = true;
        detenerTemporizador();
        btnControl.textContent = "▶ Reanudar";
        mostrarMensaje("⏸ Juego en pausa", "info");
    } else {
        juegoPausado = false;
        iniciarTemporizador();
        btnControl.textContent = "⏸ Pausar";
        ocultarMensaje();
    }
});

btnListaPartidas.addEventListener('click', () => {
    window.location.href = 'cargarPartida.html';
});

const cargarPartidaId = sessionStorage.getItem('cargarPartidaId');
if (cargarPartidaId) {
    cargarPartida(cargarPartidaId);
}

async function cargarPartida(idPartida) {
    try {
        const { data: partida, error } = await supabase
            .from('Buscaminas')
            .select('*')
            .eq('id', idPartida)
            .single();

        if (error || !partida) {
            mostrarMensaje('No se pudo cargar la partida', 'error');
            return;
        }

        juego = new Buscaminas(
            partida.usuarioId,
            partida.filas,
            partida.columnas,
            partida.dificultad
        );

        juego.tablero = partida.tablero;
        juego.descubiertas = partida.celdasDescubiertas;
        juego.minas = partida.minas;
        juego.totalCeldas = partida.totalCeldas;

        filas = partida.filas;
        columnas = partida.columnas;
        dificultadActual = partida.dificultad;

        selectDificultad.value = dificultadActual;
        selectDificultad.disabled = true;

        crearTableroHTML();
        actualizarTablero();

        mostrarMensaje('Partida cargada. ¡A jugar!', 'info');

    } catch (e) {
        console.error('Error cargando partida:', e);
        mostrarMensaje('Error al cargar la partida', 'error');
    } finally {
        sessionStorage.removeItem('cargarPartidaId');
    }
}

