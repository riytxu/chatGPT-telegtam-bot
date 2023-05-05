const dotenv = require("dotenv");
const { Configuration, OpenAIApi } = require("openai");
dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.TOKEN_OAI,
});

const openai = new OpenAIApi(configuration);

const answerOpenai = async (prompt) => {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `${prompt}`,
    temperature: 0,
    max_tokens: 1000,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    stop: ["{}"],
  });
  return response.data.choices[0].text;
};

const pictureOpenai = async (prompt) => {
  const response = await openai.createImage({
    prompt: `${prompt}`,
    n: 4,
    size: "512x512",
  });
  return response.data.data;
};

module.exports = { answerOpenai, pictureOpenai };
