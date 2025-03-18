import { Context, Telegraf } from "telegraf";
import { ChainType } from "../../enums/ChainType";
import { Update } from "telegraf/typings/core/types/typegram";
import Web3 from "web3";
import { AllowSendMSG, Config, Contract } from "../../config/config";
import {
  getBlockNumberFromName,
  updateBlockNumber,
} from "../../services/blockInfoService";
import { BlockName } from "../../enums/BlockInfo";
import { getContract } from "../../utils/contract";

import jailABI from "../../abis/Jail.json";
import { EventName } from "../../enums/EventName";
import axios from "axios";

const sendMessage = async (
  bot: Telegraf<Context<Update>>,
  buster: string,
  prisoner: string,
  chain: ChainType
) => {
  const busterInfo = (
    await axios.get(`${Config.BackendEndpoint[chain]}profile/address/${buster}`)
  ).data;
  const prisonerInfo = (
    await axios.get(
      `${Config.BackendEndpoint[chain]}profile/address/${prisoner}`
    )
  ).data;
  const img =
    "https://firebasestorage.googleapis.com/v0/b/bnbmafia-4d1b3.appspot.com/o/jail%2Fout_jail.png?alt=media&token=564ebcf6-d30f-401a-bfbf-a4fc672736d3";

  const endpoint = Config.FrontendEndPoint[chain];

  if (busterInfo && prisonerInfo) {
    const caption = `Jail bustout\n\n<a href="${endpoint}profile/${busterInfo.name}">${busterInfo.name}</a> just busted out <a href="${endpoint}profile/${prisonerInfo.name}">${prisonerInfo.name}</a>.`;

    await bot.telegram.sendPhoto(Config.BotChatId[chain], img, {
      caption,
      parse_mode: "HTML",
    });
  }
};

const getPastEvents = async (
  from: number,
  to: number,
  chain: ChainType,
  bot: Telegraf<Context<Update>>
) => {
  const toBlock = Math.min(from + 9000, to);
  const jailContract = getContract(chain, jailABI, Contract.Jail[chain]);

  console.log(`Jail past event started from ${from} tot ${toBlock}`);

  const pastEvents = await jailContract.getPastEvents(
    EventName.BustOutPrisoner,
    {
      fromBlock: from,
      toBlock,
    }
  );

  for (let index = 0; index < pastEvents.length; index++) {
    const event: any = pastEvents[index];
    const buster = event.returnValues.buster;
    const prisoner = event.returnValues.prisoner;

    const status = event.returnValues.isSuccess && !event.returnValues.isJailed;
    if (status && AllowSendMSG) {
      await sendMessage(bot, buster, prisoner, chain);
    }
  }

  await updateBlockNumber(BlockName.JailBustOut, toBlock, chain);

  if (toBlock < to) {
    await getPastEvents(from + 9001, to, chain, bot);
  }
};

const start = async (chain: ChainType, bot: Telegraf<Context<Update>>) => {
  try {
    const web3 = new Web3(Config.RPCProvider[chain]);

    const fromBlock = await getBlockNumberFromName(
      BlockName.JailBustOut,
      chain
    );
    if (!fromBlock) return;

    const toBlock = await web3.eth.getBlockNumber();

    await getPastEvents(fromBlock + 1, Number(toBlock), chain, bot);
  } catch (err) {
    console.error(`Error in scanBustout ${err}`);
  }
};

export const scanBustOut = async (
  chain: ChainType,
  bot: Telegraf<Context<Update>>
) => {
  setInterval(() => {
    start(chain, bot);
  }, 60 * 1000);
};
