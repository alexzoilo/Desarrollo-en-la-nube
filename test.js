import { DAOUsuario } from "./Buscaminas/Buscaminas/Connect/DaoUsuario.js";
import { DAOBuscaminas } from "./Buscaminas/Buscaminas/Connect/DAOBuscaminas.js";
import { Usuario } from "./Buscaminas/Buscaminas/Clases/Usuario.js";
import { Buscaminas } from "./Buscaminas/Buscaminas/Clases/Buscaminas.js";
import { Dificultad } from "./Buscaminas/Buscaminas/Clases/Dificultad.js";

async function main() {
  const daoUsuario = new DAOUsuario();
  const daoBuscaminas = new DAOBuscaminas();

  try {

    let usuario = new Usuario("ana", "1234");
    usuario = await daoUsuario.crearUsuario(usuario);
    console.log("Usuario creado:", usuario);


    const auth = await daoUsuario.autenticar("ana", "1234");
    console.log("Usuario autenticado:", auth);


    const partida = new Buscaminas(usuario.id, 10, 10, Dificultad.FACIL);
    await daoBuscaminas.crearPartida(partida);
    console.log("Partida creada:", partida);


    await daoBuscaminas.actualizarCeldasDescubiertas(partida.id, 15);
    console.log("Celdas actualizadas");


    await daoBuscaminas.finalizarPartida(partida.id, new Date());
    console.log("Partida finalizada");


    const partidaGuardada = await daoBuscaminas.findById(partida.id);
    console.log("Partida guardada:", partidaGuardada);


    await daoUsuario.actualizarEstadisticas(usuario.id, true, 120);
    const usuarioActualizado = await daoUsuario.findById(usuario.id);
    console.log("Usuario actualizado:", usuarioActualizado);

  } catch (error) {
    console.error("Error en test:", error);
  }
}

main();
