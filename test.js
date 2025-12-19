import { DAOUsuario } from "./Buscaminas/Connect/DAOUsuario.js";
import { DAOBuscaminas } from "./Buscaminas/Connect/DAOBuscaminas.js";
import { Usuario } from "./Buscaminas/Clases/Usuario.js";
import { Buscaminas } from "./Buscaminas/Clases/Buscaminas.js";
import { Dificultad } from "./Buscaminas/Clases/Dificultad.js";

async function main() {
  const daoUsuario = new DAOUsuario();
  const daoBuscaminas = new DAOBuscaminas();

  try {
    // 1️⃣ Crear usuario
    let usuario = new Usuario("ana", "1234");
    usuario = await daoUsuario.crearUsuario(usuario);
    console.log("Usuario creado:", usuario);

    // 2️⃣ Autenticar usuario
    const auth = await daoUsuario.autenticar("ana", "1234");
    console.log("Usuario autenticado:", auth);

    // 3️⃣ Crear partida de Buscaminas
    const partida = new Buscaminas(usuario.id, 10, 10, Dificultad.FACIL);
    await daoBuscaminas.crearPartida(partida);
    console.log("Partida creada:", partida);

    // 4️⃣ Actualizar celdas descubiertas
    await daoBuscaminas.actualizarCeldasDescubiertas(partida.id, 15);
    console.log("Celdas actualizadas");

    // 5️⃣ Finalizar partida
    await daoBuscaminas.finalizarPartida(partida.id, new Date());
    console.log("Partida finalizada");

    // 6️⃣ Obtener partida
    const partidaGuardada = await daoBuscaminas.findById(partida.id);
    console.log("Partida guardada:", partidaGuardada);

    // 7️⃣ Actualizar estadísticas de usuario
    await daoUsuario.actualizarEstadisticas(usuario.id, true, 120);
    const usuarioActualizado = await daoUsuario.findById(usuario.id);
    console.log("Usuario actualizado:", usuarioActualizado);

  } catch (error) {
    console.error("Error en test:", error);
  }
}

main();
