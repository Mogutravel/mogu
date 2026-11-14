// app/menu/[slug]/layout.tsx
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }> | { slug: string };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const resolvedParams = await params;
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('slug', resolvedParams.slug)
    .single();

  if (!profile) return { title: 'MOGU | Menú Digital' };

  return {
    title: `${profile.full_name} | Menú Digital`,
    icons: profile.avatar_url ? [{ rel: 'icon', url: profile.avatar_url }] : [],
  };
}

export default async function MenuLayout({
  children,
  params,
}: LayoutProps) {
  const resolvedParams = await params;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, slug, full_name, avatar_url')
    .eq('slug', resolvedParams.slug)
    .single();

  if (!profile) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto shadow-xl relative font-sans">
      <main>{children}</main>
    </div>
  );
}