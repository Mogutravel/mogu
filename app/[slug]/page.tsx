// Ejemplo de lógica de validación de estado en la carga del perfil
const now = new Date();
const expirationDate = profile.expires_at ? new Date(profile.expires_at) : null;

// Si la suscripción expiró y el perfil no es activo
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