'use client'

import { useParams } from 'next/navigation'
import LoyaltyPassClient from '@/components/loyalty/LoyaltyPassClient'

export default function CatalogoLoyaltyPassPage() {
  const params = useParams()
  const slug = params?.slug as string

  return <LoyaltyPassClient slug={slug} sourceType="catalogo" />
}