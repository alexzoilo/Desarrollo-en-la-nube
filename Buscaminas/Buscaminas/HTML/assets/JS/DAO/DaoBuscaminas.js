import { supabase } from "../Supabaseclient.js";

export class DAOBuscaminas {

  // Crear partida nueva
  async crearPartida(buscaminas) {
    try {
      const { data, error } = await supabase
        .from("Buscaminas")
        .insert([{
          usuarioId: buscaminas.usuarioId,       // UUID del usuario actual
          filas: buscaminas.filas,
          columnas: buscaminas.columnas,
          totalCeldas: buscaminas.totalCeldas,
          dificultad: buscaminas.dificultad,
          tiempoInicio: new Date().toISOString(),
          tiempoFin: null,
          tablero: buscaminas.tablero,
          minas: buscaminas.minas,
          celdasDescubiertas: buscaminas.descubiertas
        }])
        .select("id")
        .single();

      if (error) throw error;

      buscaminas.id = data.id;
      return buscaminas;
    } catch (e) {
      console.error("Error en crearPartida:", e);
      throw e;
    }
  }

  // Guardar partida (update parcial)
  async guardarPartida(id, celdasDescubiertas, tablero) {
    try {
      const { error } = await supabase
        .from("Buscaminas")
        .update({ celdasDescubiertas, tablero })
        .eq("id", id);

      if (error) throw error;
    } catch (e) {
      console.error("Error en guardarPartida:", e);
      throw e;
    }
  }

  // Finalizar partida (marcar tiempoFin)
  async finalizarPartida(id) {
    try {
      const { error } = await supabase
        .from("Buscaminas")
        .update({ tiempoFin: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    } catch (e) {
      console.error("Error en finalizarPartida:", e);
      throw e;
    }
  }

  // Obtener la última partida activa de un usuario (opcional)
  async findPartidaActiva(usuarioId) {
    try {
      const { data, error } = await supabase
        .from("Buscaminas")
        .select("*")
        .match({ usuarioId, tiempoFin: null })
        .order("tiempoInicio", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // Si no hay partida activa, devolvemos null
        if (error.code === "PGRST116") return null;
        throw error;
      }

      return data;
    } catch (e) {
      console.error("Error en findPartidaActiva:", e);
      return null;
    }
  }
}
