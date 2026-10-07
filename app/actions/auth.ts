'use server'

import { supabaseAdmin } from '@/lib/supabase-admin'

interface FreeTrialData {
  fullName: string
  email: string
  password: string
}

function limpiarSlug(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function processFreeTrialSignup(data: FreeTrialData) {
  try {
    const { fullName, email, password } = data

    if (!email || !fullName || !password) {
      return { success: false, message: 'Faltan datos obligatorios para crear tu cuenta.' }
    }

    if (password.length < 6) {
      return { success: false, message: 'La contraseña debe tener al menos 6 caracteres.' }
    }

    // 1. Verificar si el usuario ya existe en Supabase Auth
    const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) throw listError

    const existingUser = listData.users.find(
      (u) => u.email?.toLowerCase() === email.trim().toLowerCase()
    )

    if (existingUser) {
      return { success: false, message: 'Ya existe una cuenta registrada con este correo electrónico.' }
    }

    // 2. Crear el usuario en Supabase Auth con acceso inmediato
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password: password,
      email_confirm: true,
      user_metadata: { full_name: fullName.trim() },
    })

    if (createError) throw createError
    if (!newUser.user) throw new Error('No se pudo crear el usuario en el sistema.')

    const userId = newUser.user.id

    // 3. Calcular fecha de expiración a exactamente 7 días en el futuro
    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + 7)

    // 4. Generar un slug único basado en el nombre del negocio o emprendedor
    let baseSlug = limpiarSlug(fullName) || 'usuario'
    let candidateSlug = baseSlug
    let counter = 1

    while (true) {
      const { data: checkSlug } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('slug', candidateSlug)
        .maybeSingle()

      if (!checkSlug) {
        break
      } else {
        candidateSlug = `${baseSlug}-${counter}`
        counter++
      }
    }

    // 5. Crear el perfil inicial en modo 'trial' por 7 días
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: userId,
        slug: candidateSlug,
        full_name: fullName.trim(),
        theme_color: 'from-emerald-500 to-teal-400',
        status: 'trial',                    // <-- Estado de prueba de 7 días
        trial_ends_at: trialEndDate.toISOString(), // <-- Fecha límite del trial
      })

    if (profileError) {
      throw new Error(profileError.message || 'No se pudo generar el perfil digital de prueba.')
    }

    return {
      success: true,
      slug: candidateSlug,
      email: email.trim(),
      message: '¡Tu prueba gratuita de 7 días ha comenzado con éxito!',
    }
  } catch (error: any) {
    console.error('Error en registro de prueba gratuita:', error)
    return {
      success: false,
      message: error.message || 'Error interno al procesar el registro.',
    }
  }
}