import { supabase } from "./Supabaseclient.js";
import { mostrarMensaje, ocultarMensaje } from "./extras/mensajes.js";

const listaPartidas = document.getElementById('listaPartidas');
const btnVolver = document.getElementById('btnVolver');

// Recuperar usuario actual de sessionStorage
const usuarioActual = JSON.parse(sessionStorage.getItem('usuarioActual'));

if (!usuarioActual?.id) {
    mostrarMensaje('No se detectó un usuario activo. Por favor inicia sesión.', 'error');
} else {
    cargarPartidas(usuarioActual.id);
}

// ================== Cargar partidas desde Supabase ==================
async function cargarPartidas(usuarioId) {
    ocultarMensaje();
    try {
        const { data: partidas, error } = await supabase
            .from('Buscaminas')
            .select('id, filas, columnas, dificultad, tiempoInicio, tiempoFin')
            .eq('usuarioId', usuarioId)
            .order('tiempoInicio', { ascending: false });

        if (error) throw error;

        if (!partidas || partidas.length === 0) {
            mostrarMensaje('No tienes partidas guardadas', 'info');
            return;
        }

        // Mostrar partidas en lista
        listaPartidas.innerHTML = '';
        partidas.forEach(partida => {
            const li = document.createElement('li');
            li.className = 'partida-item';
            li.innerHTML = `
                <span class="info-partida">
                    <strong>Dificultad:</strong> ${partida.dificultad} | 
                    <strong>Filas:</strong> ${partida.filas} | 
                    <strong>Columnas:</strong> ${partida.columnas} | 
                    <strong>Inicio:</strong> ${new Date(partida.tiempoInicio).toLocaleString()}
                </span>
                <button class="btn-cargar boton boton-principal" data-id="${partida.id}">Cargar</button>
            `;
            listaPartidas.appendChild(li);
        });

        // Agregar evento para cargar partida
        document.querySelectorAll('.btn-cargar').forEach(btn => {
            btn.addEventListener('click', async () => {
                const idPartida = btn.dataset.id;

                // Guardamos ID de partida para cargar en tablero
                sessionStorage.setItem('cargarPartidaId', idPartida);

                // Redirigir al tablero
                window.location.href = 'tablero.html';
            });
        });

    } catch (err) {
        console.error('Error al cargar partidas:', err);
        mostrarMensaje('Error al cargar partidas', 'error');
    }
}

// ================== Botón volver ==================
btnVolver.addEventListener('click', () => {
    window.location.href = 'tablero.html';
});
