"use client";

import { useState, useEffect } from "react";
import {
  Route,
  Navigation,
  Wallet,
  FileWarning,
  BarChart2,
  Calculator,
  Smartphone,
  Check,
  X,
  ChevronDown,
  MessageCircle,
  Menu,
  ArrowRight,
  Wifi,
  Clock,
  Shield,
  Star,
  Users,
  MapPin,
} from "lucide-react";

// ─── RESPONSIVE STYLES ────────────────────────────────────────────────────────

function ResponsiveStyles() {
  return (
    <style>{`
      .cards-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
      }
      .features-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
      }
      .steps-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 28px;
      }
      .pricing-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 28px;
        max-width: 480px;
        margin: 0 auto;
      }
      .testimonials-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
      }
      .objections-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
      }
      #mobile-menu-btn { display: none !important; }
      #mobile-menu { display: none; }

      @media (min-width: 640px) {
        .steps-grid { grid-template-columns: repeat(3, 1fr); }
        .cards-grid { grid-template-columns: repeat(3, 1fr); }
        .objections-grid { grid-template-columns: repeat(2, 1fr); }
      }

      @media (min-width: 768px) {
        .features-grid { grid-template-columns: repeat(2, 1fr); }
        .pricing-grid {
          grid-template-columns: repeat(2, 1fr);
          max-width: 900px;
        }
        .testimonials-grid { grid-template-columns: repeat(2, 1fr); }
        #contractors-grid { grid-template-columns: 1fr 1fr !important; }
      }

      @media (min-width: 1024px) {
        #desktop-nav { display: flex !important; }
        #mobile-menu-btn { display: none !important; }
        #hero-grid { grid-template-columns: 55% 45% !important; }
        #hero-text { text-align: left !important; }
        #hero-text .hero-badge { justify-content: flex-start !important; }
        #hero-text .hero-pills { justify-content: flex-start !important; }
        #hero-buttons { flex-direction: row !important; }
        #hero-buttons a { width: auto !important; }
        .features-grid { grid-template-columns: repeat(3, 1fr); }
      }

      @media (max-width: 1023px) {
        #desktop-nav { display: none !important; }
        #mobile-menu-btn { display: flex !important; }
      }

      a, button { cursor: pointer !important; }

      *:focus-visible {
        outline: 2px solid var(--accent-yellow);
        outline-offset: 3px;
      }

      .stat-card:hover {
        border-color: var(--glass-border-hover) !important;
      }

      .objection-card:hover {
        border-color: var(--glass-border-hover) !important;
        transform: translateY(-1px);
      }
    `}</style>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Cómo funciona", href: "#como-funciona" },
    { label: "Características", href: "#caracteristicas" },
    { label: "Precios", href: "#precios" },
    { label: "Para Contratistas", href: "#contratistas" },
  ];

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: scrolled ? "rgba(8,12,24,0.95)" : "rgba(8,12,24,0.6)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: "1px solid var(--glass-border)",
        transition: "background 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 20px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "var(--accent-yellow-dim)",
              border: "1px solid rgba(255,214,0,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Route size={18} color="var(--accent-yellow)" strokeWidth={1.5} />
          </div>
          <span className="font-display" style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            CuentaRuta
          </span>
        </a>

        <div id="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500, transition: "color 0.2s" }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--text-primary)")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--text-secondary)")}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/registro" className="btn-primary" style={{ padding: "10px 20px", minHeight: 40, fontSize: "0.9rem" }}>
            Probar gratis
          </a>
          <button
            id="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: "transparent", border: "none", color: "var(--text-primary)", padding: 8 }}
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="mobile-menu" style={{ display: "block", background: "var(--bg-surface)", borderTop: "1px solid var(--glass-border)", padding: "8px 20px 16px" }}>
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{ display: "block", padding: "12px 0", color: "var(--text-secondary)", textDecoration: "none", fontSize: "1rem", fontWeight: 500, borderBottom: "1px solid var(--glass-border)" }}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

// ─── PHONE MOCKUP ─────────────────────────────────────────────────────────────

