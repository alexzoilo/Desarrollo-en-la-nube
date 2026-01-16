
const modal = document.createElement("div");
modal.id = "modal-confirmacion";
modal.className = "modal";

const modalContenido = document.createElement("div");
modalContenido.className = "modal-contenido";

const texto = document.createElement("p");
texto.textContent = "¿Seguro que deseas eliminar tu cuenta? Esta acción es irreversible.";

const botones = document.createElement("div");
botones.className = "modal-botones";


const btnConfirmar = document.createElement("button");
btnConfirmar.id = "confirmar-eliminar";
btnConfirmar.textContent = "Sí, eliminar";

const btnCancelar = document.createElement("button");
btnCancelar.id = "cancelar-eliminar";
btnCancelar.textContent = "Cancelar";

botones.appendChild(btnConfirmar);
botones.appendChild(btnCancelar);

modalContenido.appendChild(texto);
modalContenido.appendChild(botones);

modal.appendChild(modalContenido);

document.body.appendChild(modal);
