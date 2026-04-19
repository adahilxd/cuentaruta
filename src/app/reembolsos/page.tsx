import type { Metadata } from "next";
import Link from "next/link";
import { Route } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Reembolsos — CuentaRuta",
  description: "Conoce nuestra política de reembolsos y cancelaciones.",
};

export default function Reembolsos() {
  return (
    <>
      <style>{`
        body { background: var(--bg-base); color: var(--text-primary); }
        .prose h2 {
          font-family: 'Sora', sans-serif;
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 2rem 0 0.75rem;
          letter-spacing: -0.01em;
        }
        .prose p, .prose li {
          color: var(--text-secondary);
          font-size: 0.97rem;
          line-height: 1.75;
        }
        .prose ul {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .prose ul li::before {
          content: "·";
          color: var(--accent-yellow);
          font-weight: 700;
          margin-right: 10px;
        }
        .prose a {
          color: var(--accent-yellow);
          text-decoration: none;
          font-weight: 600;
        }
        .prose a:hover { text-decoration: underline; }
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--glass-border), transparent);
          margin: 2rem 0;
        }
      `}</style>

      {/* Navbar minimal */}
      <nav style={{ borderBottom: "1px solid var(--glass-border)", background: "rgba(8,12,24,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-yellow-dim)", border: "1px solid rgba(255,214,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Route size={16} color="var(--accent-yellow)" strokeWidth={1.5} />
            </div>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>CuentaRuta</span>
          </Link>
          <Link href="/" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textDecoration: "none", fontWeight: 500 }}>
            ← Volver al inicio
          </Link>
        </div>
      </nav>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "56px 20px 96px" }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <span style={{ display: "inline-block", background: "var(--accent-yellow-dim)", border: "1px solid rgba(255,214,0,0.2)", borderRadius: 100, padding: "5px 14px", fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-yellow)", marginBottom: 16 }}>
            Legal
          </span>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
            Política de Reembolsos
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.85rem" }}>
            Última actualización: 19 de abril de 2026
          </p>
        </div>

        <div className="divider" />

        <div className="prose">
          <p>
            En CuentaRuta buscamos ofrecer claridad en nuestros cobros y suscripciones.
            Esta política aplica a todos los planes disponibles en la plataforma.
          </p>

          <h2>1. Suscripciones</h2>
          <p>
            Nuestros servicios se ofrecen bajo un modelo de suscripción mensual o anual,
            según el plan seleccionado al momento del registro.
          </p>

          <h2>2. Período de prueba</h2>
          <p>
            Todos los planes incluyen un período de prueba gratuito de 14 días.
            Durante ese tiempo no se realizará ningún cobro. No se requiere tarjeta de crédito
            para iniciar la prueba.
          </p>

          <h2>3. Reembolsos</h2>
          <ul>
            <li>No ofrecemos reembolsos por períodos ya facturados.</li>
            <li>Una vez realizado el pago, el usuario mantiene acceso completo a la plataforma hasta el final del ciclo de facturación vigente.</li>
          </ul>

          <h2>4. Cancelaciones</h2>
          <p>
            Puedes cancelar tu suscripción en cualquier momento desde tu panel de configuración,
            antes del siguiente ciclo de facturación, para evitar nuevos cargos.
            La cancelación es inmediata y no genera penalidades.
          </p>

          <h2>5. Casos excepcionales</h2>
          <p>Evaluaremos reembolsos en los siguientes casos:</p>
          <ul>
            <li>Errores de facturación atribuibles a CuentaRuta.</li>
            <li>Problemas técnicos graves que hayan impedido el uso del servicio de forma sostenida.</li>
          </ul>
          <p>
            Cada caso se evalúa individualmente. Para solicitarlo, comunícate con soporte
            dentro de los 7 días hábiles siguientes al cobro en cuestión.
          </p>

          <h2>6. Contacto</h2>
          <p>
            Para temas relacionados con pagos o reembolsos escríbenos a{" "}
            <a href="mailto:soporte@cuentaruta.com">soporte@cuentaruta.com</a>{" "}
            o directamente por{" "}
            <a href="https://wa.me/573000000000" target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            .
          </p>
        </div>

        <div className="divider" />

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <Link href="/terminos" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textDecoration: "none", fontWeight: 500 }}
            onMouseEnter={undefined}>
            Términos de servicio →
          </Link>
          <Link href="/privacidad" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textDecoration: "none", fontWeight: 500 }}>
            Política de privacidad →
          </Link>
        </div>
      </main>
    </>
  );
}
