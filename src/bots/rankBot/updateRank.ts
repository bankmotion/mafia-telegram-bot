import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";

import { ChainType } from "../../enums/ChainType";
import UserRank from "../../models/UserRank";
import { toUSDFormat } from "../../utils";
import { AllowSendMSG, Config, Contract } from "../../config/config";
import { getContract } from "../../utils/contract";

import RankXPABI from "../../abis/RankXP.json";
import { EventName } from "../../enums/EventName";
import { getRankXpByUser, updateRankXp } from "../../services/userRankService";
import { getRankXpByValue } from "../../utils/rank";
import { RankXPName } from "../../const/rank";
import { menLinksSmall, womenLinksSmall } from "../../const/avatarLinks";
import {
  getBlockNumberFromName,
  updateBlockNumber,
} from "../../services/blockInfoService";
import Web3 from "web3";
import { BlockName } from "../../enums/BlockInfo";

// Start ---> UpdateRankXP
const sendMessage = async (
  bot: Telegraf<Context<Update>>,
  img: string,
  chain: ChainType,
  user: UserRank,
  rank: string
) => {
  if (Config.Addresses.includes(user.address)) {
    return;
  }
  const endpoint = Config.FrontendEndPoint[chain];
  const worth = toUSDFormat(user.worth || 0);
  const familyText = user.family
    ? `(<a href="${endpoint}family/${user.family}">${user.family}</a>)`
    : "(No family)";
  const caption = `Rank promotion\n\n<a href="${endpoint}profile/${user.name}">${user.name}</a> ${familyText} just promoted to <u>${rank}</u> rank. User worth: ${worth}`;
  await bot.telegram.sendPhoto(Config.BotChatId[chain], img, {
    caption,
    parse_mode: "HTML",
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

  await updateBlockNumber(BlockName.RankXPBlock, toBlock, chain);

  for (let index = 0; index < pastEvents.length; index++) {
    const event: any = pastEvents[index];
    const user = event.returnValues.user;
    const amount = Number(event.returnValues.amount) / 100;
    console.log(user, amount, event.transactionHash)

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

      if (data && promotedStatus !== RankXPName[0] && AllowSendMSG) {
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

  if (toBlock < to) {
    await getPastEvents(from + 9001, to, chain, bot);
  }
};

const start = async (chain: ChainType, bot: Telegraf<Context<Update>>) => {
  try {
    const web3 = new Web3(Config.RPCProvider[chain]);

    const fromBlock = await getBlockNumberFromName(
      BlockName.RankXPBlock,
      chain
    );
    if (!fromBlock) return;

    const toBlock = await web3.eth.getBlockNumber();

    await getPastEvents(fromBlock + 1, Number(toBlock), chain, bot);
  } catch (err) {
    console.error(`Error in scanRankXP ${err}`);
  }
};

export const scanRankXP = async (
  chain: ChainType,
  bot: Telegraf<Context<Update>>
) => {
  setInterval(() => {
    start(chain, bot);
  }, 120 * 1000);
  start(chain, bot);
};
// End ---> UpdateRankXP
