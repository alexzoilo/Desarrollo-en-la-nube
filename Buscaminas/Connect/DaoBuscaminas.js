import { supabase } from "../Connect/supabase.js";
import { Buscaminas } from "../Clases/Buscaminas.js";
import { Dificultad } from "../Clases/Dificultad.js";

export class DAOBuscaminas {

  // Crear partida
  async crearPartida(buscaminas) {
    const { data, error } = await supabase
      .from("buscaminas")
      .insert({
        usuario: buscaminas.usuarioId,
        filas: buscaminas.filas,
        columnas: buscaminas.columnas,
        totalceldas: buscaminas.totalCeldas,
        celdasdescubiertas: buscaminas.celdasDescubiertas,
        dificultad: buscaminas.dificultad,
        tiempoinicio: buscaminas.tiempoInicio?.toISOString() || new Date().toISOString(),
        tiempofin: buscaminas.tiempoFin ? buscaminas.tiempoFin.toISOString() : null
      })
      .select("id")
      .single();

    if (error) throw error;

    buscaminas.id = data.id;
    return buscaminas;
  }

  // Actualizar celdas descubiertas
  async actualizarCeldasDescubiertas(id, nuevasDescubiertas) {
    const { error, count } = await supabase
      .from("buscaminas")
      .update({ celdasdescubiertas: nuevasDescubiertas })
      .eq("id", id);

    return !error;
  }

  // Finalizar partida
  async finalizarPartida(id, tiempoFin) {
    const { error } = await supabase
      .from("buscaminas")
      .update({ tiempofin: tiempoFin.toISOString() })
      .eq("id", id);

    return !error;
  }

  // Buscar partida por ID
  async findById(id) {
    const { data, error } = await supabase
      .from("buscaminas")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    const b = new Buscaminas();
    b.id = data.id;
    b.usuarioId = data.usuario;
    b.filas = data.filas;
    b.columnas = data.columnas;
    b.totalCeldas = data.totalceldas;
    b.celdasDescubiertas = data.celdasdescubiertas;
    b.dificultad = data.dificultad;
    b.tiempoInicio = data.tiempoinicio ? new Date(data.tiempoinicio) : null;
    b.tiempoFin = data.tiempofin ? new Date(data.tiempofin) : null;

    return b;
  }
}
