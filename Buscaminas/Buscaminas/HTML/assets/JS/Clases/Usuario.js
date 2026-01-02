export class Usuario {
  constructor(nombre = null, contraseña = null) {
    this.id = null;
    this.nombre = nombre;
    this.contraseña = contraseña;

    this.partidasGanadas = 0;
    this.partidasPerdidas = 0;


    this.tiempoUltimaPartida = null;
    this.tiempoTotalJugado = 0;
  }


  crearUsuario(nombre, contraseña) {
    this.nombre = nombre;
    this.contraseña = contraseña;
    this.partidasGanadas = 0;
    this.partidasPerdidas = 0;
    this.tiempoTotalJugado = 0;
    this.tiempoUltimaPartida = null;
  }


  autenticar(contrasena) {
    return this.contraseña !== null && this.contraseña === contrasena;
  }


  actualizarEstadisticas(ganador) {
    this.actualizarEstadisticasCompleta(ganador, 0, 0);
  }


  actualizarEstadisticasCompleta(ganador, puntuacion, tiempoPartida) {
    if (ganador) {
      this.partidasGanadas++;
    } else {
      this.partidasPerdidas++;
    }


    this.tiempoUltimaPartida = new Date();


    this.tiempoTotalJugado += tiempoPartida;
  }
}
