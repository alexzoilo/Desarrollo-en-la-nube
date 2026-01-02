import { supabase } from "../Supabaseclient.js";

export class DAOBuscaminas {

  // Crear partida nueva
  async crearPartida(buscaminas) {
    const { data, error } = await supabase
      .from("Buscaminas")
      .insert({
        usuarioId: buscaminas.usuarioId,   // UUID del usuario logueado
        filas: buscaminas.filas,
        columnas: buscaminas.columnas,
        totalCeldas: buscaminas.totalCeldas,
        celdasDescubiertas: buscaminas.descubiertas, // JSON
        dificultad: buscaminas.dificultad,
        tiempoInicio: new Date().toISOString(),
        tiempoFin: null,
        tablero: buscaminas.tablero,       // JSON
        minas: buscaminas.minas            // JSON
      })
      .select("id")
      .single();

    if (error) throw error;
    buscaminas.id = data.id;
    return buscaminas;
  }

  // Guardar partida (update)
  async guardarPartida(id, celdasDescubiertas, tablero) {
    const { error } = await supabase
      .from("Buscaminas")
      .update({ celdasDescubiertas, tablero })
      .eq("id", id);

    if (error) throw error;
  }

  // Finalizar partida
  async finalizarPartida(id) {
    const { error } = await supabase
      .from("Buscaminas")
      .update({ tiempoFin: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  }

  // Última partida activa de un usuario
  async findPartidaActiva(usuarioId) {
    const { data, error } = await supabase
      .from("Buscaminas")
      .select("*")
      .match({ usuarioId, tiempoFin: null })
      .order("tiempoInicio", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return data;
  }
}
