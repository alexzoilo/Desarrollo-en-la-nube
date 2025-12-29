import { supabase } from "../../../Connect/supabase.js";

console.log("registrarse.js cargado");

const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("submit interceptado");

  const nombre = document.getElementById("nombre").value;
  const password = document.getElementById("password").value;
  const repeat = document.getElementById("repeatpassword").value;

  if (password !== repeat) {
    alert("Las contraseñas no coinciden");
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email: `${nombre}@buscaminas.com`,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  alert("Usuario creado correctamente");
});
