import { Context, Telegraf } from "telegraf";
import { ChainType } from "../../enums/ChainType";
import { Update } from "telegraf/typings/core/types/typegram";
import Web3 from "web3";
import { Config, Contract } from "../../config/config";
import {
  getBlockNumberFromName,
  updateBlockNumber,
} from "../../services/blockInfoService";
import { BlockName } from "../../enums/BlockInfo";
import { getContract } from "../../utils/contract";

import crimeABI from "../../abis/Crime.json";
import { EventName } from "../../enums/EventName";
import axios from "axios";
import { menLinksSmall, womenLinksSmall } from "../../const/avatarLinks";

const sendMessage = async (
  bot: Telegraf<Context<Update>>,
  address: string,
  chain: ChainType
) => {
  const userInfo = (
    await axios.get(
      `${Config.BackendEndpoint[chain]}profile/address/${address}`
    )
  ).data;

  const endpoint = Config.FrontendEndPoint[chain];

  if (userInfo) {
    const caption = `New Crime\n\n<a href="${endpoint}profile/${userInfo.name}">${userInfo.name}</a> just made a crime.`;

    await bot.telegram.sendPhoto(
      Config.BotChatId[chain],
      userInfo.gender === 0
        ? menLinksSmall[userInfo.imageId]
        : womenLinksSmall[userInfo.imageId],
      {
        caption,
        parse_mode: "HTML",
      }
    );
  }
};

const getPastEvents = async (
  from: number,
  to: number,
  chain: ChainType,
  bot: Telegraf<Context<Update>>
) => {
  const toBlock = Math.min(from + 9000, to);
  const crimeContract = getContract(chain, crimeABI, Contract.Crime[chain]);

  console.log(`Crime past event started from ${from} to ${toBlock}`);

  const pastEvents = await crimeContract.getPastEvents(EventName.NewCrime, {
    fromBlock: from,
    toBlock,
  });

  for (let index = 0; index < pastEvents.length; index++) {
    const event: any = pastEvents[index];
    const addr = event.returnValues.criminal;
    const status = event.returnValues.isSuccess && !event.returnValues.isJailed;
    if (status) {
      // await sendMessage(bot, addr, chain);
    }
  }

  await updateBlockNumber(BlockName.CrimeBlock, toBlock, chain);

  if (toBlock < to) {
    await getPastEvents(from + 9001, to, chain, bot);
  }
};

const start = async (chain: ChainType, bot: Telegraf<Context<Update>>) => {
  try {
    const web3 = new Web3(Config.RPCProvider[chain]);

    const fromBlock = await getBlockNumberFromName(BlockName.CrimeBlock, chain);
    if (!fromBlock) return;

    const toBlock = await web3.eth.getBlockNumber();

    await getPastEvents(fromBlock + 1, Number(toBlock), chain, bot);
  } catch (err) {
    console.error(`Error in scan crime ${err}`);
  }
};

export const scanCrime = async (
  chain: ChainType,
  bot: Telegraf<Context<Update>>
) => {
  setInterval(() => {
    start(chain, bot);
  }, 120 * 1000);
  start(chain, bot);
};
