"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Notif {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const sb = createClient();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifs.filter(n => !n.leida).length;

  async function loadNotifs() {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    const { data } = await sb
      .from("cr_notificaciones")
      .select("id, tipo, titulo, mensaje, leida, created_at")
      .eq("usuario_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setNotifs((data ?? []) as Notif[]);
  }

  useEffect(() => {
    loadNotifs();

    let channel: ReturnType<typeof sb.channel> | null = null;
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      channel = sb
        .channel("notif-bell")
        .on("postgres_changes", {
          event: "INSERT",
          schema: "public",
          table: "cr_notificaciones",
          filter: `usuario_id=eq.${user.id}`,
        }, () => loadNotifs())
        .subscribe();
    });

    return () => { channel?.unsubscribe(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function markAllRead() {
    const ids = notifs.filter(n => !n.leida).map(n => n.id);
    if (!ids.length) return;
    await sb.from("cr_notificaciones").update({ leida: true }).in("id", ids);
    setNotifs(prev => prev.map(n => ({ ...n, leida: true })));
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => { setOpen(o => !o); if (!open && unread > 0) markAllRead(); }}
        style={{
          width: 40,
          height: 40,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 10,
          color: "rgba(255,255,255,0.8)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
        aria-label="Notificaciones"
      >
        <Bell size={18} strokeWidth={1.5} />
        {unread > 0 && (
          <span style={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 8,
            height: 8,
            background: "#FF4444",
            borderRadius: 99,
            border: "2px solid #080C18",
          }} />
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          width: 320,
          background: "#0F1525",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 14,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          zIndex: 999,
          overflow: "hidden",
        }}>
          <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ color: "#fff", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 14, margin: 0 }}>Notificaciones</p>
            {unread > 0 && (
              <button onClick={markAllRead} style={{ background: "none", border: "none", color: "#FFD600", fontFamily: "DM Sans, sans-serif", fontSize: 12, cursor: "pointer" }}>
                Marcar todo como leído
              </button>
            )}
          </div>
          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            {notifs.length === 0 ? (
              <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "DM Sans, sans-serif", fontSize: 13, textAlign: "center", padding: "24px 16px" }}>
                Sin notificaciones
              </p>
            ) : (
              notifs.map(n => (
                <div key={n.id} style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  background: n.leida ? "transparent" : "rgba(255,214,0,0.04)",
                }}>
                  <p style={{ color: "#fff", fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 13, margin: "0 0 2px" }}>{n.titulo}</p>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontFamily: "DM Sans, sans-serif", fontSize: 12, margin: "0 0 4px" }}>{n.mensaje}</p>
                  <p style={{ color: "rgba(255,255,255,0.25)", fontFamily: "DM Sans, sans-serif", fontSize: 11, margin: 0 }}>
                    {new Date(n.created_at).toLocaleDateString("es-CO")}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
