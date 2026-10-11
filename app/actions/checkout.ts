'use server'

import { supabaseAdmin } from '@/lib/supabase-admin'

interface CheckoutData {
  fullName: string
  email: string
  phone: string
  productId: string
  hasCatalogo?: boolean
  hasMenu?: boolean
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
    const { fullName, email, phone, productId, hasCatalogo = false, hasMenu = false } = data

    if (!email || !fullName || !productId) {
      return { success: false, message: 'Faltan datos obligatorios para procesar la compra.' }
    }

    const { data: planFound } = await supabaseAdmin
      .from('plans')
      .select('id')
      .eq('id', productId)
      .maybeSingle()

    const planIdToAssign = planFound ? planFound.id : null

    let userId: string
    const tempPassword = Math.random().toString(36).slice(-8) + 'Mogu2026!'

    const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    if (listError) throw listError

    const existingUser = listData.users.find(
      (u) => u.email?.toLowerCase() === email.trim().toLowerCase()
    )

    if (existingUser) {
      userId = existingUser.id
      await supabaseAdmin.auth.admin.updateUserById(userId, { password: tempPassword })
    } else {
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

    let profileSlug = ''
    
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('slug, status')
      .eq('user_id', userId)
      .maybeSingle()

    if (existingProfile && existingProfile.slug) {
      profileSlug = existingProfile.slug
      
      const updatePayload: Record<string, any> = {
        status: 'active',
        trial_ends_at: null,
        full_name: fullName.trim(),
        phone: phone.trim(),
      }

      if (planIdToAssign) {
        updatePayload.plan_id = planIdToAssign
        updatePayload.has_catalogo = hasCatalogo
        updatePayload.has_menu = hasMenu
      }

      await supabaseAdmin
        .from('profiles')
        .update(updatePayload)
        .eq('user_id', userId)

    } else {
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

      const { data: newProfile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: userId,
          slug: candidateSlug,
          full_name: fullName.trim(),
          phone: phone.trim(),
          theme_color: 'from-emerald-500 to-teal-400',
          status: 'active',
          trial_ends_at: null,
          plan_id: planIdToAssign,
          has_catalogo: planIdToAssign ? hasCatalogo : false, // Guarda la selección del usuario
          has_menu: planIdToAssign ? hasMenu : false,         // Guarda la selección del usuario
        })
        .select('slug')
        .single()

      if (profileError || !newProfile) {
        throw new Error(profileError?.message || 'No se pudo generar el perfil digital.')
      }

      profileSlug = newProfile.slug
    }

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
      message: '¡Cuenta creada y activada de forma definitiva con éxito!',
    }
  } catch (error: any) {
    console.error('Error en proceso de checkout:', error)
    return {
      success: false,
      message: error.message || 'Error interno al procesar el pedido.',
    }
  }
}