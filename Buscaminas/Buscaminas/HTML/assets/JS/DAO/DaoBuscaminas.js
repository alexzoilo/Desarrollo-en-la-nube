import { supabase } from "../Supabaseclient.js";
import { Buscaminas } from "../Clases/Buscaminas.js";

export class DAOBuscaminas {

  // Crear nueva partida
  async crearPartida(buscaminas) {
    const { data, error } = await supabase
      .from("Buscaminas")
      .insert({
        usuarioId: buscaminas.usuarioId,       // usuario logueado
        filas: buscaminas.filas,
        columnas: buscaminas.columnas,
        totalCeldas: buscaminas.totalCeldas,
        celdasDescubiertas: buscaminas.descubiertas,
        dificultad: buscaminas.dificultad,
        tiempoInicio: new Date().toISOString(),
        tiempoFin: null,
        tablero: buscaminas.tablero,
        minas: buscaminas.minas
      })
      .select("id")
      .single();

    if (error) throw error;
    buscaminas.id = data.id;
    return buscaminas;
  }

  // Guardar partida en curso
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

  // Última partida activa del usuario
  async findPartidaActiva(usuarioId) {
    const { data, error } = await supabase
      .from("Buscaminas")
      .select("*")
      .eq("usuarioId", usuarioId)
      .is("tiempoFin", null)
      .order("id", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return data;
  }
}
