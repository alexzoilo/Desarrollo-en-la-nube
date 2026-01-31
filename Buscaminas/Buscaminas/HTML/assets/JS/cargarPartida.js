import { supabase } from "./Supabaseclient.js";
import { mostrarMensaje, ocultarMensaje } from "./extras/mensajes.js";

const listaPartidas = document.getElementById('listaPartidas');
const btnVolver = document.getElementById('btnVolver');
const usuarioActual = JSON.parse(sessionStorage.getItem('usuarioActual'));

// ------------------- Modal de confirmación -------------------
const modal = document.createElement("div");
modal.className = "modal";
modal.style.display = "none";

const modalContenido = document.createElement("div");
modalContenido.className = "modal-contenido";

const texto = document.createElement("p");

const botones = document.createElement("div");
botones.className = "modal-botones";

const btnConfirmar = document.createElement("button");
btnConfirmar.textContent = "Eliminar";

const btnCancelar = document.createElement("button");
btnCancelar.textContent = "Cancelar";

botones.append(btnConfirmar, btnCancelar);
modalContenido.append(texto, botones);
modal.append(modalContenido);
document.body.appendChild(modal);

let accionConfirmar = null;

function abrirModal(callback, mensaje) {
    texto.textContent = mensaje;
    accionConfirmar = callback;
    modal.style.display = "flex";
}

btnCancelar.addEventListener("click", () => {
    modal.style.display = "none";
    accionConfirmar = null;
});

btnConfirmar.addEventListener("click", async () => {
    modal.style.display = "none";
    if (accionConfirmar) await accionConfirmar();
    accionConfirmar = null;
});

// ------------------- Funciones para fecha y hora -------------------
function obtenerFecha(fechaUTC) {
    const fecha = new Date(fechaUTC);
    return fecha.toLocaleDateString('es-ES');
}

function obtenerHora(fechaUTC) {
    const fecha = new Date(fechaUTC);
    return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ------------------- Cargar partidas -------------------
if (!usuarioActual?.id) {
    mostrarMensaje('No tienes partidas guardadas.', 'error');
} else {
    cargarPartidas(usuarioActual.id);
}

async function cargarPartidas(usuarioId) {
    ocultarMensaje();
    listaPartidas.innerHTML = '<p>Cargando partidas...</p>';

    try {
        const { data: partidas, error } = await supabase
            .from('Buscaminas')
            .select('*')
            .eq('usuarioId', usuarioId)
            .order('tiempoInicio', { ascending: false });

        if (error) throw error;

        listaPartidas.innerHTML = '';

        if (!partidas?.length) {
            mostrarMensaje('No tienes partidas guardadas', 'error');
            return;
        }

        partidas.forEach(partida => {
            const li = document.createElement('li');
            li.className = 'partida-item card';

            const fechaFormateada = `${obtenerFecha(partida.tiempoInicio)} ${obtenerHora(partida.tiempoInicio)}`;

            li.innerHTML = `
                <div class="partida-header">
                    <span class="partida-dificultad ${partida.dificultad.toLowerCase()}">
                        ${partida.dificultad.toUpperCase()}
                    </span>
                    <span>${fechaFormateada}</span>
                </div>

                <div class="partida-body">
                    <p><strong>Filas:</strong> ${partida.filas}</p>
                    <p><strong>Columnas:</strong> ${partida.columnas}</p>
                </div>

                <div class="partida-acciones">
                    <button class="boton-guardar">Cargar partida</button>
                    <button class="boton-eliminar">Eliminar</button>
                </div>
            `;

            listaPartidas.appendChild(li);

            // ------------------- Botón Cargar partida -------------------
            li.querySelector('.boton-guardar').addEventListener('click', () => {
                sessionStorage.setItem('cargarPartidaId', partida.id);
                window.location.href = 'tablero.html';
            });

            // ------------------- Botón Eliminar partida -------------------
            li.querySelector('.boton-eliminar').addEventListener('click', () => {
                abrirModal(async () => {
                    try {
                        const { error } = await supabase
                            .from('Buscaminas')
                            .delete()
                            .eq('id', partida.id)
                            .eq('usuarioId', usuarioActual.id);

                        if (error) throw error;

                        mostrarMensaje('Partida eliminada', 'correcto');
                        setTimeout(() => ocultarMensaje(), 3000);

                        li.remove();

                        if (!listaPartidas.children.length) {
                            mostrarMensaje('No tienes partidas guardadas', 'error');
                        }

                    } catch (err) {
                        console.error(err);
                        mostrarMensaje('Error al eliminar', 'error');
                    }
                }, `¿Eliminar la partida del ${obtenerFecha(partida.tiempoInicio)} hecha a las ${obtenerHora(partida.tiempoInicio)}?`);
            });
        });

    } catch (err) {
        console.error(err);
        mostrarMensaje('Error al cargar partidas', 'error');
    }
}

// ------------------- Volver al tablero -------------------
btnVolver?.addEventListener('click', () => {
    window.location.href = 'tablero.html';
});
