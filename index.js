require('dotenv').config();
const { Client, GatewayIntentBits, Events, EmbedBuilder } = require('discord.js');
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (c) => {
  console.log(`¡Bot listo! Conectado como ${c.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase().startsWith('.ai ')) {
    const pregunta = message.content.slice(4).trim(); 

    if (!pregunta) {
      return message.reply('Escriba una pregunta. Ejemplo: `.ai ¿Qué es JavaScript?`');
    }

    const pensando = await message.reply('Pensando...');

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente serio, informacion precisa y clara. Responde siempre en español.'
          },
          {
            role: 'user',
            content: pregunta
          }
        ],
        model: 'openai/gpt-oss-120b',
        temperature: 0.7,
        max_tokens: 800
      });

      const respuesta = completion.choices[0]?.message?.content || 'No pude generar una respuesta.';

      const embed = new EmbedBuilder()
        .setColor(0xFFFFFF)
        .setTitle('Contenido')
        .setDescription(respuesta)
        .setFooter({ text: `Preguntado por ${message.author.username}` })
        .setTimestamp();

      await pensando.edit({ content: null, embeds: [embed] });

    } catch (error) {
      console.error(error);
      await pensando.edit('Error en la respuesta, favor de intentar de nuevo.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);