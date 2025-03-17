import { Telegraf } from "telegraf";

import { Config } from "../config/config";
import { ChainType } from "../enums/ChainType";

import { scanRankXP } from "./rankBot/updateRank";
import { scanStoleCar } from "./rankBot/stoleCar";
import { scanBustOut } from "./rankBot/bustout";
import { scanSmuggle } from "./rankBot/smuggle";

const MafiaBot = () => {
  const bot = new Telegraf(Config.MafiaTGBotToken);

  setInterval(() => {
    scanRankXP(ChainType.BNB, bot);
    scanStoleCar(ChainType.BNB, bot);
    scanBustOut(ChainType.BNB, bot);
    scanSmuggle(ChainType.BNB, bot);
  }, 60 * 1000);
  scanRankXP(ChainType.BNB, bot);
  scanStoleCar(ChainType.BNB, bot);
  scanBustOut(ChainType.BNB, bot);
  scanSmuggle(ChainType.BNB, bot);

  bot.start((ctx) => {
    ctx.reply("Welcome to the bot!");
  });

  // bot.on("message", (ctx) => {
  //   const chatId = ctx.chat.id;
  //   console.log({ chatId });
  // });

  return bot;
};

export default MafiaBot;
