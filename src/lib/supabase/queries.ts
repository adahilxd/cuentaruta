import { createClient } from '@/utils/supabase/client'

// ── Formateo de moneda (preparado para multi-moneda) ─────────────
export function formatCurrency(value: number | null, moneda = 'COP'): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: moneda,
    minimumFractionDigits: 0,
  }).format(value)
}

// Formato abreviado para tooltips de gráfica
export function formatCurrencyAbbr(n: number): string {
  if (n >= 1_000_000) {
    const v = n / 1_000_000
    return `$${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}M`
  }
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${n}`
}

// Fecha en formato colombiano dd/mm/yyyy
export function fmtFecha(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

// ── Queries ──────────────────────────────────────────────────────

export async function getTrayectos(conductorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cr_trayectos')
    .select('*')
    .eq('conductor_id', conductorId)
    .order('fecha', { ascending: false })
    .limit(500)
  if (error) throw error
  return data ?? []
}

export async function getViaticos(conductorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cr_viaticos')
    .select('*')
    .eq('conductor_id', conductorId)
    .order('fecha', { ascending: false })
    .limit(500)
  if (error) throw error
  return data ?? []
}

export async function getFlujo(conductorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cr_flujo')
    .select('*')
    .eq('conductor_id', conductorId)
    .order('semana', { ascending: false })
    .limit(100)
  if (error) throw error
  return data ?? []
}

export async function getDocumentos(conductorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cr_documentos')
    .select('*')
    .eq('conductor_id', conductorId)
    .order('vencimiento', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function getPerfil(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cr_usuarios')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

// ── Helpers de fecha/semana ───────────────────────────────────────

// ISO week number del año (para calcular semana actual)
export function isoWeekOfYear(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

// Primer y último día del mes actual
export function currentMonthRange(): { start: string; end: string } {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return { start: `${y}-${m}-01`, end: `${y}-${m}-${last}` }
}

// Días hasta vencimiento de un documento
export function diasParaVencer(vencimiento: string | null): number | null {
  if (!vencimiento) return null
  return Math.ceil((new Date(vencimiento + 'T12:00:00').getTime() - Date.now()) / 86400000)
}

export function estadoDocumento(vencimiento: string | null): 'vigente' | 'vence_pronto' | 'vencido' {
  const dias = diasParaVencer(vencimiento)
  if (dias === null) return 'vigente'
  if (dias < 0) return 'vencido'
  if (dias <= 30) return 'vence_pronto'
  return 'vigente'
}
