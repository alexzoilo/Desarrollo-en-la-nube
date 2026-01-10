import { supabase } from "./Supabaseclient.js";
import { mostrarMensaje, ocultarMensaje } from "./extras/mensajes.js";

const listaPartidas = document.getElementById('listaPartidas');
const btnVolver = document.getElementById('btnVolver');

const usuarioActual = JSON.parse(sessionStorage.getItem('usuarioActual'));

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
                    <button class="btn-cargar boton boton-principal">Cargar partida</button>
                    <button class="boton-eliminar">Eliminar partida</button>
                </div>
            `;

            listaPartidas.appendChild(li);

            // CARGAR PARTIDA
            const btnCargar = li.querySelector('.btn-cargar');
            btnCargar.addEventListener('click', () => {
                sessionStorage.setItem('cargarPartidaId', partida.id);
                window.location.href = 'tablero.html';
            });

            // ELIMINAR PARTIDA
            const btnEliminar = li.querySelector('.btn-eliminar');
            btnEliminar.addEventListener('click', async () => {
                const confirmar = confirm('¿Seguro que deseas eliminar esta partida?');
                if (!confirmar) return;

                try {
                    const { error } = await supabase
                        .from('Buscaminas')
                        .delete()
                        .eq('id', partida.id)
                        .eq('usuarioId', usuarioActual.id);

                    if (error) throw error;

                    mostrarMensaje('Partida eliminada correctamente', 'success');
                    cargarPartidas(usuarioActual.id);
                } catch (err) {
                    console.error(err);
                    mostrarMensaje('Error al eliminar la partida', 'error');
                }
            });
        });

    } catch (err) {
        console.error('Error al cargar partidas:', err);
        mostrarMensaje('Error al cargar partidas', 'error');
    }
}

btnVolver?.addEventListener('click', () => {
    window.location.href = 'tablero.html';
});
