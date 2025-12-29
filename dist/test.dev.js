"use strict";

var _DaoUsuario = require("./Buscaminas/Connect/DaoUsuario.js");

var _DAOBuscaminas = require("./Buscaminas/Connect/DAOBuscaminas.js");

var _Usuario = require("./Buscaminas/Clases/Usuario.js");

var _Buscaminas = require("./Buscaminas/Clases/Buscaminas.js");

var _Dificultad = require("./Buscaminas/Clases/Dificultad.js");

function main() {
  var daoUsuario, daoBuscaminas, usuario, auth, partida, partidaGuardada, usuarioActualizado;
  return regeneratorRuntime.async(function main$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          daoUsuario = new _DaoUsuario.DAOUsuario();
          daoBuscaminas = new _DAOBuscaminas.DAOBuscaminas();
          _context.prev = 2;
          // 1️⃣ Crear usuario
          usuario = new _Usuario.Usuario("ana", "1234");
          _context.next = 6;
          return regeneratorRuntime.awrap(daoUsuario.crearUsuario(usuario));

        case 6:
          usuario = _context.sent;
          console.log("Usuario creado:", usuario); // 2️⃣ Autenticar usuario

          _context.next = 10;
          return regeneratorRuntime.awrap(daoUsuario.autenticar("ana", "1234"));

        case 10:
          auth = _context.sent;
          console.log("Usuario autenticado:", auth); // 3️⃣ Crear partida de Buscaminas

          partida = new _Buscaminas.Buscaminas(usuario.id, 10, 10, _Dificultad.Dificultad.FACIL);
          _context.next = 15;
          return regeneratorRuntime.awrap(daoBuscaminas.crearPartida(partida));

        case 15:
          console.log("Partida creada:", partida); // 4️⃣ Actualizar celdas descubiertas

          _context.next = 18;
          return regeneratorRuntime.awrap(daoBuscaminas.actualizarCeldasDescubiertas(partida.id, 15));

        case 18:
          console.log("Celdas actualizadas"); // 5️⃣ Finalizar partida

          _context.next = 21;
          return regeneratorRuntime.awrap(daoBuscaminas.finalizarPartida(partida.id, new Date()));

        case 21:
          console.log("Partida finalizada"); // 6️⃣ Obtener partida

          _context.next = 24;
          return regeneratorRuntime.awrap(daoBuscaminas.findById(partida.id));

        case 24:
          partidaGuardada = _context.sent;
          console.log("Partida guardada:", partidaGuardada); // 7️⃣ Actualizar estadísticas de usuario

          _context.next = 28;
          return regeneratorRuntime.awrap(daoUsuario.actualizarEstadisticas(usuario.id, true, 120));

        case 28:
          _context.next = 30;
          return regeneratorRuntime.awrap(daoUsuario.findById(usuario.id));

        case 30:
          usuarioActualizado = _context.sent;
          console.log("Usuario actualizado:", usuarioActualizado);
          _context.next = 37;
          break;

        case 34:
          _context.prev = 34;
          _context.t0 = _context["catch"](2);
          console.error("Error en test:", _context.t0);

        case 37:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[2, 34]]);
}

main();