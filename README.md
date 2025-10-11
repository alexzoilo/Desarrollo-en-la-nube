# 🎮 Proyecto: Buscaminas en Java

## Descripción del proyecto

Este proyecto consiste en una implementación del clásico juego **Buscaminas**, desarrollada en **Java**.  
El jugador debe descubrir todas las celdas seguras del tablero sin activar ninguna mina.  
El juego permite crear un usuario, seleccionar una dificultad y reiniciar la partida.  

Además, está diseñado para ser **escalable y comprensible**, ideal como proyecto educativo o base para futuras mejoras gráficas (por ejemplo, con Swing o JavaFX).

---

## ⚙️ Requisitos funcionales

1. Generar un tablero de **5x5** con minas colocadas aleatoriamente.  
2. Permitir al jugador **descubrir una celda** del tablero.  
3. Mostrar el **número de minas adyacentes** a cada celda descubierta.  
4. Indicar si el jugador ha tocado una mina.  
5. Indicar cuándo el jugador ha descubierto todas las celdas seguras.  
6. Permitir **seleccionar dificultad** o hacer el juego **escalable** (tablero y minas variables).  
7. Permitir **crear un usuario** con nombre y contraseña.  
8. Permitir **reiniciar el juego** después de una derrota o victoria.  

---

## ⚙️ Requisitos no funcionales

1. El juego debe **ejecutarse correctamente** en cualquier entorno Java (versión 8 o superior).  
2. Debe ofrecer **respuesta inmediata** a la selección de celdas.  
3. El **código debe ser claro y modular**, siguiendo buenas prácticas.  
4. Debe **manejar entradas incorrectas** (por ejemplo, letras, posiciones fuera de rango o celdas ya descubiertas).  
5. Estructura del proyecto fácilmente **escalable** (separación de lógica, usuario y recursos).  

---

## 🧠 Diagrama UML

El diagrama UML representa las relaciones entre las clases principales del proyecto:

- **Usuario:** Maneja nombre, contraseña y estadísticas (ganadas/perdidas).  
- **Buscaminas:** Contiene la lógica del juego y el tablero.  
- **Main:** Controla el flujo del juego y la interacción con el jugador.  
- **Dificultad:** Enum que define el tamaño del tablero y cantidad de minas.

---

## 🧮 Lógica básica del juego

1. El usuario inicia sesión o crea una cuenta.  
2. Selecciona una **dificultad** (`FÁCIL`, `MEDIO`, `DIFÍCIL`).  
3. Se genera el tablero con minas distribuidas aleatoriamente.  
4. El jugador selecciona celdas para descubrir:  
   - Si toca una mina -> pierde.  
   - Si descubre todas las celdas seguras -> gana.  
5. Puede reiniciar o salir del juego.  

---

## 🔐 Clases principales

### `Usuario`
- Atributos: `nombre`, `contraseña`, `partidasGanadas`, `partidasPerdidas`
- Métodos:
  - `crearUsuario(nombre, contraseña)`
  - `autenticar(contraseña)`
  - `actualizarEstadisticas(ganador)`

### `Buscaminas`
- Atributos: `tablero`, `minas`, `filas`, `columnas`, `dificultad`, `jugador`
- Métodos:
  - `iniciar(dificultad, jugador)`
  - `mostrarTablero()`
  - `descubrir(fila, col)`
  - `verificarVictoria()`
  - `reiniciar()`

### `Dificultad`
Enum con los valores: `FACIL`, `MEDIO`, `DIFICIL`, cada uno con número de filas, columnas y minas.

---

 




