import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProfilePage({ params }: PageProps) {
  const { slug } = await params;

  // Consultar perfil en Supabase usando el slug
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !profile) {
    notFound();
  }

  // Validación de estado de la suscripción
  const now = new Date();
  const expirationDate = profile.expires_at ? new Date(profile.expires_at) : null;

  // Si la suscripción expiró
  if (expirationDate && now > expirationDate && profile.subscription_status === 'expired') {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-xl font-extrabold text-white mb-2">Este perfil MOGU ha expirado</h1>
        <p className="text-xs text-neutral-400 mb-6 max-w-xs leading-relaxed">
          El período de activación de este enlace digital ha concluido. El propietario debe renovar su membresía para reactivar su menú y enlaces.
        </p>
        <a
          href="/renovar"
          className="px-6 py-3 bg-emerald-500 text-black text-xs font-extrabold uppercase tracking-wider rounded-2xl transition-all"
        >
          Renovar Membresía MOGU 🚀
        </a>
      </div>
    );
  }

  // Color de acento escogido por el cliente en Supabase (si no tiene, por defecto usa esmeralda #10b981)
  const brandColor = profile.accent_color || profile.theme_color || '#10b981';

  // Renderizado normal del perfil activo
  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col items-center p-6">
      <div className="max-w-md w-full mx-auto space-y-6 pt-10">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-white">{profile.name || slug}</h1>
          
          {/* Texto dinámico que cambia al color escogido por el cliente */}
          <p 
            className="text-xs font-semibold tracking-wider uppercase mt-1"
            style={{ color: brandColor }}
          >
            TARJETA MOGU ACTIVE
          </p>
        </div>

        <p className="text-xs text-neutral-400 text-center">
          Comparte tu identidad digital con un solo Tap
        </p>

        {/* Aquí puedes desplegar el resto de los enlaces o menús del perfil */}
      </div>
    </div>
  );
}