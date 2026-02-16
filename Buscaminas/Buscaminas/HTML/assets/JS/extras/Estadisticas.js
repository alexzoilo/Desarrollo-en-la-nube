
import { supabase } from "../Supabaseclient.js";

export async function mostrarEstadisticas() {
    const { data: user, error } = await supabase.auth.getUser();
    if (error || !user?.user) return;

    const usuarioId = user.user.id;

    const { data, error: fetchError } = await supabase
        .from('Usuarios')
        .select('tiempoTotalJugado, partidasGanadas, partidasPerdidas, puntos')
        .eq('id', usuarioId)
        .single();

    if (fetchError || !data) {
        console.error(fetchError);
        return;
    }

    const segundos = data.tiempoTotalJugado || 0;
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;

    const tiempoDiv = document.getElementById("tiempoTotalJugado");
    if (tiempoDiv) tiempoDiv.textContent = `Tiempo total jugado: ${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;

    const ganadasDiv = document.getElementById("partidasGanadas");
    if (ganadasDiv) ganadasDiv.textContent = `Partidas ganadas: ${data.partidasGanadas || 0}`;

    const perdidasDiv = document.getElementById("partidasPerdidas");
    if (perdidasDiv) perdidasDiv.textContent = `Partidas perdidas: ${data.partidasPerdidas || 0}`;

    const puntosDiv = document.getElementById("puntos");
    if (puntosDiv) puntosDiv.textContent = `Puntos: ${data.puntos || 0}`;
}
