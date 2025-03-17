import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";

import { Config, Contract } from "../config/config";
import { ChainType } from "../enums/ChainType";
import { getContract } from "../utils/contract";

import RankXPABI from "../abis/RankXP.json";
import {
  getBlockNumberFromName,
  updateBlockNumber,
} from "../services/blockInfoService";
import { BlockName } from "../enums/BlockInfo";
import Web3 from "web3";
import { EventName } from "../enums/EventName";
import { getRankXpByUser, updateRankXp } from "../services/userRankService";
import { getRankXpByValue } from "../utils/rank";
import { RankXPName } from "../const/rank";
import { menLinksSmall, womenLinksSmall } from "../const/avatarLinks";
import UserRank from "../models/UserRank";
import { toUSDFormat } from "../utils";

const sendMessage = async (
  bot: Telegraf<Context<Update>>,
  img: string,
  chain: ChainType,
  user: UserRank,
  rank: string
) => {
  const name = user.name;
  const family = user.family;
  const worth = toUSDFormat(user.worth || 0, 0);
  const familyText = family
    ? ` \\([${family}](${Config.FrontendEndPoint[chain]}family/${family})\\)`
    : " \\(No family\\)";
  const caption = `[${name}](${Config.FrontendEndPoint[chain]}profile/${name}) User${familyText} just promoted to __${rank}__ rank\\. Worth: ${worth}`;
  await bot.telegram.sendPhoto(Config.BotChatId[chain], img, {
    caption,
    parse_mode: "MarkdownV2",
  });
};

const getPastEvents = async (
  from: number,
  to: number,
  chain: ChainType,
  bot: Telegraf<Context<Update>>
) => {
  const toBlock = Math.min(from + 9000, to);
  const rankXPContract = getContract(chain, RankXPABI, Contract.RankXP[chain]);

  console.log(`rankXP past event started from ${from} to ${toBlock}`);

  const pastEvents = await rankXPContract.getPastEvents(
    EventName.RankXpUpdated,
    {
      fromBlock: from,
      toBlock,
    }
  );

  for (let index = 0; index < pastEvents.length; index++) {
    const event: any = pastEvents[index];
    const user = event.returnValues.user;
    const amount = Number(event.returnValues.amount);

    let promotedStatus = "";

    const preRankInfo = await getRankXpByUser(user, chain);
    if (preRankInfo) {
      const previousRankInfo = getRankXpByValue(preRankInfo.rankXp);
      const newRankInfo = getRankXpByValue(amount);
      if (previousRankInfo.targetIndex !== newRankInfo.targetIndex) {
        promotedStatus = newRankInfo.name;
      }
    } else {
      const newRankInfo = getRankXpByValue(amount);
      promotedStatus = newRankInfo.name;
    }
    if (promotedStatus) {
      const data = await updateRankXp(user, amount, chain);

      if (data && promotedStatus !== RankXPName[0]) {
        await sendMessage(
          bot,
          data.gender === 0
            ? menLinksSmall[data.img]
            : womenLinksSmall[data.img],
          chain,
          data,
          promotedStatus
        );
      }
    }
  }

  await updateBlockNumber(BlockName.RankXPBlock, toBlock, chain);

  if (toBlock < to) {
    await getPastEvents(from + 9001, to, chain, bot);
  }
};

const scanRankXP = async (chain: ChainType, bot: Telegraf<Context<Update>>) => {
  const web3 = new Web3(Config.RPCProvider[chain]);

  const fromBlock = await getBlockNumberFromName(BlockName.RankXPBlock, chain);
  if (!fromBlock) return;

  const toBlock = await web3.eth.getBlockNumber();

  await getPastEvents(fromBlock + 1, Number(toBlock), chain, bot);
};

const MafiaBot = () => {
  const bot = new Telegraf(Config.MafiaTGBotToken);
  let interval: NodeJS.Timeout | null = null;
  try {
    interval = setInterval(() => {
      scanRankXP(ChainType.BNB, bot);
    }, 60 * 1000);
  } catch (err) {
    if (interval) clearInterval(interval);
    console.error(err);
  }

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
