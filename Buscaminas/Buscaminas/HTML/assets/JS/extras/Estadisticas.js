import { supabase } from "../Supabaseclient.js";

// Exportamos la función para que otros módulos la puedan usar
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
    const { data: user, error } = await supabase.auth.getUser();
    if (error || !user?.user) return;

    const usuarioId = user.user.id;

    const { data, error: fetchError } = await supabase
        .from('Usuarios')
        .select('tiempoTotalJugado, partidasGanadas, partidasPerdidas, dificultadPreferida')
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

    document.getElementById("tiempoTotalJugado").textContent =
        `Tiempo total jugado: ${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;

    const ganadas = data.partidasGanadas || 0;
    const perdidas = data.partidasPerdidas || 0;

    document.getElementById("partidasGanadas").textContent =
        `Partidas ganadas: ${ganadas}`;

    document.getElementById("partidasPerdidas").textContent =
        `Partidas perdidas: ${perdidas}`;

    const dificultad = data.dificultadPreferida || "FACIL";

    const puntos = calcularPuntos({ ganadas, perdidas, segundos, dificultad });
    document.getElementById("puntos").textContent = `Puntos: ${puntos}`;
}
