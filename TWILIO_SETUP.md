# Configurar Twilio WhatsApp Sandbox

1. Crear cuenta en twilio.com (gratis)
2. Ir a Messaging → Try it out → Send a WhatsApp message
3. Copiar ACCOUNT_SID y AUTH_TOKEN al .env.local
4. Para que un conductor reciba notificaciones,
   debe enviar "join [palabra]" al +1 415 523 8886
   (Twilio te da la palabra en el sandbox)
5. Para producción: solicitar número WhatsApp Business
   en Twilio Console → Messaging → Senders → WhatsApp
