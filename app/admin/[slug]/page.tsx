'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import {
  FaWhatsapp,
  FaInstagram,
  FaFacebook,
  FaGlobe,
  FaMapMarkerAlt,
  FaUtensils,
  FaPhone,
  FaStar,
  FaShoppingBag,
  FaCalendarAlt 
} from 'react-icons/fa'
import { 
  FiPlus, 
  FiTrash2, 
  FiCamera, 
  FiCheck, 
  FiLoader, 
  FiExternalLink,
  FiGift,
  FiArrowRight
} from 'react-icons/fi'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'

interface Profile {
  id: string
  slug: string
  full_name: string
  title: string | null
  bio: string | null
  phone: string | null
  email: string | null
  avatar_url?: string | null
  theme_color?: string | null
  has_menu?: boolean
  has_catalogo?: boolean
  has_loyalty?: boolean // 👈 Columna para verificar si cuenta con la tarjeta de fidelización
}

interface LinkItem {
  id: string
  title: string
  url: string
  position: number
  is_active: boolean
  emoji?: string
}

const COLOR_OPTIONS = [
  { name: 'Esmeralda Mogu', value: 'from-emerald-500 to-teal-400', hex: '#10B981', border: 'border-emerald-500' },
  { name: 'Azul Eléctrico', value: 'from-blue-500 to-indigo-500', hex: '#3B82F6', border: 'border-blue-500' },
  { name: 'Fuchsia Neón', value: 'from-pink-500 to-rose-500', hex: '#EC4899', border: 'border-pink-500' },
  { name: 'Oro Comercial', value: 'from-amber-400 to-orange-500', hex: '#F59E0B', border: 'border-amber-500' },
  { name: 'Púrpura Cyber', value: 'from-purple-500 to-violet-600', hex: '#8B5CF6', border: 'border-purple-500' },
]

const SOCIAL_OPTIONS = [
  { key: "whatsapp", emoji: "💬", label: "💬 WhatsApp", icon: <FaWhatsapp style={{ color: "#25D366" }} className="text-xl" /> },
  { key: "instagram", emoji: "📸", label: "📸 Instagram", icon: <FaInstagram style={{ color: "#E4405F" }} className="text-xl" /> },
  { key: "facebook", emoji: "📘", label: "📘 Facebook", icon: <FaFacebook style={{ color: "#1877F2" }} className="text-xl" /> },
  { key: "web", emoji: "🌐", label: "🌐 Sitio Web", icon: <FaGlobe style={{ color: "#38BDF8" }} className="text-xl" /> },
  { key: "map", emoji: "📍", label: "📍 Ubicación", icon: <FaMapMarkerAlt style={{ color: "#F43F5E" }} className="text-xl" /> },
  { key: "menu", emoji: "📖", label: "📖 Menú Digital", icon: <FaUtensils style={{ color: "#F59E0B" }} className="text-xl" /> },
  { key: "phone", emoji: "📞", label: "📞 Teléfono Directo", icon: <FaPhone style={{ color: "#2DD4BF" }} className="text-xl" /> },
  { key: "star", emoji: "⭐", label: "⭐ Reseña Google", icon: <FaStar style={{ color: "#FACC15" }} className="text-xl" /> },
  { key: "shop", emoji: "🛍️", label: "🛍️ Tienda Online", icon: <FaShoppingBag style={{ color: "#A855F7" }} className="text-xl" /> },
  { key: "booking", emoji: "📅", label: "📅 Reservas", icon: <FaCalendarAlt style={{ color: "#60A5FA" }} className="text-xl" /> },
]

function renderLinkIcon(keyOrEmoji?: string) {
  if (!keyOrEmoji) return <FaGlobe style={{ color: "#38BDF8" }} className="text-xl" />
  const found = SOCIAL_OPTIONS.find(
    (opt) => opt.key === keyOrEmoji || opt.emoji === keyOrEmoji
  )
  if (found) return found.icon
  return <span className="text-base">{keyOrEmoji}</span>
}

export default function AppleStyleAdvancedClientDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [links, setLinks] = useState<LinkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // Estados para nuevo enlace
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newEmoji, setNewEmoji] = useState('whatsapp')
  const [addingLink, setAddingLink] = useState(false)

  // Estados para cambio de contraseña
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/login'
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        const { data: linksData } = await supabase
          .from('links')
          .select('*')
          .eq('profile_id', profileData.id)
          .order('position', { ascending: true })

        if (linksData) setLinks(linksData)
      }
      setLoading(false)
    }

    loadData()
  }, [])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    setMessage('')

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        title: profile.title,
        bio: profile.bio,
        phone: profile.phone,
        theme_color: profile.theme_color,
        avatar_url: profile.avatar_url,
      })
      .eq('id', profile.id)

    setSaving(false)
    if (error) {
      setMessage('❌ Error al actualizar.')
    } else {
      setMessage('✨ ¡Cambios guardados y aplicados en tiempo real!')
      setTimeout(() => setMessage(''), 3500)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage('')

    if (!newPassword || newPassword.length < 6) {
      setPasswordMessage('❌ La contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage('❌ Las contraseñas no coinciden.')
      return
    }

    setUpdatingPassword(true)

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    setUpdatingPassword(false)

    if (error) {
      setPasswordMessage(`❌ Error: ${error.message}`)
    } else {
      setPasswordMessage('✨ ¡Contraseña actualizada con éxito!')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordMessage(''), 4000)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    try {
      setMessage('Subiendo imagen...')
      const fileExt = file.name.split('.').pop()
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setProfile({ ...profile, avatar_url: publicUrl })
      setMessage('✨ ¡Imagen subida con éxito! Haz clic en "Guardar Cambios Visuales" para fijarla.')
      setTimeout(() => setMessage(''), 4000)
    } catch (error: any) {
      console.error('Error al subir imagen:', error)
      setMessage(`❌ Error al subir imagen: ${error.message || 'Verifica los permisos'}`)
    }
  }

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    if (!newTitle.trim() || !newUrl.trim()) {
      alert('Por favor ingresa un título y una URL válida para el enlace.')
      return
    }

    setAddingLink(true)

    let formattedUrl = newUrl.trim()
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`
    }

    const { data, error } = await supabase
      .from('links')
      .insert([
        {
          profile_id: profile.id,
          title: newTitle.trim(),
          url: formattedUrl,
          position: links.length + 1,
          is_active: true,
          emoji: newEmoji,
        },
      ])
      .select()

    setAddingLink(false)

    if (error) {
      alert(`No se pudo añadir el enlace: ${error.message}`)
    } else if (data && data.length > 0) {
      setLinks([...links, data[0]])
      setNewTitle('')
      setNewUrl('')
      setNewEmoji('whatsapp')
    }
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(links)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    const updatedLinks = items.map((item, index) => ({
      ...item,
      position: index + 1,
    }))

    setLinks(updatedLinks)

    try {
      const updates = updatedLinks.map((link) =>
        supabase
          .from('links')
          .update({ position: link.position })
          .eq('id', link.id)
      )
      await Promise.all(updates)
    } catch (error) {
      console.error('Error al actualizar posiciones:', error)
    }
  }

  const handleDeleteLink = async (id: string) => {
    const { error } = await supabase.from('links').delete().eq('id', id)
    if (!error) {
      setLinks(links.filter((l) => l.id !== id))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <FiLoader className="w-8 h-8 text-[#86868B] animate-spin" />
          <span className="text-xs font-medium tracking-wide text-[#86868B]">Cargando Mogu Studio...</span>
        </div>
      </div>
    )
  }

  const activeTheme = COLOR_OPTIONS.find((c) => c.value === profile?.theme_color) || COLOR_OPTIONS[0]
  const loyaltyEditRoute = `/panel/${profile?.slug}/fidelizacion`

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans selection:bg-[#E8E8ED] pb-24">
      
      {/* NAVBAR ESTILO MACOS */}
      <header className="sticky top-0 z-50 bg-[#F5F5F7]/85 backdrop-blur-2xl border-b border-[#E5E5EA] transition-colors">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1D1D1F] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              M
            </div>
            <span className="text-sm font-bold tracking-tight text-[#1D1D1F]">
              MOGU<span className="text-emerald-600">.</span> <span className="text-xs font-normal text-[#86868B] ml-1">Panel de Administración</span>
            </span>
          </Link>

          {profile && (
            <Link
              href={`/${profile.slug}`}
              target="_blank"
              className="px-4 py-2 bg-white hover:bg-[#F0F0F2] border border-[#E5E5EA] text-xs font-medium text-[#1D1D1F] rounded-xl transition flex items-center gap-2 shadow-sm"
            >
              <span>Ver mi Perfil en Vivo</span>
              <FiExternalLink className="text-xs text-[#86868B]" />
            </Link>
          )}
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-6xl mx-auto px-6 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: CONTROLES DE EDICIÓN */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="p-6 rounded-3xl bg-white border border-[#E5E5EA] shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold uppercase tracking-wider rounded-full border border-emerald-200/60 mb-1">
                Estado: Activo ⚡
              </span>
              <h2 className="text-base font-bold text-[#1D1D1F] tracking-tight">¡Bienvenido, {profile?.full_name || 'Emprendedor'}!</h2>
              <p className="text-xs text-[#86868B]">
                Personaliza tu información y administra tus enlaces exclusivos.
              </p>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-[#E5E5EA] shadow-sm space-y-6">
            <div>
              <h1 className="text-base font-bold text-[#1D1D1F] tracking-tight mb-1">Personaliza tu Negocio 🎨</h1>
              <p className="text-xs text-[#86868B]">
                Modifica la identidad visual, colores y datos de tu tarjeta Mogu.
              </p>
            </div>

            {message && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/60 text-xs font-medium text-emerald-700 flex items-center gap-2">
                <FiCheck className="text-sm" />
                <span>{message}</span>
              </div>
            )}

            {profile && (
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-[#86868B] mb-2">Logotipo / Foto de Perfil</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#E5E5EA] bg-[#F5F5F7] flex items-center justify-center shadow-sm">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl">🏢</span>
                      )}
                    </div>
                    <label className="px-4 py-2.5 bg-[#F5F5F7] hover:bg-[#E5E5EA] border border-[#E5E5EA] text-xs font-medium text-[#1D1D1F] rounded-xl cursor-pointer transition flex items-center gap-2">
                      <FiCamera className="text-xs" />
                      <span>Subir nuevo Logo</span>
                      <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#86868B] mb-2">Color de Identidad</label>
                  <div className="grid grid-cols-5 gap-3">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => setProfile({ ...profile, theme_color: color.value })}
                        className={`h-10 rounded-xl transition-all flex items-center justify-center border-2 ${
                          profile.theme_color === color.value ? 'border-[#1D1D1F] scale-105 shadow-sm' : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#86868B] mb-1">Nombre del Negocio</label>
                    <input
                      type="text"
                      value={profile.full_name || ''}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      className="w-full bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl px-3.5 py-2.5 text-xs text-[#1D1D1F] focus:ring-2 focus:ring-[#86868B]/35 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#86868B] mb-1">Categoría Comercial</label>
                    <input
                      type="text"
                      value={profile.title || ''}
                      onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                      className="w-full bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl px-3.5 py-2.5 text-xs text-[#1D1D1F] focus:ring-2 focus:ring-[#86868B]/35 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#86868B] mb-1">Eslogan o Bio del Negocio</label>
                  <textarea
                    rows={2}
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl px-3.5 py-2.5 text-xs text-[#1D1D1F] focus:ring-2 focus:ring-[#86868B]/35 outline-none transition resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#86868B] mb-1">Teléfono / WhatsApp de Contacto</label>
                  <input
                    type="text"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl px-3.5 py-2.5 text-xs text-[#1D1D1F] focus:ring-2 focus:ring-[#86868B]/35 outline-none transition"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-[#1D1D1F] hover:bg-black text-white font-medium text-xs rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : 'Guardar Cambios Visuales'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="p-8 rounded-3xl bg-white border border-[#E5E5EA] shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-[#1D1D1F] tracking-tight mb-1">Canales y Enlaces Interactivos</h2>
              <p className="text-xs text-[#86868B]">Elige el canal oficial y mantén presionado <b>⋮⋮</b> para reordenar.</p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <select
                  value={newEmoji}
                  onChange={(e) => setNewEmoji(e.target.value)}
                  className="bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl px-3 py-2.5 text-xs font-medium text-[#1D1D1F] focus:ring-2 focus:ring-[#86868B]/35 outline-none cursor-pointer"
                >
                  {SOCIAL_OPTIONS.map((option) => (
                    <option key={option.key} value={option.key} className="bg-white text-[#1D1D1F]">
                      {option.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Título (ej. Menú Digital, WhatsApp)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="flex-1 bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl px-3.5 py-2.5 text-xs text-[#1D1D1F] focus:ring-2 focus:ring-[#86868B]/35 outline-none"
                />
              </div>
              <input
                type="text"
                placeholder="URL de destino (https://...)"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl px-3.5 py-2.5 text-xs text-[#1D1D1F] focus:ring-2 focus:ring-[#86868B]/35 outline-none"
              />
              <button
                type="button"
                disabled={addingLink}
                onClick={handleAddLink}
                className="w-full py-2.5 bg-[#1D1D1F] hover:bg-black text-white font-medium text-xs rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FiPlus className="text-sm" />
                <span>{addingLink ? 'Añadiendo...' : 'Añadir Enlace Interactivo'}</span>
              </button>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="dashboard-links">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2.5 pt-2">
                    {links.length === 0 ? (
                      <p className="text-xs text-[#86868B] text-center py-4">No hay enlaces agregados todavía.</p>
                    ) : (
                      links.map((link, index) => (
                        <Draggable key={link.id} draggableId={link.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-center justify-between p-3.5 bg-[#F5F5F7] border rounded-2xl transition-all ${
                                snapshot.isDragging
                                  ? 'border-[#1D1D1F] bg-white shadow-lg scale-[1.02] z-50'
                                  : 'border-[#E5E5EA] hover:border-[#86868B]/40'
                              }`}
                            >
                              <div className="flex items-center space-x-3 overflow-hidden pr-2">
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-grab active:cursor-grabbing text-[#86868B] hover:text-[#1D1D1F] p-1 rounded transition"
                                  title="Arrastrar para mover"
                                >
                                  <span className="text-base font-black leading-none">⋮⋮</span>
                                </div>

                                <div className="w-9 h-9 rounded-xl bg-white border border-[#E5E5EA] flex items-center justify-center flex-shrink-0 shadow-sm">
                                  {renderLinkIcon(link.emoji)}
                                </div>

                                <div className="overflow-hidden">
                                  <p className="text-xs font-semibold text-[#1D1D1F] truncate">{link.title}</p>
                                  <p className="text-[10px] text-[#86868B] truncate">{link.url}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteLink(link.id)}
                                className="p-2 text-[#86868B] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                                title="Borrar enlace"
                              >
                                <FiTrash2 className="text-xs" />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          {/* MÓDULO DE MENÚ DIGITAL */}
          {profile?.has_menu && (
            <div className="p-6 rounded-3xl bg-white border border-[#E5E5EA] shadow-sm flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-1">
                <span className="inline-block px-2.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-semibold uppercase tracking-wider rounded-full border border-amber-200/60 mb-1">
                  Módulo Gastronomía 🍽️
                </span>
                <h2 className="text-sm font-bold text-[#1D1D1F] tracking-tight">Editor de Menú y Carta Digital</h2>
                <p className="text-xs text-[#86868B] max-w-sm">
                  Gestiona tus categorías, platos, precios y diseños visuales de tu carta.
                </p>
              </div>
              
              <Link
                href={`/panel/menu/${profile?.slug}`}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs rounded-xl transition shadow-sm flex items-center gap-1.5 flex-shrink-0"
              >
                <span>Editar Menú</span>
                <FiExternalLink className="text-xs" />
              </Link>
            </div>
          )}

          {/* MÓDULO DE TIENDA ONLINE */}
          {profile?.has_catalogo && (
            <div className="p-6 rounded-3xl bg-white border border-[#E5E5EA] shadow-sm flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-center text-xl shadow-sm flex-shrink-0">
                  🛍️
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-semibold uppercase tracking-wider rounded-full border border-purple-200/60 mb-1">
                    Módulo E-commerce 🛒
                  </span>
                  <h3 className="text-sm font-bold text-[#1D1D1F] tracking-tight">
                    Editor de Tienda Online
                  </h3>
                  <p className="text-xs text-[#86868B] mt-0.5">
                    Gestión de catálogo, productos físicos y control de stock.
                  </p>
                </div>
              </div>

              <Link
                href={`/panel/tienda/${profile?.slug}`}
                className="px-4 py-2.5 bg-[#1D1D1F] hover:bg-black text-white font-medium text-xs rounded-xl transition shadow-sm flex items-center gap-1.5 flex-shrink-0"
              >
                <span>Editar Tienda</span>
                <FiExternalLink className="text-xs" />
              </Link>
            </div>
          )}

          {/* MÓDULO DE FIDELIZACIÓN DIGITAL (SÓLO SI HAS_LOYALTY ES TRUE) */}
          {profile?.has_loyalty && (
            <div className="p-6 rounded-3xl bg-white border border-[#E5E5EA] shadow-sm flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center text-xl shadow-sm flex-shrink-0">
                  <FiGift />
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold uppercase tracking-wider rounded-full border border-emerald-200/60 mb-1">
                    Módulo VIP 🎁
                  </span>
                  <h3 className="text-sm font-bold text-[#1D1D1F] tracking-tight">
                    Tarjeta de Fidelización
                  </h3>
                  <p className="text-xs text-[#86868B] mt-0.5">
                    Configura sellos, PIN de caja y recompensas para clientes frecuentes.
                  </p>
                </div>
              </div>

              <Link
                href={loyaltyEditRoute}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-xs rounded-xl transition shadow-sm flex items-center gap-1.5 flex-shrink-0"
              >
                <span>Editar Tarjeta</span>
                <FiArrowRight className="text-xs" />
              </Link>
            </div>
          )}

          {/* SECCIÓN DE SEGURIDAD */}
          <div className="p-8 rounded-3xl bg-white border border-[#E5E5EA] shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-[#1D1D1F] tracking-tight mb-1">Seguridad de la Cuenta 🔒</h2>
              <p className="text-xs text-[#86868B]">Reemplaza tu contraseña temporal por una definitiva y segura.</p>
            </div>

            {passwordMessage && (
              <div className={`p-3.5 rounded-2xl text-xs font-medium border flex items-center gap-2 ${passwordMessage.startsWith('❌') ? 'bg-rose-50 text-rose-700 border-rose-200/60' : 'bg-emerald-50 text-emerald-700 border-emerald-200/60'}`}>
                <span>{passwordMessage}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#86868B] mb-1">Nueva Contraseña</label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl px-3.5 py-2.5 text-xs text-[#1D1D1F] focus:ring-2 focus:ring-[#86868B]/35 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#86868B] mb-1">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  placeholder="Repite tu nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl px-3.5 py-2.5 text-xs text-[#1D1D1F] focus:ring-2 focus:ring-[#86868B]/35 outline-none transition"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="px-5 py-2.5 bg-[#F5F5F7] hover:bg-[#E5E5EA] border border-[#E5E5EA] text-[#1D1D1F] font-medium text-xs rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {updatingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* COLUMNA DERECHA: PREVISUALIZADOR EN VIVO ESTILO APPLE */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="sticky top-24 w-full max-w-xs bg-white border-4 border-[#E5E5EA] rounded-[44px] p-4 shadow-xl relative overflow-hidden">
            
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4 bg-[#E5E5EA] rounded-full z-30" />

            <div className="bg-[#FAFAFC] rounded-[32px] pt-10 pb-6 px-4 min-h-[580px] flex flex-col justify-between relative overflow-hidden border border-[#E5E5EA]/60">
              
              <div className={`absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-r ${activeTheme.value} opacity-15 blur-[60px] rounded-full pointer-events-none`} />

              <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                <div className="w-20 h-20 rounded-full bg-white border border-[#E5E5EA] overflow-hidden flex items-center justify-center shadow-md">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl">🏢</span>
                  )}
                </div>

                <div>
                  <h2 className="text-sm font-bold text-[#1D1D1F] tracking-tight">{profile?.full_name || 'Tu Negocio'}</h2>
                  <p 
                    className="text-[10px] font-semibold uppercase tracking-wider mt-0.5"
                    style={{ color: activeTheme.hex }}
                  >
                    {profile?.title || 'Categoría PyME'}
                  </p>
                  <p className="text-[10px] text-[#86868B] mt-1 max-w-[200px] leading-snug">{profile?.bio || 'Descripción del negocio...'}</p>
                </div>

                <div className={`w-full py-2.5 rounded-xl bg-gradient-to-r ${activeTheme.value} text-white font-semibold text-[10px] uppercase tracking-wider shadow-sm`}>
                  Guardar en Contactos
                </div>

                <div className="w-full space-y-2 pt-2">
                  {links.length === 0 ? (
                    <p className="text-[10px] text-[#86868B] py-4">Agrega enlaces para verlos aquí</p>
                  ) : (
                    links.map((l) => (
                      <div key={l.id} className="p-2.5 bg-white border border-[#E5E5EA] rounded-xl flex items-center justify-between text-left shadow-sm">
                        <div className="flex items-center space-x-2 overflow-hidden">
                          <div className="w-6 h-6 rounded-lg bg-[#F5F5F7] flex items-center justify-center flex-shrink-0">
                            {renderLinkIcon(l.emoji)}
                          </div>
                          <span className="text-[11px] font-medium text-[#1D1D1F] truncate">{l.title}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>

      </main>

    </div>
  )
}