import { supabase } from "../Supabaseclient.js";

export class DAOBuscaminas {

  async crearPartida(buscaminas) {
    const { data, error } = await supabase
      .from("Buscaminas")
      .insert({
        usuarioId: buscaminas.usuarioId,
        filas: buscaminas.filas,
        columnas: buscaminas.columnas,
        totalCeldas: buscaminas.totalCeldas,
        dificultad: buscaminas.dificultad,
        tiempoInicio: new Date().toISOString(),
        tiempoFin: null,
        tablero: JSON.stringify(buscaminas.tablero),
        minas: JSON.stringify(buscaminas.minas),
        celdasDescubiertas: JSON.stringify(buscaminas.descubiertas)
      })
      .select("id")
      .single();

    if (error) throw error;
    buscaminas.id = data.id;
    return buscaminas;
  }

  async guardarPartida(id, celdasDescubiertas, tablero) {
    const { error } = await supabase
      .from("Buscaminas")
      .update({
        celdasDescubiertas: JSON.stringify(celdasDescubiertas),
        tablero: JSON.stringify(tablero)
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

  async findPartidaActiva(usuarioId) {
    const { data, error } = await supabase
      .from("Buscaminas")
      .select("*")
      .eq("usuarioId", usuarioId)
      .is("tiempoFin", null)
      .order("tiempoInicio", { ascending: false })
      .limit(1)
      .single();

    if (error) return null;
    return data;
  }
}
