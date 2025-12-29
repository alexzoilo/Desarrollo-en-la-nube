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

  // 1️⃣ Crear usuario en Auth
  const { data, error } = await window.supabase.auth.signUp({
    email: `${nombre}@buscaminas.com`,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  console.log("Usuario creado en Auth:", data);

  // 2️⃣ Insertar usuario en tabla Usuarios
  const { error: insertError } = await window.supabase
    .from("Usuarios")
    .insert([{
      nombre: nombre,
      contrasseña: password
    }]);

  if (insertError) {
    alert("Error al guardar en tabla Usuarios: " + insertError.message);
    return;
  }

  alert("Usuario creado correctamente y guardado en tabla Usuarios ✅");
});
