import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handleMessage(message) {
  if (message.author.bot || !message.guild) return;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: message.content }],
    });

    const reply = response.choices[0].message.content;
    await message.reply(reply);
  } catch (error) {
    console.error('Erro ao responder mensagem:', error);
  }
}
