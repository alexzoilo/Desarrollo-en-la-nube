import {
    Buscaminas
} from "./Clases/Buscaminas.js";
import {
    Dificultad
} from "./Clases/Dificultad.js";
import {
    DAOBuscaminas
} from "./DAO/DaoBuscaminas.js";
import {
    supabase
} from "./Supabaseclient.js";

const dao = new DAOBuscaminas();
let juego = null;
let filas = 9;
let columnas = 9;
let dificultadActual = "FACIL";
let juegoPausado = false;
let segundosTotales = 0;
let timerInterval = null;
let usuarioId = null;

const tableroDiv = document.getElementById("tablero");
const selectDificultad = document.getElementById("dificultad");
const temporizadorSpan = document.getElementById("temporizador");
const mensajeDiv = document.getElementById("mensaje");
const btnControl = document.getElementById("btnControl");
const btnGuardar = document.getElementById("btnGuardar");

/* ==================== OBTENER USUARIO ==================== */
async function obtenerUsuarioLogueado() {
    const {
        data: {
            user
        },
        error
    } = await supabase.auth.getUser();
    if (error) {
        console.error("Error obteniendo usuario:", error);
        return null;
    }
    if (!user) {
        console.warn("No hay usuario logueado");
        return null;
    }
    return user.id; // UUID del usuario
}

/* ==================== UTILIDADES ==================== */
function formatTiempo(s) {
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `Cronometro: ${h}:${m}:${ss}`;
}

function mostrarMensaje(txt) {
    mensajeDiv.textContent = txt;
}

function ocultarMensaje() {
    mensajeDiv.textContent = "";
}

function ajustarFilasColumnas(dif) {
    dificultadActual = dif;
    filas = columnas = dif === "FACIL" ? 10 : dif === "MEDIO" ? 15 : 20;
    selectDificultad.value = dificultadActual;
}

/* ==================== TABLERO ==================== */
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

/* ==================== TEMPORIZADOR ==================== */
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

/* ==================== PARTIDA ==================== */
async function iniciarJuego(dificultad) {
    usuarioId = await obtenerUsuarioLogueado();
    if (!usuarioId) return;

    ajustarFilasColumnas(dificultad);

    juego = new Buscaminas(usuarioId, filas, columnas, Dificultad[dificultad]);

    // Guardar partida nueva
    await dao.crearPartida(juego);

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
    if (juego?.id) await dao.finalizarPartida(juego.id);
    juego = null;
    btnControl.textContent = "▶ Iniciar";
}

/* ==================== GUARDAR ==================== */
btnGuardar.onclick = async () => {
    if (!juego) return mostrarMensaje("❌ No hay partida");
    await dao.guardarPartida(juego.id, juego.descubiertas, juego.tablero);
    mostrarMensaje("💾 Partida guardada");
};

/* ==================== CARGAR ==================== */
async function cargarPartida() {
    usuarioId = await obtenerUsuarioLogueado();
    if (!usuarioId) return;

    // Aquí usamos Supabase JS correctamente para evitar 406
    const {
        data,
        error
    } = await supabase
        .from("Buscaminas")
        .select("*")
        .eq("usuarioId", usuarioId)
        .is("tiempoFin", null)
        .order("tiempoInicio", {
            ascending: false
        })
        .limit(1)
        .single();

    if (error) {
        console.error("Error al cargar partida activa:", error);
        return;
    }
    if (!data) return;

    juego = new Buscaminas(usuarioId, data.filas, data.columnas, Dificultad[data.dificultad]);
    juego.id = data.id;
    juego.tablero = data.tablero;
    juego.descubiertas = data.celdasDescubiertas;
    juego.minas = data.minas;

    crearTableroHTML();
    actualizarTablero();
}

/* ==================== INICIALIZACIÓN ==================== */
window.onload = cargarPartida;

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
