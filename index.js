require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { GoogleGenAI } = require('@google/genai');

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

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Ejemplo: si el mensaje empieza con un prefijo
  if (!message.content.startsWith('!pregunta')) return;

  const pregunta = message.content.slice('!pregunta'.length).trim();
  if (!pregunta) return;

  const pensando = await message.reply('Pensando...');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: pregunta }]
        }
      ],
      config: {
        temperature: 0.7,
        maxOutputTokens: 800,
        systemInstruction: 'Eres un asistente serio e informal.'
      }
    });

    const respuesta = response.text;

    const embed = new EmbedBuilder()
      .setColor(0xFFFFFF)
      .setTitle('Contenido')
      .setDescription(respuesta)
      .setFooter({ text: `Preguntado por ${message.author.tag}` })
      .setTimestamp();

    await pensando.edit({ content: null, embeds: [embed] });

  } catch (error) {
    console.error(error);
    await pensando.edit('Error en la respuesta, favor de intentar de nuevo.');
  }
});

client.login(process.env.DISCORD_TOKEN);