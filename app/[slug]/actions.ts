'use server'

import { createClient } from '@supabase/supabase-js'

// Inicializamos el cliente con la Service Role Key para operaciones administrativas
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function deleteUserAccount(providedId: string, slug: string) {
  try {
    if (!providedId && !slug) {
      return { success: false, error: 'Identificador de usuario no válido.' }
    }

    let authUserId: string | null = null

    // 1. Intentamos obtener el user_id de auth.users desde la tabla profiles
    // Buscamos primero por id del perfil y como respaldo por el slug
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .or(`id.eq.${providedId},slug.eq.${slug}`)
      .maybeSingle()

    if (profile?.user_id) {
      authUserId = profile.user_id
    } else {
      // Fallback: si no se encontró en profiles o si el ID provisto ya era el user_id de auth
      authUserId = providedId
    }

    // 2. Eliminamos al usuario directamente de Supabase Auth (auth.users)
    // El ON DELETE CASCADE en PostgreSQL se encargará de borrar en cadena
    // el perfil, los links, programas de fidelización, etc.
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