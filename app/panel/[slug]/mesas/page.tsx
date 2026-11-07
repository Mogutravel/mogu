'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  FiGrid,
  FiPlus,
  FiTrash2,
  FiCopy,
  FiCheck,
  FiArrowLeft,
  FiSmartphone,
} from 'react-icons/fi'

interface TableItem {
  id: string
  store_slug: string
  table_number: number
  status: string
  active: boolean
}

export default function TablesManagementPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [tables, setTables] = useState<TableItem[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedTable, setCopiedTable] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)

  const fetchTables = async () => {
    if (!slug) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .eq('store_slug', slug)
        .order('table_number', { ascending: true })

      if (error) throw error
      setTables(data || [])
    } catch (err) {
      console.error('Error al cargar mesas:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTables()
  }, [slug])

  // Agregar la siguiente mesa numérica consecutiva
  const handleAddTable = async () => {
    const nextNumber = tables.length > 0 ? Math.max(...tables.map((t) => t.table_number)) + 1 : 1
    setCreating(true)

    try {
      const { error } = await supabase.from('tables').insert([
        {
          store_slug: slug,
          table_number: nextNumber,
          status: 'libre',
          active: true,
        },
      ])

      if (error) throw error
      fetchTables()
    } catch (err) {
      console.error('Error al crear mesa:', err)
      alert('No se pudo crear la mesa. Asegúrate de tener la tabla tables creada en Supabase.')
    } finally {
      setCreating(false)
    }
  }

  // Eliminar una mesa
  const handleDeleteTable = async (tableId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta mesa?')) return

    try {
      const { error } = await supabase.from('tables').delete().eq('id', tableId)
      if (error) throw error
      fetchTables()
    } catch (err) {
      console.error('Error al eliminar mesa:', err)
    }
  }

  // Copiar link NFC/QR de la mesa
  const handleCopyLink = (tableNumber: number) => {
    const url = `${window.location.origin}/menu/${slug}?mesa=${tableNumber}`
    navigator.clipboard.writeText(url)
    setCopiedTable(tableNumber)
    setTimeout(() => setCopiedTable(null), 2500)
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-white font-sans p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272A] pb-6">
          <div>
            <a
              href={`/panel/${slug}`} className="flex items-center gap-2 text-xs font-medium text-white/50 hover:text-white transition mb-3" > <FiArrowLeft /> Volver al panel de administración </a> <h1 className="text-3xl font-black tracking-tight flex items-center gap-3"> <FiGrid className="text-[#FF7A45]" /> Gestión de Mesas, QRs y NFC </h1> <p className="text-xs text-white/50 mt-1"> Administra las mesas físicas de tu local y obtén sus enlaces individuales para códigos QR y etiquetas NFC. </p> </div>  <button onClick={handleAddTable} disabled={creating} className="px-5 py-3 bg-[#FF7A45] hover:brightness-110 text-black font-extrabold text-xs rounded-2xl transition cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 shadow-lg shadow-[#FF7A45]/20" > <FiPlus className="text-base" /> {creating ? 'Creando...' : 'Añadir Nueva Mesa'} </button> </div>  {/* Listado / Grilla de Mesas */} {loading ? ( <div className="py-20 text-center text-white/40 text-xs tracking-widest uppercase animate-pulse"> Cargando mesas del local... </div> ) : tables.length === 0 ? ( <div className="bg-[#141416] border border-[#27272A] rounded-3xl p-12 text-center space-y-4"> <FiSmartphone className="text-4xl text-[#FF7A45] mx-auto opacity-50" /> <h2 className="text-lg font-bold">Aún no tienes mesas creadas</h2> <p className="text-xs text-white/50 max-w-sm mx-auto"> Haz clic en el botón superior para agregar tu primera mesa y generar su enlace inteligente. </p> </div> ) : ( <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5"> {tables.map((tbl) => { const tableUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/menu/${slug}?mesa=${tbl.table_number}`
              const isCopied = copiedTable === tbl.table_number

              return (
                <div
                  key={tbl.id}
                  className="bg-[#141416] border border-[#27272A] rounded-3xl p-5 flex flex-col justify-between shadow-xl space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider block">
                        Mesa Individual
                      </span>
                      <h2 className="text-2xl font-black text-white mt-0.5">
                        Mesa {tbl.table_number}
                      </h2>
                    </div>

                    <button
                      onClick={() => handleDeleteTable(tbl.id)}
                      className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition cursor-pointer"
                      title="Eliminar mesa"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>

                  <div className="bg-[#1B1B1E] border border-[#27272A] p-3 rounded-2xl space-y-1">
                    <span className="text-[10px] text-white/40 block font-mono">Enlace NFC / QR:</span>
                    <p className="text-xs font-mono text-amber-400 truncate">{tableUrl}</p>
                  </div>

                  <button
                    onClick={() => handleCopyLink(tbl.table_number)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      isCopied
                        ? 'bg-emerald-500 text-black'
                        : 'bg-[#27272A] hover:bg-[#3F3F46] text-white'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <FiCheck /> ¡Enlace Copiado!
                      </>
                    ) : (
                      <>
                        <FiCopy /> Copiar Link para QR/NFC
                      </>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}