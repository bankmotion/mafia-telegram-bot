import { Telegraf } from "telegraf";

import { Config } from "../config/config";
import { ChainType } from "../enums/ChainType";

import { scanRankXP } from "./rankBot/updateRank";
import { scanStoleCar } from "./rankBot/stoleCar";
import { scanBustOut } from "./rankBot/bustout";
import { scanSmuggle } from "./rankBot/smuggle";
import { scanCrime } from "./rankBot/crime";
import { scanCratePurchase } from "./cratePurchase";
import { scanCreditBought } from "./helperCredit";

const MafiaBot = () => {
  const bot = new Telegraf(Config.CratePurchaseBotToken);

  // scanRankXP(ChainType.BNB, bot);
  // scanRankXP(ChainType.PLS, bot);

  const directBot = new Telegraf(Config.CratePurchaseBotToken);
  scanCratePurchase(ChainType.BNB, directBot);
  scanCratePurchase(ChainType.PLS, directBot);

  scanCreditBought(ChainType.BNB, directBot);
  scanCreditBought(ChainType.PLS, directBot);

  // scanStoleCar(ChainType.BNB, bot);
  // scanStoleCar(ChainType.PLS, bot);

  // scanBustOut(ChainType.BNB, bot);
  // scanBustOut(ChainType.PLS, bot);

  // scanSmuggle(ChainType.BNB, bot);
  // scanSmuggle(ChainType.PLS, bot);

  // scanCrime(ChainType.PLS, bot);
  // scanCrime(ChainType.BNB, bot);

  directBot.start((ctx) => {
    ctx.reply("Welcome to the Bot!");
    const chatId = ctx.chat.id;
    console.log({ chatId });
  });

  directBot.on("message", (ctx) => {
    const chatId = ctx.chat.id;
    console.log({ chatId });
  });

  return directBot;
};

export default MafiaBot;
