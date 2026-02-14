import { supabase } from "../Supabaseclient.js";

export async function mostrarEstadisticas() {
    const { data: user, error } = await supabase.auth.getUser();
    if (error || !user?.user) return;

    const usuarioId = user.user.id;

    const { data, error: fetchError } = await supabase
        .from('Usuarios')
        .select('tiempoTotalJugado, partidasGanadas, partidasPerdidas')
        .eq('id', usuarioId)
        .single();

    if (fetchError || !data) {
        console.error(fetchError);
        return;
    }

    // ⏱ Tiempo jugado
    const segundos = data.tiempoTotalJugado || 0;
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;

    document.getElementById("tiempoTotalJugado").textContent =
        `Tiempo total jugado: ${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;

    // 🎮 Partidas
    const ganadas = data.partidasGanadas || 0;
    const perdidas = data.partidasPerdidas || 0;

    document.getElementById("partidasGanadas").textContent =
        `Partidas ganadas: ${ganadas}`;

    document.getElementById("partidasPerdidas").textContent =
        `Partidas perdidas: ${perdidas}`;

    // ⭐ CÁLCULO DE PUNTOS
    const puntos =
        (ganadas * 10) +
        (perdidas * -5) +
        Math.floor(segundos / 600); // 1 punto cada 10 min

    document.getElementById("puntos").textContent =
        `Puntos: ${puntos}`;
}
