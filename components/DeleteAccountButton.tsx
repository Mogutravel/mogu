'use client'

import { useState } from 'react'
import { deleteUserAccount } from '@/app/[slug]/actions' // Ajusta la ruta según tu estructura
import { useRouter } from 'next/navigation'

interface Props {
  userId: string
  slug: string
}

export default function DeleteAccountButton({ userId, slug }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    const res = await deleteUserAccount(userId, slug)

    if (res.success) {
      router.push('/') // Redirigir al inicio o página de despedida
      router.refresh()
    } else {
      setError(res.error || 'Ocurrió un error inesperado.')
      setLoading(false)
      setIsOpen(false)
    }
  }

  return (
    <div className="mt-12 mb-8 text-center">
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs text-red-400/70 hover:text-red-400 transition-colors underline underline-offset-4"
      >
        Eliminar mi cuenta y todos mis datos
      </button>

      {/* Modal de confirmación */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#141210] border border-red-500/20 rounded-2xl max-w-md w-full p-6 text-left shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">
              ¿Eliminar cuenta permanentemente?
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Esta acción no se puede deshacer. Se eliminarán tu perfil, tus enlaces y tus accesos de autenticación de forma definitiva conforme a las normativas de privacidad.
            </p>

            {error && (
              <p className="text-xs text-red-400 bg-red-950/30 p-3 rounded-lg mb-4">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="px-4 py-2 text-xs font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors flex items-center gap-2"
              >
                {loading ? 'Eliminando...' : 'Sí, eliminar todo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}