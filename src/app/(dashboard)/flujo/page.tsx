"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  getTrayectos, getViaticos, getFlujo, formatCurrency, fmtFecha,
} from "@/lib/supabase/queries";
import { CalendarDays, TrendingUp } from "lucide-react";

type FlujoRow = {
  semana: number;
  fecha_salida: string | null;
  fecha_ingreso: string | null;
  ingresos: number | null;
  salidas: number | null;
  estado: string;
};

function EstadoBadge({ estado }: { estado: string }) {
  const colors: Record<string, { bg: string; fg: string }> = {
    pagado:    { bg: "var(--accent-green-dim)",  fg: "var(--accent-green)" },
    pendiente: { bg: "var(--accent-yellow-dim)", fg: "var(--accent-yellow)" },
  };
  const c = colors[estado] ?? colors.pendiente;
  return (
    <span style={{
      padding: "3px 9px", borderRadius: 8, fontSize: 11, fontWeight: 600,
      background: c.bg, color: c.fg,
    }}>
      {estado}
    </span>
  );
}

export default function FlujoPage() {
  const [flujo, setFlujo] = useState<FlujoRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;
      const data = await getFlujo(user.id);
      setFlujo(data as FlujoRow[]);
      setLoading(false);
    })();
  }, []);

  const totales = useMemo(() => ({
    ingresos: flujo.reduce((s, r) => s + (r.ingresos ?? 0), 0),
    salidas:  flujo.reduce((s, r) => s + (r.salidas ?? 0), 0),
  }), [flujo]);

  const utilidad = totales.ingresos - totales.salidas;

  return (
    <div style={{ padding: "24px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "Sora, sans-serif", fontSize: 22, fontWeight: 700 }}>Flujo Semanal</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>
          Resumen de ingresos y gastos por semana de operación
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total ingresos",  value: totales.ingresos, color: "var(--accent-green)" },
          { label: "Total salidas",   value: totales.salidas,  color: "var(--accent-red)" },
          { label: "Utilidad neta",   value: utilidad,         color: utilidad >= 0 ? "var(--accent-green)" : "var(--accent-red)" },
        ].map((k) => (
          <div key={k.label} className="glass-card" style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>{k.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "Sora, sans-serif", color: k.color }}>
              {formatCurrency(k.value)}
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-secondary)" }}>Cargando…</div>
      ) : flujo.length === 0 ? (
        <div className="glass-card" style={{ padding: "48px 24px", textAlign: "center" }}>
          <CalendarDays size={32} style={{ color: "var(--text-tertiary)", margin: "0 auto 12px" }} />
          <p style={{ color: "var(--text-secondary)" }}>Sin semanas registradas</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="flujo-desktop">
            <div className="glass-card" style={{ overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
                    {["Sem.", "Fecha salida", "Fecha ingreso", "Ingresos", "Salidas", "Utilidad", "Estado"].map((h) => (
                      <th key={h} style={{
                        padding: "12px 16px", textAlign: "left",
                        fontSize: 12, fontWeight: 600, color: "var(--text-tertiary)",
                        whiteSpace: "nowrap",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {flujo.map((r) => {
                    const util = (r.ingresos ?? 0) - (r.salidas ?? 0);
                    return (
                      <tr key={r.semana} style={{ borderBottom: "1px solid var(--glass-border)" }}
                        className="flujo-row">
                        <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 700, color: "var(--accent-green)" }}>
                          S{r.semana}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)" }}>
                          {r.fecha_salida ? fmtFecha(r.fecha_salida) : "—"}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)" }}>
                          {r.fecha_ingreso ? fmtFecha(r.fecha_ingreso) : "—"}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "var(--accent-green)", whiteSpace: "nowrap" }}>
                          {formatCurrency(r.ingresos)}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "var(--accent-red)", whiteSpace: "nowrap" }}>
                          {formatCurrency(r.salidas)}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap",
                          color: util >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
                          {formatCurrency(util)}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <EstadoBadge estado={r.estado} />
                        </td>
                      </tr>
                    );
                  })}
                  {/* Totals row */}
                  <tr style={{ borderTop: "2px solid var(--glass-border-hover)", background: "var(--glass-bg)" }}>
                    <td colSpan={3} style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700 }}>Total</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "var(--accent-green)", whiteSpace: "nowrap" }}>
                      {formatCurrency(totales.ingresos)}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "var(--accent-red)", whiteSpace: "nowrap" }}>
                      {formatCurrency(totales.salidas)}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap",
                      color: utilidad >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
                      {formatCurrency(utilidad)}
                    </td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="flujo-mobile" style={{ display: "none", flexDirection: "column", gap: 10 }}>
            {flujo.map((r) => {
              const util = (r.ingresos ?? 0) - (r.salidas ?? 0);
              return (
                <div key={r.semana} className="glass-card" style={{ padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--accent-green)" }}>
                      Semana {r.semana}
                    </span>
                    <EstadoBadge estado={r.estado} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Ingresos</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent-green)" }}>
                        {formatCurrency(r.ingresos)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Salidas</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent-red)" }}>
                        {formatCurrency(r.salidas)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Utilidad</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: util >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
                        {formatCurrency(util)}
                      </div>
                    </div>
                    {(r.fecha_salida || r.fecha_ingreso) && (
                      <div>
                        <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Período</div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                          {r.fecha_salida ? fmtFecha(r.fecha_salida) : "?"} → {r.fecha_ingreso ? fmtFecha(r.fecha_ingreso) : "?"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <style>{`
        .flujo-row:hover { background: var(--glass-bg); }
        @media (max-width: 768px) {
          .flujo-desktop { display: none; }
          .flujo-mobile  { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
