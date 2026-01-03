export function mostrarMensaje(txt, tipo = "info", elemento = null) {
    // Si no se pasa un elemento, buscar por id "mensaje"
    const mensajeDiv = elemento || document.getElementById("mensaje");
    if (!mensajeDiv) return;

    mensajeDiv.textContent = txt;

    if (tipo === "error") mensajeDiv.style.color = "red";
    else if (tipo === "correcto") mensajeDiv.style.color = "green";
    else mensajeDiv.style.color = "black";
}

export function ocultarMensaje(elemento = null) {
    const mensajeDiv = elemento || document.getElementById("mensaje");
    if (!mensajeDiv) return;
    mensajeDiv.textContent = "";
}
