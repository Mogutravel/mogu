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

    // 0. Verificar si el productId corresponde a un plan activo en la tabla 'plans'
    const { data: planFound } = await supabaseAdmin
      .from('plans')
      .select('id')
      .eq('id', productId)
      .maybeSingle()

    // Si coincide con un plan, guardamos su ID; de lo contrario, es null (tarjeta física u otro)
    const planIdToAssign = planFound ? planFound.id : null

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
      .select('slug, status')
      .eq('user_id', userId)
      .maybeSingle()

    if (existingProfile && existingProfile.slug) {
      profileSlug = existingProfile.slug
      
      // Si el perfil ya existía, actualizamos sus datos y LE ASIGNAMOS EL PLAN_ID
      const updatePayload: Record<string, any> = {
        status: 'active',
        trial_ends_at: null,
        full_name: fullName.trim(),
        phone: phone.trim(),
      }

      if (planIdToAssign) {
        updatePayload.plan_id = planIdToAssign // <--- ASIGNA EL PLAN AL ACTUALIZAR
      }

      await supabaseAdmin
        .from('profiles')
        .update(updatePayload)
        .eq('user_id', userId)

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
          break
        } else {
          candidateSlug = `${baseSlug}-${counter}`
          counter++
        }
      }

      // Crear el perfil directamente como ACTIVO/DEFINITIVO por pago e incluir el PLAN_ID
      const { data: newProfile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: userId,
          slug: candidateSlug,
          full_name: fullName.trim(),
          phone: phone.trim(),
          theme_color: 'from-emerald-500 to-teal-400',
          status: 'active',       // <-- Cuenta definitiva al pagar por transferencia
          trial_ends_at: null,    // <-- Sin caducidad
          plan_id: planIdToAssign // <--- ASIGNA EL PLAN AL CREAR (¡DISPARA EL TRIGGER SQL!)
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