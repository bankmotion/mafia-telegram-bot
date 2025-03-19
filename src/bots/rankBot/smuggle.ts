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

import smuggleJson from "../../abis/smuggle.json";
import { getContract } from "../../utils/contract";
import { EventName } from "../../enums/EventName";
import axios from "axios";
import { toUSDFormat } from "../../utils";
import { ethers } from "ethers";

const sendMessage = async (
  bot: Telegraf<Context<Update>>,
  seller: string,
  cashAmount: number,
  chain: ChainType,
  type: number, // 0: booze, 1: narc
  exchange: number // 0: buy, 1: sell
) => {
  const sellerInfo = (
    await axios.get(`${Config.BackendEndpoint[chain]}profile/address/${seller}`)
  ).data;

  if (sellerInfo) {
    const endpoint = Config.FrontendEndPoint[chain];
    const caption =
      (type === 0 ? `Booze smuggle` : `Narcs smuggle`) +
      `\n\n<a href="${endpoint}profile/${sellerInfo.name}">${
        sellerInfo.name
      }</a> ${exchange === 0 ? "bought" : "sold"} ` +
      (type === 0 ? `Booze.` : `Narcotics.`) +
      ` Cash amount: ${toUSDFormat(cashAmount)}`;
    const img =
      type === 0
        ? "https://firebasestorage.googleapis.com/v0/b/bnbmafia-4d1b3.appspot.com/o/jail%2Fliquor.png?alt=media&token=8dd4ec64-d1a7-411c-bc50-b14b7a1bcd6d"
        : "https://firebasestorage.googleapis.com/v0/b/bnbmafia-4d1b3.appspot.com/o/jail%2Fdrugs.png?alt=media&token=f2964e7a-9103-4e4c-8678-a00d9ea59886";

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
  const smuggleContract = getContract(
    chain,
    smuggleJson,
    Contract.Smuggle[chain]
  );

  console.log(`Smuggle past event started from ${from} to ${toBlock}`);

  const boozeBuyPastEvents = await smuggleContract.getPastEvents(
    EventName.BoozeBuy,
    {
      fromBlock: from,
      toBlock,
    }
  );

  const boozeSellPastEvents = await smuggleContract.getPastEvents(
    EventName.BoozeSell,
    {
      fromBlock: from,
      toBlock,
    }
  );

  const narBuyPastEvents = await smuggleContract.getPastEvents(
    EventName.NarcsBuy,
    {
      fromBlock: from,
      toBlock,
    }
  );

  const narSellPastEvents = await smuggleContract.getPastEvents(
    EventName.NarcsSell,
    {
      fromBlock: from,
      toBlock,
    }
  );

  for (let index = 0; index < boozeBuyPastEvents.length; index++) {
    const event: any = boozeBuyPastEvents[index];
    const buyer = event.returnValues.buyer;
    const cashAmount = Number(
      ethers.formatEther(event.returnValues.cashAmount)
    );
    const status = event.returnValues.isSuccess && !event.returnValues.isJailed;
    if (status && cashAmount && AllowSendMSG) {
      await sendMessage(bot, buyer, cashAmount, chain, 0, 0);
    }
  }

  for (let index = 0; index < boozeSellPastEvents.length; index++) {
    const event: any = boozeSellPastEvents[index];
    const seller = event.returnValues.seller;
    const cashAmount = Number(
      ethers.formatEther(event.returnValues.cashAmount)
    );
    const status = event.returnValues.isSuccess && !event.returnValues.isJailed;
    if (status && cashAmount && AllowSendMSG) {
      await sendMessage(bot, seller, cashAmount, chain, 0, 1);
    }
  }

  for (let index = 0; index < narBuyPastEvents.length; index++) {
    const event: any = narBuyPastEvents[index];
    const buyer = event.returnValues.buyer;
    const cashAmount = Number(
      ethers.formatEther(event.returnValues.cashAmount)
    );
    const status = event.returnValues.isSuccess && !event.returnValues.isJailed;
    if (status && cashAmount) {
      await sendMessage(bot, buyer, cashAmount, chain, 1, 0);
    }
  }

  for (let index = 0; index < narSellPastEvents.length; index++) {
    const event: any = narSellPastEvents[index];
    const seller = event.returnValues.seller;
    const cashAmount = Number(
      ethers.formatEther(event.returnValues.cashAmount)
    );
    const status = event.returnValues.isSuccess && !event.returnValues.isJailed;
    if (status && cashAmount) {
      await sendMessage(bot, seller, cashAmount, chain, 1, 1);
    }
  }

  await updateBlockNumber(BlockName.SmuggleBlock, toBlock, chain);

  if (toBlock < to) {
    await getPastEvents(from + 9001, to, chain, bot);
  }
};

const start = async (chain: ChainType, bot: Telegraf<Context<Update>>) => {
  try {
    const web3 = new Web3(Config.RPCProvider[chain]);

    const fromBlock = await getBlockNumberFromName(
      BlockName.SmuggleBlock,
      chain
    );
    if (!fromBlock) return;

    const toBlock = await web3.eth.getBlockNumber();

    await getPastEvents(fromBlock + 1, Number(toBlock), chain, bot);
  } catch (err) {
    console.error(`Error in scanSmuggle`, err);
  }
};

export const scanSmuggle = async (
  chain: ChainType,
  bot: Telegraf<Context<Update>>
) => {
  setInterval(() => {
    start(chain, bot);
  }, 300 * 1000);
  start(chain, bot);
};
