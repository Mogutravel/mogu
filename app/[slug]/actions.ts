'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Inicializamos un cliente de Supabase con la Service Role Key 
// (Asegúrate de tener SUPABASE_SERVICE_ROLE_KEY en tus variables de entorno del servidor)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function deleteUserAccount(userId: string, slug: string) {
  try {
    if (!userId) {
      return { success: false, error: 'ID de usuario no válido.' }
    }

    // 1. Eliminar registros de tablas relacionadas (ej: links, pedidos, etc.)
    await supabaseAdmin.from('links').delete().eq('profile_id', userId)
    
    // 2. Eliminar el perfil en la tabla public.profiles
    await supabaseAdmin.from('profiles').delete().eq('user_id', userId)

    // 3. Eliminar el usuario de Supabase Auth (auth.users)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authError) {
      throw new Error(authError.message)
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error al eliminar la cuenta:', error)
    return { success: false, error: error.message || 'Error al procesar la eliminación.' }
  }
}