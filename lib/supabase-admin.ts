import { createClient } from "@supabase/supabase-js";

// Solo se usa en el servidor: la clave secreta nunca llega al navegador
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);
