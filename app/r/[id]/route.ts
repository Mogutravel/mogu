import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { esBot, dispositivo } from "@/lib/track";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const inicio = new URL("/", req.url);

  const { data: link } = await supabaseAdmin
    .from("links")
    .select("id, url, business_id")
    .eq("id", id)
    .maybeSingle();

  // Solo se redirige a enlaces guardados y con protocolos seguros
  if (!link || !/^(https?:|tel:|mailto:)/i.test(link.url)) {
    return NextResponse.redirect(inicio);
  }

  const ua = req.headers.get("user-agent") ?? "";
  if (!esBot(ua)) {
    await supabaseAdmin.from("events").insert({
      business_id: link.business_id,
      link_id: link.id,
      type: "click",
      device: dispositivo(ua),
    });
  }

  return NextResponse.redirect(link.url);
}
