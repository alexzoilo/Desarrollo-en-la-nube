<<<<<<< HEAD:Buscaminas/Connect/DaoBuscaminas.js
import { supabase } from "./supabase.js";
=======
import { supabase } from "../HTML/resources/javaScript/supabase.js";
>>>>>>> be40f5c563231663f8f89c8a49f4a90874e5df43:Connect/DaoBuscaminas.js
import { Buscaminas } from "../Clases/Buscaminas.js";

export class DAOBuscaminas {

  // Crear partida
  async crearPartida(buscaminas) {
    const { data, error } = await supabase
      .from("Buscaminas")
      .insert({
        usuarioId: buscaminas.usuarioId,
        filas: buscaminas.filas,
        columnas: buscaminas.columnas,
        totalCeldas: buscaminas.totalCeldas,
        celdasDescubiertas: buscaminas.celdasDescubiertas,
        dificultad: buscaminas.dificultad,
        tiempoInicio: buscaminas.tiempoInicio?.toISOString() || new Date().toISOString(),
        tiempoFin: buscaminas.tiempoFin ? buscaminas.tiempoFin.toISOString() : null
      })
      .select("id")
      .single();

    if (error) throw error;

    buscaminas.id = data.id;
    return buscaminas;
  }

  // Actualizar celdas descubiertas
  async actualizarCeldasDescubiertas(id, nuevasDescubiertas) {
    const { error } = await supabase
      .from("Buscaminas")
      .update({ celdasDescubiertas: nuevasDescubiertas })
      .eq("id", id);

    return !error;
  }

  // Finalizar partida
  async finalizarPartida(id, tiempoFin) {
    const { error } = await supabase
      .from("Buscaminas")
      .update({ tiempoFin: tiempoFin.toISOString() })
      .eq("id", id);

    return !error;
  }

  // Buscar partida por ID
  async findById(id) {
    const { data, error } = await supabase
      .from("Buscaminas")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    const b = new Buscaminas();
    b.id = data.id;
    b.usuarioId = data.usuarioId;
    b.filas = data.filas;
    b.columnas = data.columnas;
    b.totalCeldas = data.totalCeldas;
    b.celdasDescubiertas = data.celdasDescubiertas;
    b.dificultad = data.dificultad;
    b.tiempoInicio = data.tiempoInicio ? new Date(data.tiempoInicio) : null;
    b.tiempoFin = data.tiempoFin ? new Date(data.tiempoFin) : null;

    return b;
  }
}
