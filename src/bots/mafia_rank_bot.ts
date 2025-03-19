import { Telegraf } from "telegraf";

import { Config } from "../config/config";
import { ChainType } from "../enums/ChainType";

import { scanRankXP } from "./rankBot/updateRank";
import { scanStoleCar } from "./rankBot/stoleCar";
import { scanBustOut } from "./rankBot/bustout";
import { scanSmuggle } from "./rankBot/smuggle";
import { scanCrime } from "./rankBot/crime";

const MafiaBot = () => {
  const bot = new Telegraf(Config.MafiaTGBotToken);

  scanRankXP(ChainType.BNB, bot);
  scanRankXP(ChainType.PLS, bot);

  // scanStoleCar(ChainType.BNB, bot);
  // scanStoleCar(ChainType.PLS, bot);

  // scanBustOut(ChainType.BNB, bot);
  // scanBustOut(ChainType.PLS, bot);

  scanSmuggle(ChainType.BNB, bot);
  scanSmuggle(ChainType.PLS, bot);

  // scanCrime(ChainType.PLS, bot);
  // scanCrime(ChainType.BNB, bot);

  bot.start((ctx) => {
    ctx.reply("Welcome to the bot!");
  });

  bot.on("message", (ctx) => {
    const chatId = ctx.chat.id;
    console.log({ chatId });
  });

  return bot;
};

export default MafiaBot;
