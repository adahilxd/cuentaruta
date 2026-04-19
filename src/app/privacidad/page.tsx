import type { Metadata } from "next";
import Link from "next/link";
import { Route } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidad — CuentaRuta",
  description: "Cómo recopilamos, usamos y protegemos tus datos en CuentaRuta.",
};

export default function Privacidad() {
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
            Política de Privacidad
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.85rem" }}>
            Última actualización: 19 de abril de 2026
          </p>
        </div>

        <div className="divider" />

        <div className="prose">
          <p>
            Tu privacidad es importante para nosotros. Esta política explica qué datos
            recopilamos, por qué y cómo los protegemos.
          </p>

          <h2>1. Datos que recopilamos</h2>
          <p>Al usar CuentaRuta recopilamos:</p>
          <ul>
            <li>Datos de registro: nombre, correo electrónico y contraseña.</li>
            <li>Datos de uso: trayectos, viáticos, documentos y reportes que el usuario registra.</li>
            <li>Datos técnicos: dirección IP, tipo de dispositivo y navegador, para mejorar el servicio.</li>
            <li>Datos de pago: procesados por un proveedor externo; CuentaRuta no almacena datos de tarjetas.</li>
          </ul>

          <h2>2. Cómo usamos los datos</h2>
          <ul>
            <li>Para prestar y mejorar el servicio.</li>
            <li>Para enviarte notificaciones relevantes (alertas de documentos, facturas).</li>
            <li>Para soporte técnico cuando lo solicites.</li>
            <li>No vendemos ni compartimos tus datos con terceros con fines comerciales.</li>
          </ul>

          <h2>3. Almacenamiento y seguridad</h2>
          <p>
            Los datos se almacenan en servidores seguros con cifrado en tránsito (HTTPS)
            y en reposo. Aplicamos controles de acceso para que solo personal autorizado
            pueda acceder a información sensible.
          </p>

          <h2>4. Tus derechos</h2>
          <p>Tienes derecho a:</p>
          <ul>
            <li>Acceder a los datos que tenemos sobre ti.</li>
            <li>Solicitar corrección de datos incorrectos.</li>
            <li>Solicitar la eliminación de tu cuenta y datos asociados.</li>
            <li>Exportar tus datos en formato legible.</li>
          </ul>
          <p>
            Para ejercer cualquiera de estos derechos escríbenos a{" "}
            <a href="mailto:soporte@cuentaruta.com">soporte@cuentaruta.com</a>.
          </p>

          <h2>5. Cookies</h2>
          <p>
            Usamos cookies estrictamente necesarias para el funcionamiento de la sesión.
            No usamos cookies de rastreo publicitario ni compartimos datos con redes
            de publicidad.
          </p>

          <h2>6. Retención de datos</h2>
          <p>
            Conservamos tus datos mientras tu cuenta esté activa. Al eliminar tu cuenta,
            los datos se borran de nuestros sistemas en un plazo máximo de 30 días,
            salvo obligación legal de conservarlos.
          </p>

          <h2>7. Cambios a esta política</h2>
          <p>
            Si realizamos cambios materiales te notificaremos por correo con al menos
            15 días de anticipación.
          </p>

          <h2>8. Contacto</h2>
          <p>
            Preguntas sobre privacidad:{" "}
            <a href="mailto:soporte@cuentaruta.com">soporte@cuentaruta.com</a>
          </p>
        </div>

        <div className="divider" />

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <Link href="/terminos" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textDecoration: "none", fontWeight: 500 }}>
            Términos de servicio →
          </Link>
          <Link href="/reembolsos" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textDecoration: "none", fontWeight: 500 }}>
            Política de reembolsos →
          </Link>
        </div>
      </main>
    </>
  );
}
