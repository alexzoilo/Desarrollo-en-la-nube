import { supabase, hashPassword } from '../../../Connect/supabase.js'

const form = document.querySelector('form')

form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const nombre = document.getElementById('nombre').value
    const contraseña = document.getElementById('password').value
    const repeat = document.getElementById('repeatpassword').value

    if (contraseña !== repeat) {
        alert('Las contraseñas no coinciden')
        return
    }

    const hashed = await hashPassword(contraseña)

    const { data, error } = await supabase
        .from('Usuarios')
        .insert([{ nombre, contraseña: hashed }])

    if (error) {
        alert('Error al registrar: ' + error.message)
    } else {
        alert('Usuario registrado correctamente')
        window.location.href = 'login.html'
    }
})
