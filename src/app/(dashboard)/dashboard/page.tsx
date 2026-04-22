"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  formatCurrency,
  formatCurrencyAbbr,
  getTrayectos,
  getViaticos,
  getFlujo,
  getDocumentos,
  fmtFecha,
  estadoDocumento,
  isoWeekOfYear,
  currentMonthRange,
} from "@/lib/supabase/queries";
import {
  Navigation, Wallet, Clock, TrendingUp,
  AlertCircle, CheckCircle2, AlertTriangle,
} from "lucide-react";

// ── Tipos ────────────────────────────────────────────────────────────
type Trayecto = {
  id: string; fecha: string; origen: string; destino: string;
  km: number | null; valor: number | null; extras: number | null;
  estado: string; factura: string | null; semana: number;
};
type Viatico = {
  id: string; fecha: string; categoria: string;
  monto: number | null; semana: number;
};
type Flujo = {
  semana: number; ingresos: number | null; salidas: number | null; estado: string;
};
type Documento = {
  id: string; nombre: string; vencimiento: string | null;
};

// ── Chart SVG inline ─────────────────────────────────────────────────
function BarChart({ data }: { data: { semana: number; ingresos: number; gastos: number }[] }) {
  const W = 600; const H = 180; const PAD = 40; const BAR_GAP = 4;
  const max = Math.max(...data.flatMap((d) => [d.ingresos, d.gastos]), 1);
  const barW = Math.max(4, (W - PAD * 2) / data.length / 2 - BAR_GAP);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map((f) => {
        const y = PAD + (1 - f) * (H - PAD * 2);
        return (
          <g key={f}>
            <line x1={PAD} x2={W - PAD} y1={y} y2={y}
              stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
            <text x={PAD - 4} y={y + 4} textAnchor="end"
              fill="var(--text-tertiary)" fontSize={9}>
              {formatCurrencyAbbr(max * f)}
            </text>
          </g>
        );
      })}
      {/* Bars */}
      {data.map((d, i) => {
        const slotW = (W - PAD * 2) / data.length;
        const x0 = PAD + i * slotW + slotW / 2 - barW - BAR_GAP / 2;
        const iH = ((d.ingresos / max) * (H - PAD * 2));
        const gH = ((d.gastos / max) * (H - PAD * 2));
        return (
          <g key={d.semana}>
            <rect x={x0} y={PAD + (H - PAD * 2) - iH}
              width={barW} height={iH} rx={3}
              fill="var(--accent-green)" fillOpacity={0.8} />
            <rect x={x0 + barW + BAR_GAP} y={PAD + (H - PAD * 2) - gH}
              width={barW} height={gH} rx={3}
              fill="var(--accent-red)" fillOpacity={0.7} />
            <text x={x0 + barW} y={H - 8} textAnchor="middle"
              fill="var(--text-tertiary)" fontSize={9}>
              S{d.semana}
            </text>
          </g>
        );
      })}
      {/* Legend */}
      <rect x={W - PAD - 80} y={8} width={10} height={10} rx={2} fill="var(--accent-green)" fillOpacity={0.8} />
      <text x={W - PAD - 66} y={18} fill="var(--text-secondary)" fontSize={9}>Ingresos</text>
      <rect x={W - PAD - 30} y={8} width={10} height={10} rx={2} fill="var(--accent-red)" fillOpacity={0.7} />
      <text x={W - PAD - 16} y={18} fill="var(--text-secondary)" fontSize={9}>Gastos</text>
    </svg>
  );
}

