'use client'

import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { supabase } from '@/lib/supabase'

export interface LinkItem {
  id: string
  title: string
  url: string
  emoji?: string
  position: number
}

interface Props {
  initialLinks: LinkItem[]
  onLinksChange?: (updatedLinks: LinkItem[]) => void
}

export default function LinksManager({ initialLinks, onLinksChange }: Props) {
  const [links, setLinks] = useState<LinkItem[]>(initialLinks)
  const [isSaving, setIsSaving] = useState(false)

  // Esta función se activa cuando el usuario termina de arrastrar un enlace
  const handleOnDragEnd = async (result: DropResult) => {
    // Si se soltó fuera de la lista, no hace nada
    if (!result.destination) return

    // 1. Reorganizar el array localmente
    const items = Array.from(links)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // 2. Reasignar la propiedad position según el nuevo índice (1, 2, 3...)
    const updatedLinks = items.map((item, index) => ({
      ...item,
      position: index + 1,
    }))

    // Actualizar el estado local para respuesta visual inmediata
    setLinks(updatedLinks)
    if (onLinksChange) onLinksChange(updatedLinks)

    // 3. Persistir los cambios en Supabase
    setIsSaving(true)
    try {
      const updates = updatedLinks.map((link) =>
        supabase
          .from('links')
          .update({ position: link.position })
          .eq('id', link.id)
      )

      await Promise.all(updates)
    } catch (error) {
      console.error('Error al actualizar posiciones en Supabase:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Función para eliminar un enlace
  const handleDelete = async (id: string) => {
    const updated = links.filter((item) => item.id !== id)
    setLinks(updated)
    if (onLinksChange) onLinksChange(updated)

    await supabase.from('links').delete().eq('id', id)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-neutral-400 pb-1">
        <span>Mantén presionado <b>::</b> y arrastra para reordenar</span>
        {isSaving && <span className="text-emerald-400 font-medium animate-pulse">Guardando orden...</span>}
      </div>

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="interactive-links">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3"
            >
              {links.map((link, index) => (
                <Draggable key={link.id} draggableId={link.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-center justify-between p-4 rounded-2xl bg-[#121212] border transition-all ${
                        snapshot.isDragging
                          ? 'border-emerald-500/80 bg-[#1A1A1A] shadow-2xl scale-[1.02] z-50'
                          : 'border-neutral-800/80 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {/* ICONO DE AGARRE (Grip Handle) */}
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-500 hover:text-neutral-300 transition"
                          title="Arrastrar para mover"
                        >
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M9 7.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm9-9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                          </svg>
                        </div>

                        {/* EMOJI O ICONO */}
                        <div className="w-9 h-9 rounded-xl bg-neutral-800/80 border border-neutral-700/50 flex items-center justify-center text-base flex-shrink-0">
                          {link.emoji || '🔗'}
                        </div>

                        {/* DETALLES DEL ENLACE */}
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-bold text-white truncate">{link.title}</h4>
                          <p className="text-[10px] text-neutral-400 truncate">{link.url}</p>
                        </div>
                      </div>

                      {/* BOTÓN DE BORRAR */}
                      <button
                        type="button"
                        onClick={() => handleDelete(link.id)}
                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[11px] font-bold rounded-xl transition cursor-pointer"
                      >
                        Borrar
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}