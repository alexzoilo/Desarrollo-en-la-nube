import { supabase } from "../Connect/supabase.js";
import { Usuario } from "../Clases/Usuario.js";
import { hashPassword, checkPassword } from "../Connect/supabase.js";

export class DAOUsuario {

  // Crear usuario (hash SHA-256)
  async crearUsuario(usuario) {
    const hashed = await hashPassword(usuario.contraseña);

    const { data, error } = await supabase
      .from("usuarios")
      .insert({
        nombre: usuario.nombre,
        contraseña: hashed,
        partidas_ganadas: 0,
        partidas_perdidas: 0,
        tiempo_total_jugado: 0,
        tiempo_ultima_partida: null
      })
      .select("id")
      .single();

    if (error) throw error;

    usuario.id = data.id;
    usuario.contraseña = null; // no guardar en memoria
    return usuario;
  }

  // Autenticar usuario
  async autenticar(nombre, contraseñaRaw) {
    const { data, error } = await supabase
      .from("usuarios")
      .select(`
        id,
        nombre,
        contraseña,
        partidas_ganadas,
        partidas_perdidas,
        tiempo_ultima_partida,
        tiempo_total_jugado
      `)
      .eq("nombre", nombre)
      .single();

    if (error || !data) return null;

    const ok = await checkPassword(contraseñaRaw, data.contraseña);
    if (!ok) return null;

    const u = new Usuario();
    u.id = data.id;
    u.nombre = data.nombre;
    u.partidasGanadas = data.partidas_ganadas;
    u.partidasPerdidas = data.partidas_perdidas;
    u.tiempoUltimaPartida = data.tiempo_ultima_partida
      ? new Date(data.tiempo_ultima_partida)
      : null;
    u.tiempoTotalJugado = data.tiempo_total_jugado;

    return u;
  }

  // Actualizar estadísticas
  async actualizarEstadisticas(usuarioId, ganador, tiempoPartida) {
    const ganadoInc = ganador ? 1 : 0;
    const perdidoInc = ganador ? 0 : 1;
    const ahora = new Date().toISOString();

    const { error } = await supabase.rpc("actualizar_estadisticas_usuario", {
      uid: usuarioId,
      g_inc: ganadoInc,
      p_inc: perdidoInc,
      tiempo: tiempoPartida,
      ultima: ahora
    });

    return !error;
  }

  // Obtener usuario por ID
  async findById(id) {
    const { data, error } = await supabase
      .from("usuarios")
      .select(`
        id,
        nombre,
        partidas_ganadas,
        partidas_perdidas,
        tiempo_ultima_partida,
        tiempo_total_jugado
      `)
      .eq("id", id)
      .single();

    if (error || !data) return null;

    const u = new Usuario();
    u.id = data.id;
    u.nombre = data.nombre;
    u.partidasGanadas = data.partidas_ganadas;
    u.partidasPerdidas = data.partidas_perdidas;
    u.tiempoUltimaPartida = data.tiempo_ultima_partida
      ? new Date(data.tiempo_ultima_partida)
      : null;
    u.tiempoTotalJugado = data.tiempo_total_jugado;

    return u;
  }
}
