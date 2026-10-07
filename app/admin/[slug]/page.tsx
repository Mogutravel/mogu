'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Profile {
  id: string
  slug: string
  user_id: string
  full_name: string
  title: string | null
  bio: string | null
  phone: string | null
  email: string | null
  avatar_url?: string | null
}

interface LinkItem {
  id: string
  title: string
  url: string
  position: number
  is_active: boolean
}

export default function AdminProfilePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [links, setLinks] = useState<LinkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)

  // Estados Formularios
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [addingLink, setAddingLink] = useState(false)

  const [fullName, setFullName] = useState('')
  const [title, setTitle] = useState('')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)

  const [savingProfile, setSavingProfile] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const fetchLinks = async (profileId: string) => {
    const { data } = await supabase
      .from('links')
      .select('*')
      .eq('profile_id', profileId)
      .order('position', { ascending: true })

    if (data) setLinks(data)
  }

  useEffect(() => {
    async function loadAdminData() {
      if (!slug) return
      setLoading(true)

      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        router.push('/login')
        return
      }

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error || !profileData || profileData.user_id !== session.user.id) {
        setUnauthorized(true)
        setLoading(false)
        return
      }

      setProfile(profileData)
      setFullName(profileData.full_name || '')
      setTitle(profileData.title || '')
      setBio(profileData.bio || '')
      setPhone(profileData.phone || '')
      setEmail(profileData.email || '')
      setAvatarUrl(profileData.avatar_url || '')

      await fetchLinks(profileData.id)
      setLoading(false)
    }

    loadAdminData()
  }, [slug, router])

  // Subir imagen directa a Supabase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0 || !profile) return
      const file = e.target.files[0]
      setUploadingImage(true)

      const fileExt = file.name.split('.').pop()
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      // Subir archivo al bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Obtener URL pública
      const { data: publicURLData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const publicUrl = publicURLData.publicUrl
      setAvatarUrl(publicUrl)

      // Guardar de inmediato en la base de datos
      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id)

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error: any) {
      alert('Error al subir la imagen: ' + (error.message || 'Error desconocido'))
    } finally {
      setUploadingImage(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSavingProfile(true)
    setSaveSuccess(false)

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        title,
        bio,
        phone,
        email,
        avatar_url: avatarUrl.trim() !== '' ? avatarUrl.trim() : null,
      })
      .eq('id', profile.id)

    setSavingProfile(false)

    if (!error) {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile || !newTitle.trim() || !newUrl.trim()) return

    setAddingLink(true)

    let formattedUrl = newUrl.trim()
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`
    }

    const nextPos = links.length > 0 ? Math.max(...links.map((l) => l.position)) + 1 : 0

    await supabase.from('links').insert([
      {
        profile_id: profile.id,
        title: newTitle.trim(),
        url: formattedUrl,
        position: nextPos,
        is_active: true,
      },
    ])

    setAddingLink(false)
    setNewTitle('')
    setNewUrl('')
    fetchLinks(profile.id)
  }

  const handleToggleLink = async (linkId: string, currentStatus: boolean) => {
    if (!profile) return
    await supabase.from('links').update({ is_active: !currentStatus }).eq('id', linkId)
    fetchLinks(profile.id)
  }

  const handleDeleteLink = async (linkId: string) => {
    if (!profile || !confirm('¿Eliminar este enlace?')) return
    await supabase.from('links').delete().eq('id', linkId)
    fetchLinks(profile.id)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: '#0A0A0C', minHeight: '100vh', width: '100%' }} className="text-white flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (unauthorized) {
    return (
      <div style={{ backgroundColor: '#0A0A0C', minHeight: '100vh', width: '100%' }} className="text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-xl font-bold mb-2">Acceso Restringido</h1>
        <p className="text-xs text-neutral-400 mb-6 max-w-xs">
          No tienes permisos para administrar este perfil o has iniciado sesión con otra cuenta.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-2.5 bg-emerald-500 text-black font-bold text-xs rounded-xl"
        >
          Ir al Login / Cambiar Cuenta
        </button>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#0A0A0C', minHeight: '100vh', width: '100%' }} className="text-white font-sans selection:bg-emerald-500/30">
      
      {/* NAVBAR TOP */}
      <header className="sticky top-0 z-50 bg-[#0A0A0C]/90 backdrop-blur-xl border-b border-neutral-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-black text-lg tracking-wider text-white">MOGU</span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full">
              Panel Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`/nfc/${profile?.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl text-xs font-medium text-neutral-300 transition flex items-center gap-1.5"
            >
              <span>Ver Tarjeta Pública</span>
              <span className="text-xs">↗</span>
            </a>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium rounded-xl hover:bg-red-500/20 transition cursor-pointer"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8">

        {/* NOTIFICACIÓN ÉXITO */}
        {saveSuccess && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-2xl flex items-center gap-2">
            <span>✓</span>
            <span>Cambios guardados con éxito en tu tarjeta NFC.</span>
          </div>
        )}

        {/* SECCIÓN 1: DATOS DEL PERFIL & SUBIDA DE AVATAR */}
        <section className="bg-neutral-900/40 backdrop-blur-xl p-6 rounded-3xl border border-neutral-800/80 space-y-6">
          <div className="border-b border-neutral-800/80 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="text-emerald-400">01.</span> Información Personal, Foto & Contacto
            </h2>
          </div>

          {/* SUBIDA DE FOTO DESDE EL DISPOSITIVO */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl">
            <div className="relative w-16 h-16 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-black text-emerald-400">
                  {fullName ? fullName.substring(0, 2).toUpperCase() : 'M'}
                </span>
              )}
            </div>

            <div className="flex-1 w-full space-y-2">
              <label className="block text-[11px] font-medium text-neutral-400">Sube tu Foto de Perfil</label>
              <div className="flex items-center gap-3">
                <label className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white text-xs font-semibold rounded-xl cursor-pointer transition">
                  {uploadingImage ? 'Subiendo...' : 'Seleccionar Archivo'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
                <span className="text-[10px] text-neutral-500">PNG, JPG o WEBP (Máx. 5MB)</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/80 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">Cargo / Empresa</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/80 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">Teléfono Móvil (vCard)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/80 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">Correo Electrónico (vCard)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/80 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">Breve Descripción / Bio</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/80 transition"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl transition cursor-pointer"
            >
              {savingProfile ? 'Guardando...' : 'Guardar Datos del Perfil'}
            </button>
          </form>
        </section>

        {/* SECCIÓN 2: AGREGAR ENLACE */}
        <section className="bg-neutral-900/40 backdrop-blur-xl p-6 rounded-3xl border border-neutral-800/80 space-y-4">
          <div className="border-b border-neutral-800/80 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="text-emerald-400">02.</span> Agregar Nuevo Enlace
            </h2>
          </div>

          <form onSubmit={handleAddLink} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">Título del Enlace</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Instagram, Catálogo, Web"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/80 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">URL de Destino</label>
                <input
                  type="text"
                  required
                  placeholder="instagram.com/usuario"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/80 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={addingLink}
              className="px-5 py-2.5 bg-white hover:bg-neutral-200 text-black font-extrabold text-xs rounded-xl transition cursor-pointer"
            >
              {addingLink ? 'Agregando...' : '+ Agregar Botón'}
            </button>
          </form>
        </section>

        {/* SECCIÓN 3: LISTA Y EDITAR ENLACES */}
        <section className="bg-neutral-900/40 backdrop-blur-xl p-6 rounded-3xl border border-neutral-800/80 space-y-4">
          <div className="border-b border-neutral-800/80 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="text-emerald-400">03.</span> Enlaces Activos ({links.length})
            </h2>
          </div>

          {links.length === 0 ? (
            <p className="text-xs text-neutral-500 py-6 text-center">No has agregado enlaces aún.</p>
          ) : (
            <div className="space-y-3">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-3.5 bg-neutral-900/80 border border-neutral-800/80 rounded-2xl hover:border-neutral-700 transition"
                >
                  <div className="overflow-hidden pr-3 space-y-0.5">
                    <p className={`text-xs font-bold ${link.is_active ? 'text-white' : 'text-neutral-500 line-through'}`}>
                      {link.title}
                    </p>
                    <p className="text-[10px] text-neutral-500 truncate">{link.url}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleLink(link.id, link.is_active)}
                      className={`px-3 py-1 rounded-xl text-[10px] font-semibold transition cursor-pointer ${
                        link.is_active
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                      }`}
                    >
                      {link.is_active ? 'Visible' : 'Oculto'}
                    </button>

                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-[10px] hover:bg-red-500/20 transition cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  )
}