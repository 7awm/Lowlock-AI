require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { GoogleGenAI } = require('@google/genai');

if (!process.env.DISCORD_TOKEN || !process.env.GEMINI_API_KEY) {
  console.error('❌ ERROR: Revisa tu archivo .env o las variables del panel. Falta DISCORD_TOKEN o GEMINI_API_KEY.');
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`✅ Bot conectado e iniciado como: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (!message.content.startsWith('.ai')) return;

  const pregunta = message.content.slice('.ai'.length).trim();
  if (!pregunta) {
    return message.reply('Por favor ingresa una pregunta. Ejemplo: `.ai ¿Qué es Node.js?`');
  }

  const pensando = await message.reply('Pensando...');

  try {
const response = await ai.models.generateContent({
  model: 'gemini-2.5-pro',
  contents: pregunta,
  config: {
    temperature: 0.7,
    maxOutputTokens: 800,
    systemInstruction: 'Eres un asistente serio e informal.'
  }
});

    const respuesta = response.text;

    const textoFinal = respuesta.length > 4000 ? respuesta.substring(0, 3997) + '...' : respuesta;

    const embed = new EmbedBuilder()
      .setColor(0xFFFFFF)
      .setTitle('Respuesta')
      .setDescription(textoFinal)
      .setFooter({ text: `Preguntado por ${message.author.tag}` })
      .setTimestamp();

    await pensando.edit({ content: null, embeds: [embed] });

  } catch (error) {
    console.error('Error al generar contenido con Gemini:', error);
    await pensando.edit('Ocurrió un error al procesar tu respuesta. Por favor intenta de nuevo.');
  }
});

client.login(process.env.DISCORD_TOKEN).catch((err) => {
  console.error('❌ Error crítico al iniciar sesión en Discord:', err.message);
});