
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

module.exports = async (message) => {
  if (message.author.bot || !message.guild) return;
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: message.content }],
    });
    const reply = response.data.choices[0].message.content;
    await message.reply(reply);
  } catch (error) {
    console.error("Erro ao responder mensagem:", error);
  }
};
