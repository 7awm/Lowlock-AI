require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const Groq = require('groq-sdk');

if (!process.env.DISCORD_TOKEN || !process.env.GROQ_API_KEY) {
  console.error('❌ ERROR: Revisa tu archivo .env o las variables del panel. Falta DISCORD_TOKEN o GROQ_API_KEY.');
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
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
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente serio y profesional que responde de manera concisa y clara. No uses emojis ni lenguaje informal. Responde siempre en español.'
        },
        {
          role: 'user',
          content: pregunta
        }
      ],
      model: 'llama-3.3-70b-versatile', 
      temperature: 0.7,
      max_tokens: 800
    });

    const respuesta = chatCompletion.choices[0]?.message?.content || 'No se pudo generar una respuesta.';

    const textoFinal = respuesta.length > 4000 ? respuesta.substring(0, 3997) + '...' : respuesta;

    const embed = new EmbedBuilder()
      .setColor(0xFFFFFF)
      .setTitle('Respuesta')
      .setDescription(textoFinal)
      .setFooter({ text: `Preguntado por ${message.author.tag}` })
      .setTimestamp();

    await pensando.edit({ content: null, embeds: [embed] });

  } catch (error) {
    console.error('Error al generar contenido con Groq:', error);
    await pensando.edit('Ocurrió un error al procesar tu respuesta. Por favor intenta de nuevo.');
  }
});

client.login(process.env.DISCORD_TOKEN).catch((err) => {
  console.error('❌ Error crítico al iniciar sesión en Discord:', err.message);
});