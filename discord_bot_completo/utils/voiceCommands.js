
exports.handleVoiceCommand = async (text, userId) => {
  return { audioPath: null, response: "Comando processado: " + text };
};
