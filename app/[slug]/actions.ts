'use server'

import { createClient } from '@supabase/supabase-js'

// Inicializamos el cliente con la Service Role Key para operaciones administrativas
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function deleteUserAccount(providedId: string | null, slug: string | null) {
  try {
    if (!providedId && !slug) {
      return { success: false, error: 'Identificador de usuario no válido.' }
    }

    let authUserId: string | null = null

    // 1. Intentamos obtener el user_id de auth.users desde la tabla profiles
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .or(`id.eq.${providedId || ''},slug.eq.${slug || ''}`)
      .maybeSingle()

    if (profile?.user_id) {
      authUserId = profile.user_id
    } else {
      authUserId = providedId
    }

    if (!authUserId) {
      return { success: false, error: 'No se pudo determinar el usuario a eliminar.' }
    }

    // 2. Eliminamos al usuario de Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(authUserId)

    if (authError) {
      console.error('Error borrando usuario en Supabase Auth Admin:', authError)
      throw new Error(authError.message)
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error al eliminar la cuenta:', error)
    return { 
      success: false, 
      error: error.message || 'Ocurrió un error al intentar eliminar la cuenta.' 
    }
  }
}