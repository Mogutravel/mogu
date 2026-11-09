'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function MoguStartWizard() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Estado del formulario con todos los campos requeridos
  const [formData, setFormData] = useState({
    businessName: '',     // full_name
    slug: '',             // slug único
    title: '',            // Categoría comercial
    bio: '',              // Bio o Eslogan
    phone: '',            // WhatsApp de contacto
    theme_color: '#3b82f6', // Color de identidad
    avatar_url: '',       // URL pública de Supabase Storage
    email: '',
    password: '',
  })

  // Archivo real seleccionado para el bucket de imágenes
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Opciones de colores de identidad
  const colorOptions = [
    { label: 'Verde Menta', value: '#34d399' },
    { label: 'Azul Clásico', value: '#3b82f6' },
    { label: 'Rosa Neón', value: '#ec4899' },
    { label: 'Ámbar Cálido', value: '#f59e0b' },
    { label: 'Morado Vibe', value: '#8b5cf6' },
  ]

  // Validación de slug en tiempo real
  const [isCheckingSlug, setIsCheckingSlug] = useState(false)
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null)

  const handleBusinessNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')

    setFormData(prev => ({
      ...prev,
      businessName: val,
      slug: generatedSlug,
    }))
  }

  useEffect(() => {
    if (!formData.slug) {
      setIsSlugAvailable(null)
      return
    }

    setIsCheckingSlug(true)
    const timer = setTimeout(async () => {
      try {
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('slug', formData.slug)
          .maybeSingle()

        setIsSlugAvailable(!existing)
      } catch (err) {
        console.error('Error al verificar slug:', err)
      } finally {
        setIsCheckingSlug(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [formData.slug])

  // Selección del archivo para el Storage
  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleStepSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (step === 1) {
      setStep(2)
      return
    }

    if (step === 2) {
      if (!formData.businessName || !formData.slug) {
        setErrorMsg('Ingresa el nombre de tu negocio para continuar.')
        return
      }
      if (isSlugAvailable === false) {
        setErrorMsg('El enlace seleccionado ya está ocupado por otro perfil.')
        return
      }
      setStep(3)
      return
    }

    // PASO 3: REGISTRO Y SUBIDA DE IMAGEN AL BUCKET
    if (step === 3) {
      if (!formData.email || !formData.password) {
        setErrorMsg('Por favor ingresa tu correo y una clave de acceso.')
        return
      }

      if (formData.password.length < 6) {
        setErrorMsg('La clave de acceso debe tener al menos 6 caracteres.')
        return
      }

      setLoading(true)
      try {
        let uploadedAvatarUrl = ''

        // 1. Subir imagen al Storage de Supabase si se seleccionó archivo
        if (avatarFile) {
          const fileExt = avatarFile.name.split('.').pop()
          const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
          const filePath = `${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile)

          if (uploadError) {
            console.error('Error subiendo imagen al storage:', uploadError)
          } else {
            const { data: publicUrlData } = supabase.storage
              .from('avatars')
              .getPublicUrl(filePath)
            
            uploadedAvatarUrl = publicUrlData.publicUrl
          }
        }

        // 2. Crear usuario en Supabase Auth
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.businessName,
              slug: formData.slug,
              title: formData.title,
              bio: formData.bio,
              phone: formData.phone,
              theme_color: formData.theme_color,
              avatar_url: uploadedAvatarUrl,
            },
          },
        })

        if (signUpError) throw signUpError
        if (!authData.user) throw new Error('No se pudo crear la cuenta de usuario.')

        // 3. Obtener id del plan 'mogu-start'
        const { data: planData } = await supabase
          .from('plans')
          .select('id')
          .eq('slug', 'mogu-start')
          .maybeSingle()

        // 4. Inserción en profiles (Solo Fidelización activa, user_id vinculado, sin pin_code/menu/catalogo)
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            user_id: authData.user.id, // Vínculo explícito para auth en login
            email: formData.email,
            full_name: formData.businessName,
            slug: formData.slug,
            title: formData.title,
            bio: formData.bio,
            phone: formData.phone,
            theme_color: formData.theme_color,
            avatar_url: uploadedAvatarUrl || null,
            plan_id: planData?.id || null,
            has_loyalty: true,        // ÚNICA FEATURE ACTIVA EN MOGU START
            has_menu: false,          // No aplica en Mogu Start
            has_catalogo: false,      // No aplica en Mogu Start
            subscription_status: 'active',
            subscription_type: 'free_start',
          })

        if (profileError) {
          console.error('Error insertando en profiles:', profileError)
          throw profileError
        }

        // 5. Creación del programa inicial en loyalty_programs para Mogu Start
        const { error: loyaltyError } = await supabase
          .from('loyalty_programs')
          .upsert({
            profile_id: authData.user.id,
            program_name: `Club de Fidelización ${formData.businessName}`,
            collection_tag: '✦ MOGU PASS ✦',
            stamps_required: 10,
            reward_title: 'Premio Sorpresa / Producto Gratis',
            reward_description: '¡Felicidades! Completaste tu tarjeta Mogu. Muestra este pase en caja.',
            is_active: true,
          }, { onConflict: 'profile_id' })

        if (loyaltyError) {
          console.error('Error creando el programa de fidelización:', loyaltyError)
        }

        // 6. Redirigir al panel de administración del cliente
        window.location.href = `/admin/${formData.slug}`
      } catch (err: any) {
        const message = err?.message || ''
        console.error('Error en el registro:', message, err)

        if (message.includes('User already registered') || message.includes('already registered')) {
          setErrorMsg('Este correo electrónico ya está registrado. Intenta iniciar sesión o usa otro correo.')
        } else {
          setErrorMsg(message || 'Error al registrar la cuenta. Verifica tus datos.')
        }
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0E0C0A] text-[#D4CEC7] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="fixed inset-0 bg-gradient-to-b from-[#4c1d95]/30 via-[#1e40af]/20 to-[#0E0C0A] pointer-events-none -z-10" />

      <div className="max-w-lg w-full bg-white/[0.05] backdrop-blur-2xl border border-white/15 rounded-3xl p-8 shadow-2xl relative">
        
        {/* INDICADOR DE PASOS */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          {[
            { num: 1, label: 'Plan' },
            { num: 2, label: 'Identidad del Negocio' },
            { num: 3, label: 'Acceso' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s.num
                    ? 'bg-cyan-400 text-[#0E0C0A] shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                    : step > s.num
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-white/30 border border-white/10'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </div>
              <span className={`text-xs font-semibold ${step === s.num ? 'text-white' : 'text-white/40'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleStepSubmit} className="space-y-6">

          {/* PASO 1 */}
          {step === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="text-center space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/30">
                  Plan Inicial Gratis
                </span>
                <h1 className="text-3xl font-black text-white tracking-tight">Mogu Start</h1>
                <p className="text-xs text-[#D4CEC7]">
                  Crea tu perfil básico con sistema de fidelización sin costo de mantenimiento.
                </p>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-baseline border-b border-white/10 pb-3">
                  <span className="text-xs font-semibold text-white/80">Costo</span>
                  <span className="text-2xl font-black text-white">$0 CLP</span>
                </div>
                <p className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">Incluye gratis:</p>
                <ul className="space-y-2 text-xs text-white/90">
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold">✓</span> Perfil institucional Mogu
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold">✓</span> Tarjeta de Fidelización (Mogu Pass)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold">✓</span> Redes sociales y contacto
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* PASO 2: PERSONALIZA TU NEGOCIO */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center space-y-1 mb-2">
                <h2 className="text-xl font-black text-white tracking-tight">Personaliza tu Negocio 🎨</h2>
                <p className="text-xs text-[#D4CEC7]">Modifica la identidad visual, colores y datos de tu perfil Mogu.</p>
              </div>

              {/* Logotipo / Avatar */}
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-2">Logotipo / Foto de Perfil</label>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">☕</span>
                    )}
                  </div>
                  <label className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-semibold text-white cursor-pointer transition">
                    📷 Subir nuevo Logo
                    <input type="file" accept="image/*" onChange={handleLogoSelect} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Color de Identidad */}
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-2">Color de Identidad</label>
                <div className="flex items-center gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, theme_color: color.value }))}
                      style={{ backgroundColor: color.value }}
                      className={`w-8 h-8 rounded-full transition-all ${
                        formData.theme_color === color.value ? 'ring-4 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              {/* Nombre y Categoría */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">Nombre del Negocio</label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleBusinessNameChange}
                    placeholder="Ej. Días de café ☕"
                    required
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">Categoría Comercial</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ej. Cafetería de especialidad"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              {/* URL Personalizada */}
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Tu URL personalizada (slug)</label>
                <div className={`flex items-center bg-white/5 border rounded-xl px-4 py-2.5 text-sm transition ${
                  isSlugAvailable === true ? 'border-emerald-500/60' : isSlugAvailable === false ? 'border-red-500/60' : 'border-white/15'
                }`}>
                  <span className="text-cyan-400 font-medium select-none">mogu.cl/</span>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                    placeholder="diasdecafe"
                    required
                    className="w-full bg-transparent border-none p-0 text-white focus:outline-none ml-1 text-sm"
                  />
                  {isCheckingSlug && <span className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin ml-2" />}
                  {!isCheckingSlug && isSlugAvailable === true && <span className="text-emerald-400 text-xs font-bold ml-2">✓</span>}
                  {!isCheckingSlug && isSlugAvailable === false && <span className="text-red-400 text-xs font-bold ml-2">✕</span>}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Eslogan o Bio del Negocio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Ej. Lunes a viernes de 08:00 a 21:00 hrs"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 transition resize-none"
                />
              </div>

              {/* Teléfono / WhatsApp */}
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Teléfono / WhatsApp de Contacto</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+56953705453"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
            </div>
          )}

          {/* PASO 3 */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center space-y-1 mb-4">
                <h2 className="text-2xl font-black text-white tracking-tight">Acceso a tu Cuenta</h2>
                <p className="text-xs text-[#D4CEC7]">
                  Ingresa tu correo y clave para activar y administrar tu panel de control.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">Correo Electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contacto@miempresa.cl"
                  required
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-white/80">Clave de Acceso Inicial</label>
                  <span className="text-[10px] text-cyan-400">Mínimo 6 caracteres</span>
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Crea una contraseña segura"
                  required
                  minLength={6}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 text-center">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3)}
                className="w-1/3 py-3.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-white/10 hover:bg-white/20 text-white transition border border-white/15"
              >
                Atrás
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-white hover:bg-slate-100 text-[#0E0C0A] transition shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading
                ? 'Subiendo logo y creando perfil...'
                : step === 3
                ? 'Activar Mogu Start 🚀'
                : 'Continuar →'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/" className="text-xs text-white/40 hover:text-white transition">
              Volver a la página principal
            </Link>
          </div>
        </form>

      </div>
    </div>
  )
}