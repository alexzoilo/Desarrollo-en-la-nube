import { supabase } from "./supabase.js";
import { Usuario } from "../Clases/Usuario.js";
import { hashPassword, checkPassword } from "./supabase.js";

export class DAOUsuario {

  // Crear usuario (hash SHA-256)
  async crearUsuario(usuario) {
    const hashed = await hashPassword(usuario.contraseña);

    const { data, error } = await supabase
      .from("Usuarios")
      .insert({
        nombre: usuario.nombre,
        contraseña: hashed,
        partidasGanadas: 0,
        partidasPerdidas: 0,
        tiempoTotalJugado: 0,
        tiempoUltimaPartida: null
      })
      .select("id")
      .single();

    if (error) throw error;

    usuario.id = data.id;
    usuario.contraseña = null;
    return usuario;
  }

  // Autenticar usuario
  async autenticar(nombre, contraseñaRaw) {
    const { data, error } = await supabase
      .from("Usuarios")
      .select(`
        id,
        nombre,
        contraseña,
        partidasGanadas,
        partidasPerdidas,
        tiempoUltimaPartida,
        tiempoTotalJugado
      `)
      .eq("nombre", nombre)
      .single();

    if (error || !data) return null;

    const ok = await checkPassword(contraseñaRaw, data.contraseña);
    if (!ok) return null;

    const u = new Usuario();
    u.id = data.id;
    u.nombre = data.nombre;
    u.partidasGanadas = data.partidasGanadas;
    u.partidasPerdidas = data.partidasPerdidas;
    u.tiempoUltimaPartida = data.tiempoUltimaPartida
      ? new Date(data.tiempoUltimaPartida)
      : null;
    u.tiempoTotalJugado = data.tiempoTotalJugado;

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
      .from("Usuarios")
      .select(`
        id,
        nombre,
        partidasGanadas,
        partidasPerdidas,
        tiempoUltimaPartida,
        tiempoTotalJugado
      `)
      .eq("id", id)
      .single();

    if (error || !data) return null;

    const u = new Usuario();
    u.id = data.id;
    u.nombre = data.nombre;
    u.partidasGanadas = data.partidasGanadas;
    u.partidasPerdidas = data.partidasPerdidas;
    u.tiempoUltimaPartida = data.tiempoUltimaPartida
      ? new Date(data.tiempoUltimaPartida)
      : null;
    u.tiempoTotalJugado = data.tiempoTotalJugado;

    return u;
  }
}
