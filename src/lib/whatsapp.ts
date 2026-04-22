export async function sendWhatsApp(telefono: string, mensaje: string) {
  if (!telefono) return;
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!apikey) return;
  const phone = telefono.replace(/[^0-9+]/g, "");
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(mensaje)}&apikey=${apikey}`;
  try {
    await fetch(url, { method: "GET" });
  } catch {
    // WhatsApp notification is best-effort
  }
}
