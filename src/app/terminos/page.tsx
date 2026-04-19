import type { Metadata } from "next";
import Link from "next/link";
import { Route } from "lucide-react";

export const metadata: Metadata = {
  title: "Términos de Servicio — CuentaRuta",
  description: "Términos y condiciones de uso de la plataforma CuentaRuta.",
};

export default function Terminos() {
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
        <div style={{ marginBottom: 40 }}>
          <span style={{ display: "inline-block", background: "var(--accent-yellow-dim)", border: "1px solid rgba(255,214,0,0.2)", borderRadius: 100, padding: "5px 14px", fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-yellow)", marginBottom: 16 }}>
            Legal
          </span>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
            Términos de Servicio
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.85rem" }}>
            Última actualización: 19 de abril de 2026
          </p>
        </div>

        <div className="divider" />

        <div className="prose">
          <p>
            Al usar CuentaRuta aceptas los siguientes términos. Léelos con atención.
            Si no estás de acuerdo, no uses el servicio.
          </p>

          <h2>1. El servicio</h2>
          <p>
            CuentaRuta es una plataforma SaaS para conductores contratistas que permite
            registrar trayectos, viáticos, documentos y generar reportes de liquidación.
            El servicio se presta de forma digital y puede incluir versiones web y PWA.
          </p>

          <h2>2. Registro y cuenta</h2>
          <ul>
            <li>Debes ser mayor de edad para crear una cuenta.</li>
            <li>Eres responsable de mantener tus credenciales seguras.</li>
            <li>No puedes compartir tu cuenta con terceros no autorizados.</li>
            <li>CuentaRuta puede suspender cuentas que violen estos términos.</li>
          </ul>

          <h2>3. Uso aceptable</h2>
          <p>
            El servicio es para uso profesional relacionado con el registro de actividad
            laboral de conductores. Está prohibido:
          </p>
          <ul>
            <li>Usar la plataforma para actividades ilegales o fraudulentas.</li>
            <li>Intentar acceder a datos de otros usuarios.</li>
            <li>Realizar ingeniería inversa o copiar el sistema.</li>
          </ul>

          <h2>4. Propiedad intelectual</h2>
          <p>
            Todo el software, diseño y contenido de CuentaRuta es propiedad de sus
            desarrolladores. Los datos que el usuario registra son de su propiedad.
            CuentaRuta los almacena para prestar el servicio y no los vende a terceros.
          </p>

          <h2>5. Disponibilidad</h2>
          <p>
            Nos esforzamos por mantener el servicio disponible. Sin embargo, no garantizamos
            disponibilidad ininterrumpida. Podemos realizar mantenimientos programados
            con aviso previo razonable.
          </p>

          <h2>6. Limitación de responsabilidad</h2>
          <p>
            CuentaRuta no se hace responsable por pérdidas económicas derivadas del uso
            o la imposibilidad de uso del servicio, más allá del monto pagado en el
            ciclo de facturación vigente.
          </p>

          <h2>7. Cambios a los términos</h2>
          <p>
            Podemos actualizar estos términos. Te notificaremos por correo con al menos
            15 días de anticipación ante cambios materiales. Continuar usando el servicio
            después del aviso implica aceptación.
          </p>

          <h2>8. Contacto</h2>
          <p>
            Consultas sobre estos términos:{" "}
            <a href="mailto:soporte@cuentaruta.com">soporte@cuentaruta.com</a>
          </p>
        </div>

        <div className="divider" />

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <Link href="/privacidad" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textDecoration: "none", fontWeight: 500 }}>
            Política de privacidad →
          </Link>
          <Link href="/reembolsos" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textDecoration: "none", fontWeight: 500 }}>
            Política de reembolsos →
          </Link>
        </div>
      </main>
    </>
  );
}
