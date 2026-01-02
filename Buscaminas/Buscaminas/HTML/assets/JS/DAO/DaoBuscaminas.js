import { supabase } from "../Supabaseclient.js";
import { Buscaminas } from "../Clases/Buscaminas.js";

export class DAOBuscaminas {

  // Crear partida nueva
  async crearPartida(buscaminas) {
    const { data, error } = await supabase
      .from("Buscaminas")
      .insert({
        usuarioId: buscaminas.usuarioId,          // UUID del usuario logueado
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

  // Guardar partida (update)
  async guardarPartida(id, celdasDescubiertas, tablero, minas=null) {
    const payload = {
      celdasDescubiertas: JSON.stringify(celdasDescubiertas),
      tablero: JSON.stringify(tablero)
    };
    if (minas) payload.minas = JSON.stringify(minas);

    const { error } = await supabase
      .from("Buscaminas")
      .update(payload)
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

  // Última partida sin terminar del usuario
  async findPartidaActiva(usuarioId) {
    const { data, error } = await supabase
      .from("Buscaminas")
      .select("*")
      .eq("usuarioId", usuarioId)
      .is("tiempoFin", null)
      .order("tiempoInicio", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;

    // Convertir JSONB a objetos
    return {
      ...data,
      tablero: data.tablero ? JSON.parse(data.tablero) : [],
      celdasDescubiertas: data.celdasDescubiertas ? JSON.parse(data.celdasDescubiertas) : [],
      minas: data.minas ? JSON.parse(data.minas) : []
    };
  }
}
