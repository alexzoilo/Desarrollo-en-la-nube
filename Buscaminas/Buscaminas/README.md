
# 🎮 Proyecto: Buscaminas en Java

## 📝 Descripción del proyecto
Este proyecto consiste en una implementación del clásico juego **Buscaminas**, desarrollada en **Java**.
El jugador debe descubrir todas las celdas seguras del tablero sin activar ninguna mina.

El sistema permite:
- Crear un usuario.
- Iniciar sesión.
- Seleccionar dificultad.
- Registrar estadísticas.
- Reiniciar la partida en cualquier momento.

El proyecto está diseñado para ser escalable, modular y fácil de mantener, ideal para fines educativos o como base para futuras mejoras visuales (Swing, JavaFX, etc.).

---

## ⚙️ Requisitos funcionales
- Generar un tablero con minas colocadas aleatoriamente según la dificultad.
- Permitir al jugador descubrir una celda del tablero.
- Mostrar el número de minas adyacentes.
- Indicar si el jugador ha tocado una mina.
- Indicar cuándo el jugador ha descubierto todas las celdas seguras.
- Permitir seleccionar dificultad (FÁCIL, MEDIO, DIFÍCIL).
- Sistema de usuarios: crear cuenta, iniciar sesión y cerrar sesión.
- Permitir reiniciar el juego en cualquier momento.
- Registrar partidas jugadas por usuario.
- Mostrar estado de la partida (en curso, ganada, perdida) y puntuación.
- Registrar el tiempo transcurrido durante cada partida.

---

## ⚙️ Requisitos no funcionales
- La aplicación debe ejecutarse correctamente en cualquier entorno Java 8+.
- Debe ofrecer respuesta inmediata al descubrir una celda.
- Código claro, modular y fácil de mantener.
- Manejo adecuado de entradas incorrectas (coordenadas fuera de rango, letras, celdas ya descubiertas, etc.).
- Experiencia fluida sin retrasos.
- Generación aleatoria fiable de minas.
- Escalable para nuevos tamaños de tablero o dificultades.

---

## 🧠 Diagrama UML
Incluye las siguientes clases principales:

- **Usuario**: Maneja datos del jugador y estadísticas.
- **Buscaminas**: Controla la lógica del juego y el tablero.
- **Main**: Gestiona la interacción con el usuario y flujo general.
- **Dificultad**: Enum que define filas, columnas y número de minas.

>  UML (./Buscaminas/Buscaminas.png)

---

## 🧮 Lógica básica del juego
1. El usuario inicia sesión o se registra.
2. Selecciona una dificultad.
3. Se genera el tablero con minas distribuidas aleatoriamente.
4. El jugador empieza a descubrir celdas:
   - Si toca una mina → pierde.
   - Si descubre todas las celdas seguras → gana.
5. El usuario puede reiniciar o salir del juego.
6. Se registran estadísticas y tiempo de partida.

---

## 🔐 Clases principales

### **Usuario**
**Atributos:**
- nombre
- contraseña
- partidasGanadas  
- partidasPerdidas  
- tiempoTotalJugado  
- tiempoUltimaPartida  

**Métodos:**
- crearUsuario(nombre, contraseña)  
- autenticar(contraseña)  
- actualizarEstadisticas(ganador, puntuacion, tiempo)  

---

### **Buscaminas**
**Atributos:**
- tablero  
- minas  
- filas / columnas
- dificultad  
- jugador  
- tiempoInicio/tiempoFin  

**Métodos:**
- iniciar(dificultad, jugador)
- mostrarTablero()
- descubrir(fila, col)
- verificarVictoria()
- reiniciar()
- calcularPuntuacion()
- iniciarCronometro()
- detenerCronometro()

---

### **Dificultad (Enum)**
- FACIL
- MEDIO
- DIFICIL

Cada una con:
- filas
- columnas
- minas

---

##  Autor
Proyecto desarrollado por Alex zoilo chacon.