import { supabase, checkPassword } from '../../../Connect/supabase.js'

const form = document.querySelector('form')

form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const nombre = document.getElementById('nombre').value
    const contraseña = document.getElementById('password').value

    const { data, error } = await supabase
        .from('Usuarios')
        .select('*')
        .eq('nombre', nombre)
        .single()

    if (error || !data) {
        alert('Usuario no encontrado')
        return
    }

    const ok = await checkPassword(contraseña, data.contraseña)
    if (!ok) {
        alert('Contraseña incorrecta')
        return
    }

    alert('Login correcto')
    window.location.href = 'tablero.html' // o la página del juego
})
