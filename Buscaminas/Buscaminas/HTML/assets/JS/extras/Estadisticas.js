import { supabase } from "../Supabaseclient.js";

export function calcularPuntos({ ganadas, perdidas, segundos, dificultad }) {
    const puntosGanadas = ganadas * 10;
    const penalizacionPerdidas = perdidas * 8;
    const bonusTiempo = Math.floor(segundos / 200);

    let multiplicador = 1;
    if (dificultad === "MEDIO") multiplicador = 1.5;
    if (dificultad === "DIFICIL") multiplicador = 2;

    const puntosBase = puntosGanadas - penalizacionPerdidas + bonusTiempo;

    return Math.max(0, Math.floor(puntosBase * multiplicador));
}

export async function mostrarEstadisticas() {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) return;

    const usuarioId = userData.user.id;

    const { data, error: fetchError } = await supabase
        .from('Usuarios')
        .select('tiempoTotalJugado, partidasGanadas, partidasPerdidas, puntos')
        .eq('id', usuarioId)
        .single();

    if (fetchError || !data) return;

    const segundos = data.tiempoTotalJugado || 0;
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;

    document.getElementById("tiempoTotalJugado")?.textContent =
        `Tiempo total jugado: ${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;

    document.getElementById("partidasGanadas")?.textContent =
        `Partidas ganadas: ${data.partidasGanadas || 0}`;

    document.getElementById("partidasPerdidas")?.textContent =
        `Partidas perdidas: ${data.partidasPerdidas || 0}`;

    const totalPuntos = data.puntos || 0;
    document.getElementById("puntos")?.textContent =
        `Puntos totales: ${totalPuntos}`;

    const totalPartidas = (data.partidasGanadas || 0) + (data.partidasPerdidas || 0) || 1;
    const puntosPromedio = Math.floor(totalPuntos / totalPartidas);
    document.getElementById("puntosPromedio")?.textContent =
        `Puntos promedio por partida: ${puntosPromedio}`;
}
