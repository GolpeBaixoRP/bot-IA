export async function handleVoiceCommand(text, userId) {
  return { audioPath: null, response: "Comando processado: " + text };
}
