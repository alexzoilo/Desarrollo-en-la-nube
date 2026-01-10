import { supabase } from "./Supabaseclient.js";
import { mostrarMensaje, ocultarMensaje } from "./extras/mensajes.js";

const listaPartidas = document.getElementById('listaPartidas');
const btnVolver = document.getElementById('btnVolver');

const usuarioActual = JSON.parse(sessionStorage.getItem('usuarioActual'));

const modal = document.getElementById("modal-confirmacion");
const btnConfirmar = document.getElementById("confirmar-eliminar");
const btnCancelar = document.getElementById("cancelar-eliminar");

// guardamos el id de la partida a eliminar
let partidaAEliminar = null;

if (!usuarioActual?.id) {
    mostrarMensaje('No se detectó un usuario activo. Por favor inicia sesión.', 'error');
} else {
    cargarPartidas(usuarioActual.id);
}

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
                modal.style.display = 'flex';
            });
        });

    } catch (err) {
        console.error(err);
        mostrarMensaje('Error al cargar partidas', 'error');
    }
}

// CANCELAR MODAL
btnCancelar.addEventListener('click', () => {
    modal.style.display = 'none';
    partidaAEliminar = null;
});

// CONFIRMAR ELIMINACIÓN
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

btnVolver?.addEventListener('click', () => {
    window.location.href = 'tablero.html';
});
