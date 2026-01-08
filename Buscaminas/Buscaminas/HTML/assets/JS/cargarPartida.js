import { supabase } from "./Supabaseclient.js";
import { mostrarMensaje, ocultarMensaje } from "./extras/mensajes.js";

const listaPartidas = document.getElementById('listaPartidas');
const btnVolver = document.getElementById('btnVolver');

// Usuario actual almacenado en sessionStorage
const usuarioActual = JSON.parse(sessionStorage.getItem('usuarioActual'));

if (!usuarioActual?.id) {
    mostrarMensaje('No se detectó un usuario activo. Por favor inicia sesión.', 'error');
} else {
    cargarPartidas(usuarioActual.id);
}

// Función para obtener partidas del usuario
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
                <span>Dificultad: ${partida.dificultad} | Filas: ${partida.filas} | Columnas: ${partida.columnas} | Inicio: ${new Date(partida.tiempoInicio).toLocaleString()}</span>
                <button class="btn-cargar" data-id="${partida.id}">Cargar</button>
            `;
            listaPartidas.appendChild(li);
        });

        // Agregar evento para cargar partida
        document.querySelectorAll('.btn-cargar').forEach(btn => {
            btn.addEventListener('click', () => {
                const idPartida = btn.dataset.id;
                sessionStorage.setItem('cargarPartidaId', idPartida);
                window.location.href = 'tablero.html'; // Redirige al tablero y carga la partida
            });
        });

    } catch (err) {
        console.error('Error al cargar partidas:', err);
        mostrarMensaje('Error al cargar partidas', 'error');
    }
}

// Volver al tablero
btnVolver.addEventListener('click', () => {
    window.location.href = 'tablero.html';
});