// ── Page ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [trayectos, setTrayectos] = useState<Trayecto[]>([]);
  const [viaticos, setViaticos] = useState<Viatico[]>([]);
  const [flujo, setFlujo] = useState<Flujo[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;
      const { data: perfil } = await sb.from("cr_usuarios").select("rol").eq("id", user.id).single();
      if (perfil?.rol === "contratista") { router.replace("/contratista"); return; }
      const [t, v, f, d] = await Promise.all([
        getTrayectos(user.id),
        getViaticos(user.id),
        getFlujo(user.id),
        getDocumentos(user.id),
      ]);
      setTrayectos(t as Trayecto[]);
      setViaticos(v as Viatico[]);
      setFlujo(f as Flujo[]);
      setDocumentos(d as Documento[]);
      setLoading(false);
    })();
  }, []);

  const semanaActual = isoWeekOfYear(new Date());
  const { start, end } = currentMonthRange();

  const trayectosSemana = useMemo(
    () => trayectos.filter((t) => t.semana === semanaActual),
    [trayectos, semanaActual]
  );

  const ingresosMes = useMemo(
    () => trayectos
      .filter((t) => t.fecha >= start && t.fecha <= end)
      .reduce((s, t) => s + (t.valor ?? 0), 0),
    [trayectos, start, end]
  );

  const gastosMes = useMemo(
    () => viaticos
      .filter((v) => v.fecha >= start && v.fecha <= end)
      .reduce((s, v) => s + (v.monto ?? 0), 0),
    [viaticos, start, end]
  );

  const extrasMes = useMemo(
    () => trayectos
      .filter((t) => t.fecha >= start && t.fecha <= end)
      .reduce((s, t) => s + (t.extras ?? 0), 0),
    [trayectos, start, end]
  );

  // Chart: last 8 semanas from flujo
  const chartData = useMemo(() => {
    return flujo
      .slice(0, 8)
      .reverse()
      .map((f) => ({
        semana: f.semana,
        ingresos: f.ingresos ?? 0,
        gastos: f.salidas ?? 0,
      }));
  }, [flujo]);

  // Document alerts
  const docAlertas = useMemo(
    () => documentos
      .filter((d) => estadoDocumento(d.vencimiento) !== "vigente")
      .sort((a, b) => {
        const ea = estadoDocumento(a.vencimiento);
        const eb = estadoDocumento(b.vencimiento);
        if (ea === "vencido" && eb !== "vencido") return -1;
        if (eb === "vencido" && ea !== "vencido") return 1;
        return 0;
      }),
    [documentos]
  );

  const recientes = trayectos.slice(0, 5);

  const kpis = [
    {
      label: "Trayectos esta semana",
      value: trayectosSemana.length.toString(),
      icon: Navigation,
      color: "var(--accent-green)",
      sub: `Sem. ${semanaActual}`,
    },
    {
      label: "Ingresos del mes",
      value: formatCurrency(ingresosMes),
      icon: TrendingUp,
      color: "var(--accent-yellow)",
      sub: "Trayectos facturados",
    },
    {
      label: "Gastos del mes",
      value: formatCurrency(gastosMes),
      icon: Wallet,
      color: "var(--accent-red)",
      sub: "Viáticos registrados",
    },
    {
      label: "Horas extras mes",
      value: `${extrasMes}h`,
      icon: Clock,
      color: "var(--accent-blue)",
      sub: "Horas adicionales",
    },
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: 960, margin: "0 auto" }}>
      {/* KPIs */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 16,
        marginBottom: 28,
      }}>
        {kpis.map((k) => (
          <div key={k.label} className="glass-card" style={{ padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `${k.color}22`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <k.icon size={18} style={{ color: k.color }} />
              </div>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{k.label}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "Sora, sans-serif", color: k.color }}>
              {k.value}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="glass-card" style={{ padding: "20px 22px", marginBottom: 28 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
            Ingresos vs Gastos — últimas semanas
          </div>
          <BarChart data={chartData} />
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Alertas documentos */}
        <div className="glass-card" style={{ padding: "20px 22px" }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
            Alertas de documentos
          </div>
          {docAlertas.length === 0 ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--accent-green)" }}>
              <CheckCircle2 size={16} />
              <span style={{ fontSize: 14 }}>Todos los documentos vigentes</span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {docAlertas.map((d) => {
                const est = estadoDocumento(d.vencimiento);
                const color = est === "vencido" ? "var(--accent-red)" : "var(--accent-yellow)";
                const Icon = est === "vencido" ? AlertCircle : AlertTriangle;
                return (
                  <div key={d.id} style={{
                    display: "flex", gap: 10, alignItems: "center",
                    padding: "10px 12px",
                    background: est === "vencido" ? "var(--accent-red-dim)" : "var(--accent-yellow-dim)",
                    borderRadius: 10,
                    border: `1px solid ${color}33`,
                  }}>
                    <Icon size={15} style={{ color, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color }}>{d.nombre}</div>
                      <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                        {est === "vencido" ? "Vencido" : "Vence pronto"}{d.vencimiento ? ` · ${fmtFecha(d.vencimiento)}` : ""}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Trayectos recientes */}
        <div className="glass-card" style={{ padding: "20px 22px" }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
            Trayectos recientes
          </div>
          {recientes.length === 0 ? (
            <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>Sin trayectos registrados</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recientes.map((t) => (
                <div key={t.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "1px solid var(--glass-border)",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {t.origen} → {t.destino}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                      {fmtFecha(t.fecha)} · S{t.semana}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-green)" }}>
                      {formatCurrency(t.valor)}
                    </div>
                    <div style={{
                      fontSize: 10, padding: "2px 6px", borderRadius: 6,
                      background: t.estado === "pagado" ? "var(--accent-green-dim)" : "var(--accent-yellow-dim)",
                      color: t.estado === "pagado" ? "var(--accent-green)" : "var(--accent-yellow)",
                      display: "inline-block", marginTop: 2,
                    }}>
                      {t.estado}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .dash-grid-2 { grid-template-columns: 1fr !important; }
        }
        .spinner {
          width: 40px; height: 40px;
          border: 3px solid var(--glass-border);
          border-top-color: var(--accent-green);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
