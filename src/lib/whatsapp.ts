import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function sendWhatsApp(
  telefono: string,
  mensaje: string
): Promise<void> {
  try {
    await client.messages.create({
      from: 'whatsapp:' + process.env.TWILIO_WHATSAPP_NUMBER,
      to: 'whatsapp:+' + telefono.replace(/\D/g, ''),
      body: mensaje
    })
  } catch (error) {
    console.error('Error enviando WhatsApp:', error)
  }
}
