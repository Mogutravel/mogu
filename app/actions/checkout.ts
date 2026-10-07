'use server'

import { supabaseAdmin } from '@/lib/supabase-admin'

interface CheckoutData {
  fullName: string
  email: string
  phone: string
  productId: string
}

function limpiarSlug(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function processTransferCheckout(data: CheckoutData) {
  try {
    const { fullName, email, phone, productId } = data

    if (!email || !fullName || !productId) {
      return { success: false, message: 'Faltan datos obligatorios para procesar la compra.' }
    }

    let userId: string
    const tempPassword = Math.random().toString(36).slice(-8) + 'Mogu2026!'

    // 1. Verificar si el usuario ya existe en Supabase Auth por su email
    const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) throw listError

    const existingUser = listData.users.find(
      (u) => u.email?.toLowerCase() === email.trim().toLowerCase()
    )

    if (existingUser) {
      userId = existingUser.id
      await supabaseAdmin.auth.admin.updateUserById(userId, { password: tempPassword })
    } else {
      // 2. Si no existe, crear la cuenta automáticamente
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email.trim(),
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: fullName.trim(), phone: phone.trim() },
      })

      if (createError) throw createError
      if (!newUser.user) throw new Error('No se pudo crear el usuario en el sistema.')
      
      userId = newUser.user.id
    }

    // 3. Verificar o crear explícitamente el perfil digital en la tabla 'profiles'
    let profileSlug = ''
    
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('slug')
      .eq('user_id', userId)
      .maybeSingle()

    if (existingProfile && existingProfile.slug) {
      profileSlug = existingProfile.slug
    } else {
      // Generar un slug único basado en el nombre
      let baseSlug = limpiarSlug(fullName) || 'usuario'
      let candidateSlug = baseSlug
      let counter = 1

      // Comprobamos si el slug ya está ocupado
      while (true) {
        const { data: checkSlug } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('slug', candidateSlug)
          .maybeSingle()

        if (!checkSlug) {
          candidateSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`
          break
        } else {
          candidateSlug = `${baseSlug}-${counter}`
          counter++
        }
      }

      // Crear el perfil directamente
      const { data: newProfile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: userId,
          slug: candidateSlug,
          full_name: fullName.trim(),
          phone: phone.trim(),
          theme_color: 'from-emerald-500 to-teal-400',
        })
        .select('slug')
        .single()

      if (profileError || !newProfile) {
        throw new Error(profileError?.message || 'No se pudo generar el perfil digital.')
      }

      profileSlug = newProfile.slug
    }

    // 4. Registrar la orden de compra
    try {
      await supabaseAdmin.from('orders').insert([
        {
          user_id: userId,
          product_id: productId,
          status: 'pending_transfer',
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
        },
      ])
    } catch (orderErr) {
      console.warn('Aviso: No se pudo registrar en la tabla orders:', orderErr)
    }

    return {
      success: true,
      slug: profileSlug,
      email: email.trim(),
      tempPassword,
      message: '¡Cuenta creada con éxito!',
    }
  } catch (error: any) {
    console.error('Error en proceso de checkout:', error)
    return {
      success: false,
      message: error.message || 'Error interno al procesar el pedido.',
    }
  }
}