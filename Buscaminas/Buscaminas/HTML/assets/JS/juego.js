import { Buscaminas } from "./Clases/Buscaminas.js";
import { Dificultad } from "./Clases/Dificultad.js";
import { DAOBuscaminas } from "./DAO/DaoBuscaminas.js";

const dao = new DAOBuscaminas();
let juego = null;
let filas = 9;
let columnas = 9;
let dificultadActual = "FACIL";
let juegoPausado = false;
let segundosTotales = 0;
let timerInterval = null;

// ---------------- DOM ----------------
const tableroDiv = document.getElementById("tablero");
const selectDificultad = document.getElementById("dificultad");
const temporizadorSpan = document.getElementById("temporizador");
const mensajeDiv = document.getElementById("mensaje");
const btnControl = document.getElementById("btnControl");
const btnGuardar = document.getElementById("btnGuardar");

// ---------------- Usuario actual ----------------
const usuarioActual = {
    id: "082a2d69-baf6-440c-a321-abbd7919d240", // UUID de la tabla Usuarios
    nombre: "ases"
};

// ================== UTILIDADES ==================
function formatTiempo(s) {
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `Cronómetro: ${h}:${m}:${ss}`;
}

function mostrarMensaje(txt) { mensajeDiv.textContent = txt; }
function ocultarMensaje() { mensajeDiv.textContent = ""; }

function ajustarFilasColumnas(dif) {
    dificultadActual = dif;
    filas = columnas = dif === "FACIL" ? 10 : dif === "MEDIO" ? 15 : 20;
    selectDificultad.value = dificultadActual;
}

// ================== TABLERO ==================
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

// ================== TEMPORIZADOR ==================
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

// ================== PARTIDA ==================
async function iniciarJuego(dificultad) {
    if (!usuarioActual?.id) {
        mostrarMensaje("❌ No hay usuario registrado");
        return;
    }

    ajustarFilasColumnas(dificultad);

    // Bloquea el select de dificultad mientras hay partida
    selectDificultad.disabled = true;

    // Crear instancia de Buscaminas
    juego = new Buscaminas(usuarioActual.id, filas, columnas, Dificultad[dificultad]);

    try {
        // Crear partida nueva en la BBDD
        await dao.crearPartida(juego);
        console.log("Partida creada con id:", juego.id);
    } catch (e) {
        console.error("Error creando partida:", e);
        mostrarMensaje("❌ No se pudo crear partida. Revisa la BBDD o el usuario.");
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

    if (!ok) finalizar("💥 Has perdido");
    else if (juego.verificarVictoria()) finalizar("🏆 Has ganado");
}

async function finalizar(msg) {
    detenerTemporizador();
    mostrarMensaje(msg);

    if (juego?.id) {
        try {
            await dao.finalizarPartida(juego.id);
        } catch (e) {
            console.error("Error finalizando partida:", e);
        }
    }

    juego = null;
    btnControl.textContent = "▶ Iniciar";
    // Rehabilita el select de dificultad al finalizar partida
    selectDificultad.disabled = false;
}

// ================== GUARDAR PARTIDA ==================
btnGuardar.onclick = async () => {
    if (!juego) return mostrarMensaje("❌ No hay partida en curso");

    try {
        await dao.guardarPartida(juego.id, juego.descubiertas, juego.tablero);
        mostrarMensaje("💾 Partida guardada");
    } catch (e) {
        console.error("Error guardando partida:", e);
        mostrarMensaje("❌ Error al guardar partida");
    }
};

// ================== BOTÓN CONTROL ==================
btnControl.addEventListener("click", async () => {
    if (!juego) {
        await iniciarJuego(selectDificultad.value);
        return;
    }

    if (!juegoPausado) {
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