function PhoneMockup() {
  const svgLine = "M10,60 C30,45 50,72 70,52 C90,32 110,62 130,48 C150,34 170,56 190,44";
  return (
    <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,230,118,0.18) 0%, transparent 70%)", filter: "blur(50px)", zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 1, width: 260, aspectRatio: "9 / 19.5", borderRadius: 40, border: "2px solid rgba(255,255,255,0.12)", background: "var(--bg-surface)", boxShadow: "0 0 0 6px rgba(255,255,255,0.03), 0 40px 80px rgba(0,0,0,0.6), var(--glow-green)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ width: 90, height: 28, background: "var(--bg-base)", borderRadius: "0 0 20px 20px", margin: "0 auto", flexShrink: 0 }} />
        <div style={{ flex: 1, padding: "12px 14px", overflowY: "hidden", display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <p style={{ fontSize: "0.62rem", color: "var(--text-secondary)" }}>Buenos días 👋</p>
            <p className="font-display" style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>Nelson R.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {[
              { value: "12", sub: "trayectos", color: "var(--accent-green)" },
              { value: "$840", sub: "ingresos USD", color: "var(--accent-yellow)" },
              { value: "$127", sub: "gastos", color: "var(--accent-red)" },
              { value: "8h", sub: "h. extras", color: "var(--accent-blue)" },
            ].map((k) => (
              <div key={k.sub} style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: 10, padding: "8px 10px" }}>
                <p className="font-display tabular-nums" style={{ fontSize: "1rem", fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.value}</p>
                <p style={{ fontSize: "0.58rem", color: "var(--text-tertiary)", marginTop: 2 }}>{k.sub}</p>
              </div>
            ))}
          </div>
          <div style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: 10, overflow: "hidden", height: 72 }}>
            <svg width="100%" height="72" viewBox="0 0 200 72" preserveAspectRatio="none">
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00E676" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#00E676" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`${svgLine} L190,72 L10,72 Z`} fill="url(#g)" />
              <path d={svgLine} fill="none" stroke="#00E676" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-green)", boxShadow: "0 0 6px var(--accent-green)", flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-primary)" }}>Ruta Norte</p>
                <p style={{ fontSize: "0.6rem", color: "var(--text-secondary)" }}>Hoy · 124 km</p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <p className="tabular-nums" style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--accent-green)" }}>$70 USD</p>
              <span style={{ display: "inline-block", fontSize: "0.55rem", fontWeight: 600, color: "var(--accent-green)", background: "var(--accent-green-dim)", borderRadius: 20, padding: "2px 6px", marginTop: 2 }}>✓ Pagado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section style={{ position: "relative", overflow: "hidden", padding: "72px 20px 80px", minHeight: "90vh", display: "flex", alignItems: "center" }}>
      <div style={{ position: "absolute", top: -100, right: -100, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,230,118,0.08) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -80, left: -120, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(68,136,255,0.06) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none" }} />
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        <defs>
          <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1" fill="rgba(255,255,255,0.06)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      <div id="hero-grid" style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr", gap: 56, alignItems: "center" }}>

        <div id="hero-text" className="animate-fade-in-up" style={{ textAlign: "center" }}>

          {/* Badge */}
          <div
            className="animate-pulse-badge hero-badge"
            style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--accent-green-dim)", border: "1px solid rgba(0,230,118,0.2)", borderRadius: 100, padding: "8px 16px" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-green)", display: "inline-block" }} />
              <span style={{ color: "var(--accent-green)", fontSize: "0.85rem", fontWeight: 600 }}>
                Disponible en toda Latinoamérica
              </span>
            </span>
          </div>

          {/* H1 */}
          <h1 className="font-display" style={{ fontSize: "clamp(2.4rem, 6vw, 4.2rem)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.03em", color: "var(--text-primary)", marginBottom: 24 }}>
            Deja de perder plata
            <br />
            controlando tu trabajo
            <br />
            <span style={{ color: "var(--accent-yellow)" }}>en Excel</span>
          </h1>

          {/* Subheadline */}
          <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", lineHeight: 1.65, maxWidth: 540, margin: "0 auto 36px" }}>
            Registra trayectos, viáticos y documentos desde el celular, genera reportes profesionales en segundos y{" "}
            <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>cobra lo que realmente trabajaste.</strong>
          </p>

          {/* CTAs */}
          <div id="hero-buttons" style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16, maxWidth: 420, margin: "0 auto 16px" }}>
            <a href="/registro" className="btn-primary" style={{ width: "100%", fontSize: "1.05rem" }}>
              Probar gratis 14 días
              <ArrowRight size={18} strokeWidth={1.5} />
            </a>
            <a
              href="#como-funciona"
              className="btn-outline"
              style={{ width: "100%" }}
              onClick={(e) => { e.preventDefault(); document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" }); }}
            >
              Ver cómo funciona →
            </a>
          </div>

          {/* Microcopy */}
          <p style={{ fontSize: "0.82rem", color: "var(--text-tertiary)", marginBottom: 36 }}>
            Sin tarjeta de crédito &nbsp;·&nbsp; Listo en 2 minutos &nbsp;·&nbsp; Cancela cuando quieras
          </p>

          {/* Pills sectoriales */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }} className="hero-pills">
            <p style={{ fontSize: "0.78rem", color: "var(--text-tertiary)", width: "100%", marginBottom: 4 }}>Conductores de:</p>
            {["⚡ Eléctricas", "🛢 Oil & Gas", "📡 Telecomunicaciones", "🏗 Construcción"].map((s) => (
              <span key={s} style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: 100, padding: "6px 14px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>{s}</span>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}

// ─── PRUEBA SOCIAL ────────────────────────────────────────────────────────────

function SocialProof() {
  const stats = [
    { icon: Users, value: "+100", label: "conductores activos", color: "var(--accent-green)" },
    { icon: MapPin, value: "+4", label: "países en Latinoamérica", color: "var(--accent-yellow)" },
    { icon: Navigation, value: "+10.000", label: "trayectos registrados", color: "var(--accent-blue)" },
  ];

  const testimonials = [
    {
      quote: "Aquí va el testimonio de un conductor real cuando lo tengas. Enfocado en cuánto tiempo o dinero ahorra.",
      name: "Nombre del conductor",
      role: "Conductor independiente · Colombia",
      placeholder: true,
    },
    {
      quote: "Aquí va el testimonio de un contratista. Enfocado en el control de su equipo de conductores.",
      name: "Nombre del contratista",
      role: "Empresa contratista · Venezuela",
      placeholder: true,
    },
  ];

  return (
    <section style={{ padding: "64px 20px", background: "var(--bg-surface)", borderTop: "1px solid var(--glass-border)", borderBottom: "1px solid var(--glass-border)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Stats strip */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", marginBottom: 48 }}>
          {stats.map((s) => (
            <div
              key={s.label}
              className="stat-card"
              style={{ flex: "1 1 180px", maxWidth: 220, background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-md)", padding: "20px 24px", textAlign: "center", transition: "border-color 0.2s" }}
            >
              <s.icon size={22} color={s.color} strokeWidth={1.5} style={{ marginBottom: 8 }} />
              <p className="font-display tabular-nums" style={{ fontSize: "2rem", fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</p>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <p style={{ fontSize: "0.78rem", color: "var(--text-tertiary)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Lo que dicen los conductores
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="glass-card"
              style={{ padding: "24px", opacity: t.placeholder ? 0.45 : 1, border: t.placeholder ? "1px dashed var(--glass-border)" : "1px solid var(--glass-border)" }}
            >
              <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={14} color="var(--accent-yellow)" fill={t.placeholder ? "none" : "var(--accent-yellow)"} strokeWidth={1.5} />
                ))}
              </div>
              <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: 18, fontStyle: t.placeholder ? "italic" : "normal" }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-primary)" }}>{t.name}</p>
                <p style={{ fontSize: "0.78rem", color: "var(--text-tertiary)" }}>{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PROBLEMA → SOLUCIÓN ──────────────────────────────────────────────────────

function ProblemSolution() {
  const problems = [
    {
      title: "Perdiste cobros por no tener registros",
      desc: "La contratista te cuestiona los km o las horas y no tienes cómo demostrarlos. Ese dinero ya no vuelve.",
    },
    {
      title: "Te bloquearon por un documento vencido",
      desc: "El SOAT, la póliza o la tecnomecánica vencieron sin avisarte. Un día sin trabajar es plata perdida.",
    },
    {
      title: "Excel se te fue de las manos",
      desc: "Archivos sin nombre, fórmulas rotas, datos que ya no encuentras. Cada liquidación es una hora de estrés.",
    },
  ];

  const solutions = [
    {
      title: "Todo registrado, todo demostrable",
      desc: "Cada trayecto queda guardado con fecha, km, horas y fotos. Si te cuestionan algo, tienes la prueba en segundos.",
    },
    {
      title: "Te avisamos antes de que venza",
      desc: "30 días antes de cualquier vencimiento te mandamos una alerta. Tú solo renuevas, sin sobresaltos.",
    },
    {
      title: "Liquidación exacta sin fórmulas",
      desc: "Toca \"Generar reporte\" y listo. PDF profesional con todo calculado correctamente.",
    },
  ];

  return (
    <section style={{ padding: "80px 20px" }}>
      <div className="section-divider" style={{ marginBottom: 80 }} />
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
            ¿Así llevas tu trabajo hoy?
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: 480, margin: "0 auto" }}>
            Si alguna vez perdiste un cobro por no tener pruebas, esto es para ti.
          </p>
        </div>

        <div className="cards-grid" style={{ marginBottom: 36 }}>
          {problems.map((p) => (
            <div key={p.title} className="glass-card" style={{ padding: "24px", borderLeft: "3px solid var(--accent-red)" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent-red-dim)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <X size={18} color="var(--accent-red)" strokeWidth={1.5} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 8 }}>{p.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>{p.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <ChevronDown className="animate-bounce-arrow" size={28} color="var(--accent-green)" strokeWidth={1.5} style={{ display: "inline-block" }} />
        </div>

        <div className="cards-grid">
          {solutions.map((s) => (
            <div key={s.title} className="glass-card" style={{ padding: "24px", borderLeft: "3px solid var(--accent-green)" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent-green-dim)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <Check size={18} color="var(--accent-green)" strokeWidth={1.5} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 8 }}>{s.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CÓMO FUNCIONA ────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      num: "1",
      title: "Instala en tu celular",
      desc: "Sin pasar por tiendas. Abre el link, toca \"Agregar a inicio\" y ya tienes la app en tu pantalla.",
      detail: "10 segundos",
    },
    {
      num: "2",
      title: "Registra tu día",
      desc: "Al salir: foto del odómetro y destino. Al llegar: confirmas el trayecto. Gastos en segundos.",
      detail: "2 minutos por trayecto",
    },
    {
      num: "3",
      title: "Genera tu reporte",
      desc: "Un toque y recibes el PDF listo para enviar a la contratista. Profesional, completo, sin errores.",
      detail: "1 toque",
    },
  ];

  return (
    <section id="como-funciona" style={{ padding: "80px 20px", background: "var(--bg-surface)", borderTop: "1px solid var(--glass-border)", borderBottom: "1px solid var(--glass-border)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{ display: "inline-block", background: "var(--accent-yellow-dim)", border: "1px solid rgba(255,214,0,0.2)", borderRadius: 100, padding: "6px 16px", fontSize: "0.8rem", fontWeight: 600, color: "var(--accent-yellow)", marginBottom: 16 }}>
            Así de simple
          </span>
          <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
            En 3 pasos, tienes todo bajo control
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: 440, margin: "0 auto" }}>
            No necesitas saber de tecnología. Si puedes tomar una foto, puedes usar CuentaRuta.
          </p>
        </div>

        <div className="steps-grid">
          {steps.map((step, i) => (
            <div key={step.num} style={{ position: "relative", textAlign: "center" }}>
              {/* Connector line desktop */}
              {i < steps.length - 1 && (
                <div style={{ position: "absolute", top: 26, left: "calc(50% + 36px)", width: "calc(100% - 72px)", height: 1, background: "linear-gradient(90deg, var(--glass-border), transparent)", display: "none" }} className="connector" />
              )}
              <div style={{ width: 52, height: 52, borderRadius: "50%", border: "2px solid rgba(255,214,0,0.4)", background: "var(--accent-yellow-dim)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <span className="font-display" style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--accent-yellow)" }}>{step.num}</span>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 8 }}>{step.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6, marginBottom: 10 }}>{step.desc}</p>
              <span style={{ display: "inline-block", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: 100, padding: "4px 12px", fontSize: "0.75rem", color: "var(--accent-green)", fontWeight: 600 }}>
                ⚡ {step.detail}
              </span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 48 }}>
          <a href="/registro" className="btn-primary">
            Empezar ahora — es gratis
            <ArrowRight size={16} strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── CARACTERÍSTICAS ──────────────────────────────────────────────────────────

function Features() {
  const features = [
    {
      Icon: Smartphone,
      color: "var(--accent-blue)",
      dim: "var(--accent-blue-dim)",
      title: "Siempre contigo, con o sin señal",
      desc: "Registra trayectos y gastos aunque estés en zona sin internet. Cuando llegues a señal, todo se sincroniza solo.",
    },
    {
      Icon: Navigation,
      color: "var(--accent-green)",
      dim: "var(--accent-green-dim)",
      title: "Prueba cada km que recorriste",
      desc: "Foto del odómetro, hora de salida y llegada, ruta y estado. Nada queda sin respaldo.",
    },
    {
      Icon: Wallet,
      color: "var(--accent-yellow)",
      dim: "var(--accent-yellow-dim)",
      title: "Sabe exactamente en qué gastas",
      desc: "ACPM, peajes, alimentación y más clasificados automáticamente. Ves de un vistazo dónde se va el dinero.",
    },
    {
      Icon: FileWarning,
      color: "var(--accent-red)",
      dim: "var(--accent-red-dim)",
      title: "Nunca más un documento vencido",
      desc: "La app recuerda por ti. SOAT, póliza y licencia con alerta anticipada antes de que sea tarde.",
    },
    {
      Icon: BarChart2,
      color: "var(--accent-blue)",
      dim: "var(--accent-blue-dim)",
      title: "Tu negocio de un solo vistazo",
      desc: "Cuánto ganaste, cuánto gastaste y cómo va la semana. Todo en pantalla, sin buscar nada.",
    },
    {
      Icon: Calculator,
      color: "var(--accent-green)",
      dim: "var(--accent-green-dim)",
      title: "Cobra lo que te corresponde",
      desc: "Vacaciones, cesantías, prima e intereses calculados con tus datos reales. Sin errores, sin adivinar.",
    },
  ];

  return (
    <section id="caracteristicas" style={{ padding: "80px 20px" }}>
      <div className="section-divider" style={{ marginBottom: 80 }} />
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{ display: "inline-block", background: "var(--accent-yellow-dim)", border: "1px solid rgba(255,214,0,0.2)", borderRadius: 100, padding: "6px 16px", fontSize: "0.8rem", fontWeight: 600, color: "var(--accent-yellow)", marginBottom: 16 }}>
            Funcionalidades
          </span>
          <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
            Todo lo que necesitas,{" "}
            <span style={{ color: "var(--accent-yellow)" }}>nada que no</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: 440, margin: "0 auto" }}>
            Diseñado para usarse con una sola mano, en carretera, bajo el sol.
          </p>
        </div>

        <div className="features-grid">
          {features.map((f) => (
            <div key={f.title} className="glass-card" style={{ padding: "28px 24px" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: f.dim, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <f.Icon size={22} color={f.color} strokeWidth={1.5} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── OBJECIONES ───────────────────────────────────────────────────────────────

function Objections() {
  const items = [
    {
      icon: Smartphone,
      q: "\"No soy bueno con las apps\"",
      a: "Si sabes tomar una foto y mandar un WhatsApp, sabes usar CuentaRuta. No hay nada más difícil que eso.",
    },
    {
      icon: Wifi,
      q: "\"A veces no tengo internet\"",
      a: "No importa. La app funciona sin señal. Registras todo offline y se sincroniza cuando vuelve la conexión.",
    },
    {
      icon: Clock,
      q: "\"No tengo tiempo para aprender algo nuevo\"",
      a: "El primer registro lo haces en menos de 2 minutos. No hay cursos, no hay manuales.",
    },
    {
      icon: Shield,
      q: "\"¿Y mis datos están seguros?\"",
      a: "Sí. Todo se guarda en la nube, encriptado. Si pierdes el celular, no pierdes nada.",
    },
  ];

  return (
    <section style={{ padding: "80px 20px" }}>
      <div className="section-divider" style={{ marginBottom: 80 }} />
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
            &ldquo;¿Y si yo...?&rdquo;
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
            Estas son las dudas más comunes. Te las resolvemos de una.
          </p>
        </div>

        <div className="objections-grid">
          {items.map((item) => (
            <div
              key={item.q}
              className="glass-card objection-card"
              style={{ padding: "24px", transition: "border-color 0.2s, transform 0.2s" }}
            >
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--accent-green-dim)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <item.icon size={18} color="var(--accent-green)" strokeWidth={1.5} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.92rem", marginBottom: 6, color: "var(--text-primary)" }}>{item.q}</p>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6 }}>{item.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PWA / INSTALACIÓN ───────────────────────────────────────────────────────

function InstallSection() {
  const steps = [
    { num: "1", title: "Abre el link", desc: "Entra a cuentaruta.com desde Chrome o Safari en tu celular. Sin descargas previas." },
    { num: "2", title: "Toca \"Agregar a inicio\"", desc: "En iPhone: botón de compartir. En Android: los tres puntos. Un toque y listo." },
    { num: "3", title: "Ya la tienes", desc: "Aparece en tu pantalla como cualquier app. La abres y ya está tu cuenta esperándote." },
  ];

  return (
    <section style={{ padding: "80px 20px", background: "var(--bg-surface)", borderTop: "1px solid var(--glass-border)", borderBottom: "1px solid var(--glass-border)" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
        <span style={{ display: "inline-block", background: "var(--accent-green-dim)", border: "1px solid rgba(0,230,118,0.2)", borderRadius: 100, padding: "6px 16px", fontSize: "0.8rem", fontWeight: 600, color: "var(--accent-green)", marginBottom: 16 }}>
          Sin App Store · Sin Play Store
        </span>
        <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
          Se instala en{" "}
          <span style={{ color: "var(--accent-green)" }}>10 segundos</span>
          ,{" "}directo desde el navegador
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: 440, margin: "0 auto 48px" }}>
          No dependes de Apple ni de Google. Sin actualizaciones que interrumpan tu día. Siempre la versión más reciente, automáticamente.
        </p>

        <div className="steps-grid" style={{ marginBottom: 36 }}>
          {steps.map((step) => (
            <div key={step.num} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", border: "2px solid rgba(255,214,0,0.4)", background: "var(--accent-yellow-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="font-display" style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--accent-yellow)" }}>{step.num}</span>
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 6 }}>{step.title}</p>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.5 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--accent-green-dim)", border: "1px solid rgba(0,230,118,0.2)", borderRadius: 100, padding: "8px 18px", fontSize: "0.85rem", fontWeight: 600, color: "var(--accent-green)" }}>
          ✓ Funciona en cualquier celular Android o iPhone
        </span>
      </div>
    </section>
  );
}

// ─── PRECIOS ──────────────────────────────────────────────────────────────────

function Pricing() {
  const [annual, setAnnual] = useState(true);

  const conductorFeatures = [
    "Trayectos ilimitados",
    "Viáticos y documentos",
    "Dashboard con gráficas",
    "Calculadora de liquidación",
    "App móvil con modo offline",
    "Soporte por WhatsApp",
  ];
  const contratistaFeatures = [
    "Todo lo del plan Conductor",
    "Panel de todos tus conductores",
    "Aprobar o rechazar servicios",
    "Reportes PDF y Excel",
    "Panel de administración",
  ];
  const empresasFeatures = [
    "Todo lo del plan Contratista",
    "Panel multi-empresa",
    "Soporte prioritario dedicado",
    "Facturación centralizada",
  ];

  const conductorPrice = annual ? "$89" : "$9";
  const conductorSub = annual ? "≈ $7.40/mes · 2 meses gratis" : "Para conductores independientes";
  const conductorUnit = annual ? "USD/año" : "USD/mes";
  const conductorSavings = "AHORRA 18%";

  const contratistaPrice = annual ? "$250" : "$25";
  const contratistaSub = annual ? "≈ $20.80/mes · 2 meses gratis" : "Incluye hasta 3 conductores";
  const contratistaUnit = annual ? "USD/año" : "USD/mes";
  const contratistaSavings = "AHORRA 17%";

  const priceStyle: React.CSSProperties = {
    transition: "opacity 0.25s ease, transform 0.25s ease",
  };

  return (
    <section id="precios" style={{ padding: "80px 20px" }}>
      <div className="section-divider" style={{ marginBottom: 80 }} />
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <span style={{ display: "inline-block", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: 100, padding: "6px 16px", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 16 }}>
            Precios
          </span>
          <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
            Cuesta menos que un almuerzo
            <br />
            <span style={{ color: "var(--accent-yellow)" }}>a la semana</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
            Sin contratos. Sin letra chica. Si no te sirve, cancelas en un clic.
          </p>
        </div>

        {/* Toggle mensual / anual */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 48 }}>
          <div
            style={{
              display: "inline-grid",
              gridTemplateColumns: "1fr 1fr",
              background: "var(--bg-elevated)",
              border: "1px solid var(--glass-border)",
              borderRadius: 14,
              padding: 4,
              gap: 4,
              minWidth: 300,
            }}
          >
            <button
              type="button"
              onClick={() => setAnnual(false)}
              style={{
                background: !annual ? "#1E2640" : "transparent",
                border: !annual ? "1px solid var(--glass-border-hover)" : "1px solid transparent",
                borderRadius: 10,
                padding: "10px 0",
                fontSize: "0.9rem",
                fontWeight: !annual ? 700 : 500,
                color: !annual ? "var(--text-primary)" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.18s ease",
                textAlign: "center",
                userSelect: "none",
              }}
            >
              Mensual
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              style={{
                background: annual ? "#1E2640" : "transparent",
                border: annual ? "1px solid rgba(0,230,118,0.3)" : "1px solid transparent",
                borderRadius: 10,
                padding: "10px 0",
                fontSize: "0.9rem",
                fontWeight: annual ? 700 : 500,
                color: annual ? "var(--accent-green)" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.18s ease",
                textAlign: "center",
                userSelect: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                pointerEvents: "auto",
              }}
            >
              <span style={{ pointerEvents: "none" }}>Anual</span>
              <span
                style={{
                  background: "var(--accent-green-dim)",
                  border: "1px solid rgba(0,230,118,0.25)",
                  color: "var(--accent-green)",
                  borderRadius: 100,
                  padding: "1px 7px",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  lineHeight: 1.6,
                  pointerEvents: "none",
                }}
              >
                −2 meses
              </span>
            </button>
          </div>
        </div>

        {/* Cards principales */}
        <div className="pricing-grid" style={{ marginBottom: 24 }}>

          {/* Contratista — destacado */}
          <div className="glass-card" style={{ padding: "36px 28px", border: "1px solid rgba(255,214,0,0.3)", boxShadow: "var(--glow-yellow)", position: "relative", order: -1 }}>
            <span style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "var(--accent-yellow)", color: "#080C18", borderRadius: 100, padding: "4px 16px", fontSize: "0.75rem", fontWeight: 700, whiteSpace: "nowrap" }}>
              Más popular
            </span>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: 4, fontWeight: 600 }}>Contratista</p>
            <p style={{ color: "var(--text-tertiary)", fontSize: "0.8rem", marginBottom: 12, fontStyle: "italic" }}>
              Para quien maneja un equipo y necesita control total
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4, ...priceStyle }}>
              <span className="font-display tabular-nums" style={{ fontSize: "3.2rem", fontWeight: 800, color: "var(--accent-yellow)", letterSpacing: "-0.04em" }}>
                {contratistaPrice}
              </span>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{contratistaUnit}</span>
              {annual && (
                <span style={{ background: "var(--accent-green-dim)", border: "1px solid rgba(0,230,118,0.25)", color: "var(--accent-green)", borderRadius: 100, padding: "2px 8px", fontSize: "0.68rem", fontWeight: 700, marginLeft: 4 }}>
                  {contratistaSavings}
                </span>
              )}
            </div>
            <p style={{ color: annual ? "var(--accent-green)" : "var(--text-secondary)", fontSize: "0.82rem", fontWeight: annual ? 600 : 400, marginBottom: 4, ...priceStyle }}>
              {contratistaSub}
            </p>
            {!annual && (
              <p style={{ color: "var(--accent-yellow)", fontSize: "0.82rem", fontWeight: 600, marginBottom: 4 }}>
                $6 USD por conductor adicional
              </p>
            )}
            <p style={{ color: "var(--text-tertiary)", fontSize: "0.78rem", marginBottom: 24, fontStyle: "italic" }}>
              Un reporte mal hecho puede costarte más que toda la suscripción anual.
            </p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {contratistaFeatures.map((f) => (
                <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                  <Check size={16} color="var(--accent-green)" strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
                  {f}
                </li>
              ))}
            </ul>
            <a href="/registro" className="btn-primary" style={{ width: "100%" }}>
              Probar gratis 14 días
            </a>
          </div>

          {/* Conductor */}
          <div className="glass-card" style={{ padding: "36px 28px" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: 4, fontWeight: 600 }}>Conductor</p>
            <p style={{ color: "var(--text-tertiary)", fontSize: "0.8rem", marginBottom: 12, fontStyle: "italic" }}>
              Para el conductor que trabaja solo y quiere tener todo en orden
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4, ...priceStyle }}>
              <span className="font-display tabular-nums" style={{ fontSize: "3.2rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.04em" }}>
                {conductorPrice}
              </span>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{conductorUnit}</span>
              {annual && (
                <span style={{ background: "var(--accent-green-dim)", border: "1px solid rgba(0,230,118,0.25)", color: "var(--accent-green)", borderRadius: 100, padding: "2px 8px", fontSize: "0.68rem", fontWeight: 700, marginLeft: 4 }}>
                  {conductorSavings}
                </span>
              )}
            </div>
            <p style={{ color: annual ? "var(--accent-green)" : "var(--text-secondary)", fontSize: "0.82rem", fontWeight: annual ? 600 : 400, marginBottom: 24, ...priceStyle }}>
              {conductorSub}
            </p>
            <p style={{ color: "var(--text-tertiary)", fontSize: "0.78rem", marginBottom: 24, fontStyle: "italic" }}>
              Si cobras mal una sola vez al mes, ya perdiste más de $9.
            </p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {conductorFeatures.map((f) => (
                <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                  <Check size={16} color="var(--accent-green)" strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
                  {f}
                </li>
              ))}
            </ul>
            <a href="/registro" className="btn-outline" style={{ width: "100%" }}>
              Empezar gratis · Sin tarjeta
            </a>
          </div>
        </div>

        {/* Card Empresas — centrada */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{
              width: "100%",
              maxWidth: 480,
              background: "var(--glass-bg)",
              backdropFilter: "blur(16px) saturate(180%)",
              WebkitBackdropFilter: "blur(16px) saturate(180%)",
              border: "1px dashed rgba(255,255,255,0.14)",
              borderRadius: "var(--radius-md)",
              padding: "32px 28px",
              transition: "border-color 0.2s ease",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.28)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.14)")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ background: "var(--accent-blue-dim)", border: "1px solid rgba(68,136,255,0.2)", color: "var(--accent-blue)", borderRadius: 100, padding: "4px 12px", fontSize: "0.75rem", fontWeight: 700 }}>
                Para flotas grandes
              </span>
            </div>
            <h3 className="font-display" style={{ fontSize: "1.4rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>
              Empresas
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: 12 }}>
              Más de 10 conductores
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.65, marginBottom: 20 }}>
              Precios personalizados según el tamaño de tu flota. Incluye onboarding, soporte prioritario y facturación centralizada.
            </p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
              {empresasFeatures.map((f) => (
                <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.88rem", color: "var(--text-secondary)" }}>
                  <Check size={15} color="var(--accent-green)" strokeWidth={2} style={{ flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="https://wa.me/573000000000"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                minHeight: 52,
                background: "transparent",
                border: "1px solid rgba(255,214,0,0.45)",
                borderRadius: "var(--radius-sm)",
                color: "var(--accent-yellow)",
                fontWeight: 700,
                fontSize: "1rem",
                fontFamily: "'DM Sans', sans-serif",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--accent-yellow-dim)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,214,0,0.7)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,214,0,0.45)";
              }}
            >
              <MessageCircle size={16} strokeWidth={1.5} />
              Contactar ventas
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}

// ─── PARA CONTRATISTAS ────────────────────────────────────────────────────────

function ForContractors() {
  const benefits = [
    "Panel unificado de conductores",
    "Aprueba servicios con un toque",
    "Reportes PDF y Excel listos para facturar",
    "Alertas de documentos de tus conductores",
  ];
  const drivers = [
    { name: "Carlos M.", status: "En ruta", trips: 7, active: true },
    { name: "Javier L.", status: "Disponible", trips: 4, active: false },
    { name: "Nelson R.", status: "En ruta", trips: 12, active: true },
  ];

  return (
    <section id="contratistas" style={{ padding: "80px 20px" }}>
      <div className="section-divider" style={{ marginBottom: 80 }} />
      <div id="contractors-grid" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr", gap: 48, alignItems: "center" }}>
        <div>
          <span style={{ display: "inline-block", background: "var(--accent-blue-dim)", border: "1px solid rgba(68,136,255,0.2)", borderRadius: 100, padding: "6px 16px", fontSize: "0.8rem", fontWeight: 600, color: "var(--accent-blue)", marginBottom: 20 }}>
            Para empresas
          </span>
          <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 20 }}>
            Tú contratas,
            <br />
            nosotros te ayudamos
            <br />
            <span style={{ color: "var(--accent-blue)" }}>a controlar</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: 1.65, marginBottom: 28, maxWidth: 480 }}>
            Ve en tiempo real lo que registra cada conductor. Aprueba servicios, descarga reportes y mantén todo en orden.
          </p>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
            {benefits.map((b) => (
              <li key={b} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: "0.95rem" }}>
                <Check size={18} color="var(--accent-green)" strokeWidth={2} style={{ flexShrink: 0 }} />
                {b}
              </li>
            ))}
          </ul>
          <a href="/registro" className="btn-primary">Ver plan Contratista</a>
        </div>

        <div className="glass-card" style={{ padding: "24px 20px", maxWidth: 380, margin: "0 auto", width: "100%" }}>
          <p style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 16 }}>
            Mis conductores{" "}
            <span style={{ color: "var(--accent-green)", fontWeight: 600 }}>· 4 activos</span>
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {drivers.map((d) => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "var(--bg-elevated)", borderRadius: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", flexShrink: 0 }}>
                  {d.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: "0.88rem" }}>{d.name}</p>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>{d.trips} trayectos esta semana</p>
                </div>
                <span style={{ background: d.active ? "var(--accent-green-dim)" : "var(--glass-bg)", color: d.active ? "var(--accent-green)" : "var(--text-tertiary)", border: `1px solid ${d.active ? "rgba(0,230,118,0.2)" : "var(--glass-border)"}`, borderRadius: 100, padding: "3px 10px", fontSize: "0.7rem", fontWeight: 600, flexShrink: 0 }}>
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA FINAL ────────────────────────────────────────────────────────────────

function CtaFinal() {
  return (
    <section style={{ padding: "100px 20px", background: "linear-gradient(180deg, var(--bg-base) 0%, var(--bg-surface) 100%)", position: "relative", overflow: "hidden", textAlign: "center" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 300, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,214,0,0.06) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 620, margin: "0 auto" }}>
        <h2 className="font-display" style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 16, lineHeight: 1.1 }}>
          Hoy sigues en Excel.
          <br />
          <span style={{ color: "var(--accent-yellow)" }}>Mañana no tienes que.</span>
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginBottom: 36, lineHeight: 1.6 }}>
          Empieza gratis. Sin tarjeta.
          <br />
          En 2 minutos ya tienes tu primera ruta registrada.
        </p>
        <a href="/registro" className="btn-primary" style={{ fontSize: "1.1rem", padding: "16px 40px", minHeight: 58 }}>
          Crear mi cuenta gratis →
        </a>
        <p style={{ color: "var(--text-tertiary)", fontSize: "0.85rem", marginTop: 20 }}>
          Más de 100 conductores en Latinoamérica ya controlan su trabajo con CuentaRuta
        </p>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ padding: "40px 20px", background: "var(--bg-base)", borderTop: "1px solid var(--glass-border)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20, alignItems: "center", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Route size={18} color="var(--accent-yellow)" strokeWidth={1.5} />
          <span className="font-display" style={{ fontWeight: 700, fontSize: "1rem" }}>CuentaRuta</span>
        </div>
        <p style={{ color: "var(--text-tertiary)", fontSize: "0.85rem" }}>El control inteligente del conductor</p>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { label: "Términos", href: "/terminos" },
            { label: "Privacidad", href: "/privacidad" },
            { label: "Reembolsos", href: "/reembolsos" },
          ].map((link) => (
            <a key={link.label} href={link.href} style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.85rem", transition: "color 0.2s" }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--text-primary)")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--text-secondary)")}>
              {link.label}
            </a>
          ))}
        </div>
        <a href="https://wa.me/573000000000" target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--accent-green)", textDecoration: "none", fontSize: "0.88rem", fontWeight: 600, transition: "opacity 0.2s" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.75")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}>
          <MessageCircle size={16} strokeWidth={1.5} />
          ¿Dudas? Escríbenos por WhatsApp
        </a>
        <p style={{ color: "var(--text-tertiary)", fontSize: "0.78rem" }}>© 2025 CuentaRuta · Disponible en toda Latinoamérica</p>
      </div>
    </footer>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <>
      <ResponsiveStyles />
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <ProblemSolution />
        <HowItWorks />
        <Features />
        <Objections />
        <InstallSection />
        <Pricing />
        <ForContractors />
        <CtaFinal />
      </main>
      <Footer />
    </>
  );
}
