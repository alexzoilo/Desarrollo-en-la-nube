import { supabase } from "./Supabaseclient.js";
import { mostrarMensaje, ocultarMensaje } from "./extras/mensajes.js";

const listaPartidas = document.getElementById('listaPartidas');
const btnVolver = document.getElementById('btnVolver');
const usuarioActual = JSON.parse(sessionStorage.getItem('usuarioActual'));


// ================= MODAL =================

const modal = document.createElement("div");
modal.className = "modal";
modal.style.display = "none";

const modalContenido = document.createElement("div");
modalContenido.className = "modal-contenido";

const texto = document.createElement("p");
texto.textContent = "¿Seguro que deseas eliminar esta partida?";

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


// ================= CARGAR PARTIDAS =================

if (!usuarioActual?.id) {
    mostrarMensaje('No se detectó un usuario activo.', 'error');
} else {
    cargarPartidas(usuarioActual.id);
}

async function cargarPartidas(usuarioId) {
    ocultarMensaje();

    try {
        const { data: partidas, error } = await supabase
            .from('Buscaminas')
            .select('*')
            .eq('usuarioId', usuarioId)
            .order('tiempoInicio', { ascending: false });

        if (error) throw error;

        listaPartidas.innerHTML = '';

        if (!partidas?.length) {
            mostrarMensaje('No tienes partidas guardadas', 'info');
            return;
        }

        partidas.forEach(partida => {
            const li = document.createElement('li');
            li.className = 'partida-item card';

            li.innerHTML = `
                <div class="partida-header">
                    <span class="partida-dificultad ${partida.dificultad.toLowerCase()}">
                        ${partida.dificultad.toUpperCase()}
                    </span>
                    <span>${new Date(partida.tiempoInicio).toLocaleString()}</span>
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

            // Cargar partida
            li.querySelector('.boton-guardar').addEventListener('click', () => {
                sessionStorage.setItem('cargarPartidaId', partida.id);
                window.location.href = 'tablero.html';
            });

            // Eliminar partida con modal
            li.querySelector('.boton-eliminar').addEventListener('click', () => {
                abrirModal(async () => {
                    try {
                        const { error } = await supabase
                            .from('Buscaminas')
                            .delete()
                            .eq('id', partida.id)
                            .eq('usuarioId', usuarioActual.id);

                        if (error) throw error;

                        mostrarMensaje('Partida eliminada', 'success');
                        cargarPartidas(usuarioActual.id);

                    } catch (err) {
                        console.error(err);
                        mostrarMensaje('Error al eliminar', 'error');
                    }
                }, "¿Eliminar esta partida?");
            });
        });

    } catch (err) {
        console.error(err);
        mostrarMensaje('Error al cargar partidas', 'error');
    }
}


// ================= VOLVER =================

btnVolver?.addEventListener('click', () => {
    window.location.href = 'tablero.html';
});
