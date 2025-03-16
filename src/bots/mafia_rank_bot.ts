import { Telegraf } from "telegraf";

import { Config } from "../config/config";

const startBot = async () => {
  const bot = new Telegraf(Config.MafiaTGBotToken);

  bot.start((ctx) => {
    ctx.reply("Welcome to the bot!");
  });

  bot.launch();

  console.log("Start the bot");
};

export default startBot();
