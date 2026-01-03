import { supabase } from "../Supabaseclient.js";

export class DAOBuscaminas {

  async crearPartida(buscaminas) {
    const { data, error } = await supabase
      .from("Buscaminas")
      .insert({
        usuarioId: buscaminas.usuarioId, // UUID DEL USER LOGUEADO
        filas: buscaminas.filas,
        columnas: buscaminas.columnas,
        totalCeldas: buscaminas.totalCeldas,
        dificultad: buscaminas.dificultad,
        tiempoInicio: new Date().toISOString(),
        tiempoFin: null,
        tablero: buscaminas.tablero,
        minas: buscaminas.minas,
        celdasDescubiertas: buscaminas.descubiertas
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async guardarPartida(id, tablero, celdasDescubiertas) {
    const { error } = await supabase
      .from("Buscaminas")
      .update({
        tablero,
        celdasDescubiertas
      })
      .eq("id", id);

    if (error) throw error;
  }

  async finalizarPartida(id) {
    const { error } = await supabase
      .from("Buscaminas")
      .update({ tiempoFin: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  }

  async cargarPartidaActiva(usuarioId) {
    const { data, error } = await supabase
      .from("Buscaminas")
      .select("*")
      .eq("usuarioId", usuarioId)
      .is("tiempoFin", null)
      .order("tiempoInicio", { ascending: false })
      .limit(1)
      .maybeSingle(); // 🔥

    if (error) throw error;
    return data;
  }
}
