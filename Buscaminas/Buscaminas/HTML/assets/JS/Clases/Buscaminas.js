import { Dificultad } from "./Dificultad.js";

export class Buscaminas {
  constructor(usuarioId = null, filas = 0, columnas = 0, dificultad = null) {
    this.id = null;
    this.usuarioId = usuarioId;
    this.filas = filas;
    this.columnas = columnas;
    this.totalCeldas = filas * columnas;
    this.celdasDescubiertas = 0;
    this.dificultad = dificultad;

    this.tablero = [];
    this.descubiertas = [];
    this.minas = [];

    if (filas > 0 && columnas > 0 && dificultad) {
      this.numMinas = this.calcularMinasPorDificultad(dificultad);
      this.iniciarTablero(filas, columnas, this.numMinas);
    }
  }

  iniciarTablero(filas, columnas, numMinas) {
    this.filas = filas;
    this.columnas = columnas;
    this.totalCeldas = filas * columnas;

    // Inicializar tablero y descubiertas
    this.tablero = Array.from({ length: filas }, () => Array(columnas).fill(0));
    this.descubiertas = Array.from({ length: filas }, () => Array(columnas).fill(false));

    // Colocar minas aleatoriamente
    this.minas = [];
    let colocadas = 0;
    while (colocadas < numMinas) {
      const f = Math.floor(Math.random() * filas);
      const c = Math.floor(Math.random() * columnas);
      if (this.tablero[f][c] !== -1) {
        this.tablero[f][c] = -1;
        this.minas.push([f, c]);
        colocadas++;
      }
    }

    // Calcular números alrededor de minas
    for (let i = 0; i < filas; i++) {
      for (let j = 0; j < columnas; j++) {
        if (this.tablero[i][j] === -1) continue;
        let contador = 0;
        for (let x = i - 1; x <= i + 1; x++) {
          for (let y = j - 1; y <= j + 1; y++) {
            if (x >= 0 && y >= 0 && x < filas && y < columnas && this.tablero[x][y] === -1)
              contador++;
          }
        }
        this.tablero[i][j] = contador;
      }
    }
  }

  descubrir(f, c) {
    if (f < 0 || c < 0 || f >= this.filas || c >= this.columnas || this.descubiertas[f][c])
      return true;

    this.descubiertas[f][c] = true;
    this.celdasDescubiertas++;

    if (this.tablero[f][c] === -1) return false;

    if (this.tablero[f][c] === 0) {
      for (let i = f - 1; i <= f + 1; i++) {
        for (let j = c - 1; j <= c + 1; j++) this.descubrir(i, j);
      }
    }
    return true;
  }

  verificarVictoria() {
    return this.celdasDescubiertas >= this.totalCeldas - this.minas.length;
  }

  calcularMinasPorDificultad(dificultad) {
    switch (dificultad) {
      case Dificultad.FACIL: return Math.floor(this.filas * this.columnas / 10);
      case Dificultad.MEDIO: return Math.floor(this.filas * this.columnas / 6);
      case Dificultad.DIFICIL: return Math.floor(this.filas * this.columnas / 4);
      default: return Math.floor(this.filas * this.columnas / 10);
    }
  }
}
