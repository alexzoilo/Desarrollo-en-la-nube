import { supabase } from "./Supabaseclient.js";
import { mostrarMensaje, ocultarMensaje } from "./extras/mensajes.js";

const listaPartidas = document.getElementById('listaPartidas');
const btnVolver = document.getElementById('btnVolver');

const usuarioActual = JSON.parse(sessionStorage.getItem('usuarioActual'));

// Variable para guardar la partida a eliminar
let partidaAEliminar = null;

// Modal y botones (se cargarán dinámicamente)
let modal, btnConfirmar, btnCancelar, textoModal;

// Cargar el modal desde un HTML externo
async function cargarModal() {
    try {
        const response = await fetch('./modalConfirmacion.html');
        const html = await response.text();
        document.body.insertAdjacentHTML('beforeend', html);

        modal = document.getElementById('modal-confirmacion');
        btnConfirmar = document.getElementById('confirmar-eliminar');
        btnCancelar = document.getElementById('cancelar-eliminar');
        textoModal = document.getElementById('texto-modal');

        // Eventos del modal
        btnCancelar.addEventListener('click', () => {
            modal.style.display = 'none';
            partidaAEliminar = null;
        });

        btnConfirmar.addEventListener('click', async () => {
            if (!partidaAEliminar) return;

            try {
                const { error } = await supabase
                    .from('Buscaminas')
                    .delete()
                    .eq('id', partidaAEliminar)
                    .eq('usuarioId', usuarioActual.id);

                if (error) throw error;

                modal.style.display = 'none';
                partidaAEliminar = null;
                cargarPartidas(usuarioActual.id);

            } catch (err) {
                console.error(err);
                mostrarMensaje('Error al eliminar la partida', 'error');
            }
        });

    } catch (err) {
        console.error('Error cargando modal:', err);
    }
}

// Inicializar
(async function init() {
    if (!usuarioActual?.id) {
        mostrarMensaje('No se detectó un usuario activo. Por favor inicia sesión.', 'error');
        return;
    }

    await cargarModal();
    cargarPartidas(usuarioActual.id);
})();

// Función para cargar partidas
async function cargarPartidas(usuarioId) {
    ocultarMensaje();

    try {
        const { data: partidas, error } = await supabase
            .from('Buscaminas')
            .select('id, filas, columnas, dificultad, tiempoInicio, tiempoFin')
            .eq('usuarioId', usuarioId)
            .order('tiempoInicio', { ascending: false });

        if (error) throw error;

        listaPartidas.innerHTML = '';

        if (!partidas || partidas.length === 0) {
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
                    <span class="partida-tiempo">
                        ${new Date(partida.tiempoInicio).toLocaleString()}
                    </span>
                </div>

                <div class="partida-body">
                    <p><strong>Filas:</strong> ${partida.filas}</p>
                    <p><strong>Columnas:</strong> ${partida.columnas}</p>
                </div>

                <div class="partida-acciones">
                    <button class="boton-guardar">Cargar partida</button>
                    <button class="boton-eliminar">Eliminar partida</button>
                </div>
            `;

            listaPartidas.appendChild(li);

            // CARGAR PARTIDA
            li.querySelector('.boton-guardar').addEventListener('click', () => {
                sessionStorage.setItem('cargarPartidaId', partida.id);
                window.location.href = 'tablero.html';
            });

            // MOSTRAR MODAL ELIMINAR
            li.querySelector('.boton-eliminar').addEventListener('click', () => {
                partidaAEliminar = partida.id;
                textoModal.textContent = '¿Seguro que deseas eliminar esta partida? Esta acción es irreversible.';
                modal.style.display = 'flex';
            });
        });

    } catch (err) {
        console.error(err);
        mostrarMensaje('Error al cargar partidas', 'error');
    }
}

// Botón volver al tablero
btnVolver?.addEventListener('click', () => {
    window.location.href = 'tablero.html';
});
