import { Dificultad } from "../Clases/Dificultad.js";

export class Buscaminas {
  constructor(usuarioId = null, filas = 0, columnas = 0, dificultad = null) {
    this.id = null;
    this.usuarioId = usuarioId;
    this.filas = filas;
    this.columnas = columnas;
    this.totalCeldas = filas * columnas;
    this.celdasDescubiertas = 0;
    this.dificultad = dificultad;
    this.tiempoInicio = new Date();
    this.tiempoFin = null;

    this.tablero = [];
    this.descubiertas = [];
    this.numMinas = 0;

    if (filas > 0 && columnas > 0 && dificultad) {
      this.numMinas = this.calcularMinasPorDificultad(dificultad);
      this.iniciar(filas, columnas, this.numMinas);
    }
  }

  // Inicia una nueva partida
  iniciar(filas, columnas, numMinas) {
    this.filas = filas;
    this.columnas = columnas;
    this.numMinas = numMinas;
    this.totalCeldas = filas * columnas;
    this.celdasDescubiertas = 0;

    this.tablero = Array.from({ length: filas }, () =>
      Array(columnas).fill(0)
    );

    this.descubiertas = Array.from({ length: filas }, () =>
      Array(columnas).fill(false)
    );

    this.colocarMinas(numMinas);
    this.calcularNumeros();
    this.iniciarCronometro();
  }

  // Descubre una celda
  descubrir(fil, col) {
    if (!this.esCeldaValida(fil, col) || this.descubiertas[fil][col]) {
      return true;
    }

    this.descubiertas[fil][col] = true;
    this.celdasDescubiertas++;

    // Mina = perder
    if (this.tablero[fil][col] === -1) {
      this.detenerCronometro();
      return false;
    }

    // Si es 0, descubrir alrededor
    if (this.tablero[fil][col] === 0) {
      for (let i = fil - 1; i <= fil + 1; i++) {
        for (let j = col - 1; j <= col + 1; j++) {
          this.descubrir(i, j);
        }
      }
    }
    return true;
  }

  // Cuenta minas cercanas
  contarMinasCercanas(fil, col) {
    let contador = 0;

    for (let i = fil - 1; i <= fil + 1; i++) {
      for (let j = col - 1; j <= col + 1; j++) {
        if (this.esCeldaValida(i, j) && this.tablero[i][j] === -1) {
          contador++;
        }
      }
    }
    return contador;
  }

  // Verifica victoria
  verificarVictoria() {
    const celdasSinMinas = this.totalCeldas - this.numMinas;
    if (this.celdasDescubiertas >= celdasSinMinas) {
      this.detenerCronometro();
      return true;
    }
    return false;
  }

  // Reiniciar partida
  reiniciar() {
    this.iniciar(this.filas, this.columnas, this.numMinas);
  }

  // Validar celda
  esCeldaValida(fil, col) {
    return fil >= 0 && fil < this.filas && col >= 0 && col < this.columnas;
  }

  // Colocar minas
  colocarMinas(numMinas) {
    let colocadas = 0;

    while (colocadas < numMinas) {
      const f = Math.floor(Math.random() * this.filas);
      const c = Math.floor(Math.random() * this.columnas);

      if (this.tablero[f][c] !== -1) {
        this.tablero[f][c] = -1;
        colocadas++;
      }
    }
  }

  // Calcular números
  calcularNumeros() {
    for (let i = 0; i < this.filas; i++) {
      for (let j = 0; j < this.columnas; j++) {
        if (this.tablero[i][j] !== -1) {
          this.tablero[i][j] = this.contarMinasCercanas(i, j);
        }
      }
    }
  }

  // Puntuación
  calcularPuntuacion() {
    let puntos = this.celdasDescubiertas * 10;

    if (this.dificultad === Dificultad.MEDIO) puntos *= 1.5;
    if (this.dificultad === Dificultad.DIFICIL) puntos *= 2;

    return Math.floor(puntos);
  }

  iniciarCronometro() {
    this.tiempoInicio = new Date();
  }

  detenerCronometro() {
    this.tiempoFin = new Date();
    return Math.floor((this.tiempoFin - this.tiempoInicio) / 1000);
  }

  calcularMinasPorDificultad(dificultad) {
    switch (dificultad) {
      case Dificultad.FACIL:
        return Math.floor((this.filas * this.columnas) / 5);
      case Dificultad.MEDIO:
        return Math.floor((this.filas * this.columnas) / 8);
      case Dificultad.DIFICIL:
        return Math.floor((this.filas * this.columnas) / 20);
      default:
        return Math.floor((this.filas * this.columnas) / 5);
    }
  }
}
