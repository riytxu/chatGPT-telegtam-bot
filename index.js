const dotenv = require("dotenv");
const { Telegraf } = require("telegraf");
const { answerOpenai, pictureOpenai } = require("./openai.js");
const cron = require("node-cron")
const axios = require('axios');
const iconv = require('iconv-lite');

dotenv.config();
const bot = new Telegraf(process.env.TOKEN_TG);
const chatId = Number(process.env.CHAT_ID)
const jokeQuery = process.env.JOKE_QUERY

const getMsg = (ctx) => {
  const regex = /^\/([^@\s]+)@?(?:(\S+)|)\s?([\s\S]+)?$/i;
  return regex.exec(ctx.message.text)[3];
};

const filterText = (message) => {
  return message.replace(/\s+/g, " ");
};

const getJoke = async () => {
  const jokeResponse = await axios.get('http://rzhunemogu.ru/RandJSON.aspx?CType=1', {
    responseType: 'arraybuffer',
    responseEncoding: 'binary'
  })
  const jokeDecode = iconv.decode(Buffer.from(jokeResponse.data), 'windows-1251')
  const jokeFilter = jokeDecode.slice(jokeDecode.indexOf(':') + 1, jokeDecode.indexOf('"}')).replace('"', '')
  const AiResponse = await answerOpenai(jokeQuery + jokeFilter);
  return jokeFilter + AiResponse
};

cron.schedule(process.env.TIME_WAKE_UP, async () => {
  try {
    const joke = await getJoke()
    bot.telegram.sendMessage(chatId, joke)
  } catch (err) {
    bot.telegram.sendMessage(chatId, err.message)
  }
}, {
  timezone: "Asia/Vladivostok"
})

bot.start((ctx) => {
  ctx.reply(
    filterText(
      `Привет! Меня зовут Александр, я чат-бот с искусственным интеллектом, 
    разработанный компанией OpenAI. Я могу вести диалог, искать ошибки в коде,
    сочинять стихи, писать сценарии, рассказывать анекдоты и многое другое.
    А еще у меня есть доступ к нейросети DALL·E, поэтому я могу создавать реалистичные 
    изображения и рисунки. Чтобы начать, нажми команду /bot и свой запрос, для начала
    диалога со мной, либо /image и свой запрос, для создание изображения <3`
    )
  );
});

bot.command("bot", (ctx) => {
  const prompt = getMsg(ctx);
  if (!prompt) {
    ctx.reply(
      filterText(
        `Вы ничего не добавили :(
        Вам следует указать свой запрос после команды /bot`
      )
    );
  } else {
    setTimeout(async () => {
      try {
        const response = await answerOpenai(prompt);
        ctx.reply(response);
      } catch (err) {
        ctx.reply(`У меня тут ошибочка => ${err.message}`);
      }
    });
  }
});

bot.command("image", (ctx) => {
  const prompt = getMsg(ctx);
  if (!prompt) {
    ctx.reply(
      filterText(
        `Вы ничего не добавили :(
        Вам следует указать свой запрос после команды /image`
      )
    );
  } else {
    setTimeout(async () => {
      try {
        const responseGpt = await answerOpenai(
          `напиши запрос на английском языке
          к DALL-E по следующему критерию: ${prompt}`
        );
        const responseDalle = await pictureOpenai(responseGpt);
        ctx.sendMediaGroup(
          responseDalle.map(({ url }) => {
            return { type: "photo", media: url };
          })
        );
      } catch (err) {
        ctx.reply(`У меня тут ошибочка => ${err.message}`);
      }
    });
  }
});

bot.command("joke", (ctx) => {
  setTimeout(async () => {
    try {
      const joke = await getJoke()
      ctx.reply(joke)
    } catch (err) {
      ctx.reply(`У меня тут ошибочка => ${err.message}`);
    }
  })
})

bot.launch();
