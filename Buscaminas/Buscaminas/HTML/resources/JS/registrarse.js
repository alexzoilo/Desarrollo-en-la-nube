import {
    supabase
} from '../JS/Supabaseclient.js';



import {
    hashPassword
} from '../JS/hashPassword.js';

const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const password = document.getElementById("password").value;

  // Hash opcional
  const hashed = await hashPassword(password);

  // Crear usuario en Auth
  const { data, error } = await supabase.auth.signUp({
    email: `${nombre}@buscaminas.com`,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  // Guardar en tabla Usuarios
  const { error: insertError } = await supabase.from("Usuarios").insert({
    nombre: nombre,
    user_id: data.user.id
  });

  if (insertError) {
    alert(insertError.message);
    return;
  }

  // Redirigir
  window.location.href = "tablero.html";
});