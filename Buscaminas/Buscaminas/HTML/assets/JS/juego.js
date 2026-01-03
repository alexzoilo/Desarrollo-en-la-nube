import { Buscaminas } from "./Clases/Buscaminas.js";
import { Dificultad } from "./Clases/Dificultad.js";
import { DAOBuscaminas } from "./DAO/DaoBuscaminas.js";
import { supabase } from "./Supabaseclient.js";

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

// ================== OBTENER USUARIO LOGUEADO ==================
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
    return user.id; // UUID del usuario logueado
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
    const usuarioId = await obtenerUsuarioLogueado();
    if (!usuarioId) {
        mostrarMensaje("❌ Debes iniciar sesión para jugar");
        return;
    }

    ajustarFilasColumnas(dificultad);
    selectDificultad.disabled = true; // Bloquear dificultad mientras dure la partida

    // Crear instancia de Buscaminas
    juego = new Buscaminas(usuarioId, filas, columnas, Dificultad[dificultad]);

    try {
        await dao.crearPartida(juego); // Guardar partida en Supabase
        console.log("Partida creada con id:", juego.id, "usuario:", usuarioId);
    } catch (e) {
        console.error("Error creando partida:", e);
        mostrarMensaje("❌ No se pudo crear la partida.");
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
    selectDificultad.disabled = false; // desbloquear dificultad
}

// ================== GUARDAR PARTIDA =================
// ---------------- BOTÓN CARGAR PARTIDA ----------------
btnGuardar.textContent = "📂 Cargar Partida"; // cambiamos el texto del botón

btnGuardar.onclick = async () => {
    if (!usuarioActual?.id) return mostrarMensaje("❌ Debes iniciar sesión");

    try {
        // 1️⃣ Consultar todas las partidas del usuario
        const { data: partidas, error } = await dao.listarPartidas(usuarioActual.id);

        if (error) throw error;

        if (!partidas || partidas.length === 0) {
            mostrarMensaje("❌ No tienes partidas guardadas");
            return;
        }

        // 2️⃣ Crear una lista de partidas para seleccionar
        const listaDiv = document.createElement("div");
        listaDiv.className = "lista-partidas";

        partidas.forEach(p => {
            const btn = document.createElement("button");
            btn.textContent = `Partida ${p.id.slice(0, 8)} | ${p.dificultad} | ${new Date(p.tiempoInicio).toLocaleString()}`;
            btn.onclick = () => cargarPartida(p);
            listaDiv.appendChild(btn);
        });

        // Limpiar el tablero y mostrar lista
        tableroDiv.innerHTML = "";
        tableroDiv.appendChild(listaDiv);

    } catch (e) {
        console.error("Error cargando partidas:", e);
        mostrarMensaje("❌ Error al cargar partidas");
    }
};

// ---------------- FUNCION PARA CARGAR UNA PARTIDA ----------------
async function cargarPartida(partida) {
    // Si ya hay juego en curso, finalizamos primero
    if (juego) {
        detenerTemporizador();
        juego = null;
    }

    juego = new Buscaminas(
        usuarioActual.id,
        partida.filas,
        partida.columnas,
        Dificultad[partida.dificultad]
    );

    juego.id = partida.id;
    juego.tablero = partida.tablero;
    juego.descubiertas = partida.celdasDescubiertas;
    juego.minas = partida.minas;

    // Ajustamos filas y columnas actuales
    filas = partida.filas;
    columnas = partida.columnas;
    dificultadActual = partida.dificultad;

    // Crear tablero HTML y actualizar
    crearTableroHTML();
    actualizarTablero();

    // Iniciar temporizador desde cero o desde el tiempo guardado
    segundosTotales = 0;
    iniciarTemporizador();

    btnControl.textContent = "⏸ Pausar";
    selectDificultad.disabled = true;
    ocultarMensaje();
}


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
