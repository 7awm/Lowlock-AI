require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

try {
// Dentro de tu función (donde antes hacías la completion):
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',          // o 'gemini-3.5-flash' / 'gemini-flash-latest'
  contents: [
    {
      role: 'user',
      parts: [{ text: pregunta }]
    }
  ],
  config: {
    temperature: 0.7,
    maxOutputTokens: 800,
    systemInstruction: 'Eres un asistente serio, informal...'
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

client.login(process.env.DISCORD_TOKEN);