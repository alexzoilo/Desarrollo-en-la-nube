export class Usuario {
  constructor(nombre = null, contraseña = null) {
    this.id = null;
    this.nombre = nombre;
    this.contraseña = contraseña;

    this.partidasGanadas = 0;
    this.partidasPerdidas = 0;

    // Usamos Date en vez de Timestamp
    this.tiempoUltimaPartida = null;
    this.tiempoTotalJugado = 0; // segundos acumulados
  }

  // Crear usuario
  crearUsuario(nombre, contraseña) {
    this.nombre = nombre;
    this.contraseña = contraseña;
    this.partidasGanadas = 0;
    this.partidasPerdidas = 0;
    this.tiempoTotalJugado = 0;
    this.tiempoUltimaPartida = null;
  }

  // Autenticar usuario
  autenticar(contrasena) {
    return this.contraseña !== null && this.contraseña === contrasena;
  }

  // Actualizar estadísticas (simple)
  actualizarEstadisticas(ganador) {
    this.actualizarEstadisticasCompleta(ganador, 0, 0);
  }

  // Actualizar estadísticas (completa)
  actualizarEstadisticasCompleta(ganador, puntuacion, tiempoPartida) {
    if (ganador) {
      this.partidasGanadas++;
    } else {
      this.partidasPerdidas++;
    }

    // Fecha de última partida
    this.tiempoUltimaPartida = new Date();

    // Sumar tiempo jugado (en segundos)
    this.tiempoTotalJugado += tiempoPartida;
  }
}
