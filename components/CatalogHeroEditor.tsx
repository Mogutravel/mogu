'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { FiSave, FiCheck, FiUploadCloud } from 'react-icons/fi'

interface CatalogHeroEditorProps {
  profileId: string
}

export default function CatalogHeroEditor({ profileId }: CatalogHeroEditorProps) {
  const [subtitle, setSubtitle] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [heroImage, setHeroImage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    async function loadHeroData() {
      const { data } = await supabase
        .from('profiles')
        .select('catalog_hero_subtitle, catalog_hero_title, catalog_hero_description, catalog_hero_image, full_name')
        .eq('id', profileId)
        .single()

      if (data) {
        setSubtitle(data.catalog_hero_subtitle || `✦ ${data.full_name?.toUpperCase() || 'MOGU'} COLLECTION ✦`)
        setTitle(data.catalog_hero_title || 'Curaduría\nExclusiva')
        setDescription(data.catalog_hero_description || 'Una selección donde la luz, las texturas y el espacio dialogan en perfecta armonía.')
        setHeroImage(data.catalog_hero_image || '')
      }
    }
    if (profileId) loadHeroData()
  }, [profileId])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return

      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `hero_${profileId}_${Date.now()}.${fileExt}`
      const filePath = `catalog_heroes/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('catalogo')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from('catalogo')
        .getPublicUrl(filePath)

      setHeroImage(publicUrlData.publicUrl)
    } catch (err) {
      console.error('Error al subir imagen:', err)
      alert('Ocurrió un error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSavedSuccess(false)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          catalog_hero_subtitle: subtitle,
          catalog_hero_title: title,
          catalog_hero_description: description,
          catalog_hero_image: heroImage,
        })
        .eq('id', profileId)

      if (error) throw error

      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
    } catch (err) {
      console.error('Error al guardar hero:', err)
      alert('Error al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-xl">
      <div className="border-b border-neutral-800 pb-4">
        <h2 className="text-lg font-black text-white">Portada del Catálogo (Hero) 🖼️</h2>
        <p className="text-xs text-neutral-400 mt-1">
          Personaliza los textos de bienvenida y la imagen de fondo principal de tu tienda.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-2">
            Badge Superior / Tag
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="✦ PRUEBA CATALOGO 1 COLLECTION ✦"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-2">
            Título Principal (Usa salto de línea para separar en cursiva)
          </label>
          <textarea
            rows={2}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={'Curaduría\nExclusiva'}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 outline-none transition resize-none font-serif text-base"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-2">
            Descripción Corta
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Una selección donde la luz, las texturas y el espacio dialogan en perfecta armonía."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 outline-none transition resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-2">
            Imagen de Fondo del Hero
          </label>

          <div className="space-y-3">
            {heroImage && (
              <div className="relative h-40 w-full rounded-2xl overflow-hidden border border-neutral-800">
                <img src={heroImage} alt="Hero Background Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-end p-3">
                  <span className="text-[10px] text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                    Vista previa actual
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <label className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-bold text-white flex items-center gap-2 cursor-pointer transition">
                <FiUploadCloud className="text-emerald-400 text-sm" />
                <span>{uploading ? 'Subiendo...' : 'Subir Imagen'}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
              </label>

              <input
                type="text"
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value)}
                placeholder="O pega una URL de imagen..."
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 outline-none transition"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
        {savedSuccess && (
          <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
            <FiCheck /> Guardado correctamente
          </span>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || uploading}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-lg flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <FiSave />
          <span>{saving ? 'Guardando...' : 'Guardar Portada'}</span>
        </button>
      </div>
    </div>
  )
}