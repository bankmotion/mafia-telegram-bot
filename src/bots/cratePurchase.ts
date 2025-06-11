import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { ChainType } from "../enums/ChainType";
import { Config, Contract } from "../config/config";
import { getContract } from "../utils/contract";
import Web3 from "web3";

import CrateMinterABI from "../abis/CrateMinter.json";
import { EventName } from "../enums/EventName";
import {
  getBlockNumberFromName,
  updateBlockNumber,
} from "../services/blockInfoService";
import { BlockName } from "../enums/BlockInfo";

const sendMessage = async (
  bot: Telegraf<Context<Update>>,
  chain: ChainType,
  amount: number,
  address: string
) => {
  for (const chatId of Config.BotCratePurchaseChatID) {
    await bot.telegram.sendMessage(
      chatId,
      `\`${address}\` purchased ${amount} keys \\(${
        amount * 20
      }\\\$\\) on ${chain}`,
      {
        parse_mode: "MarkdownV2",
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
  const crateMintContract = getContract(
    chain,
    CrateMinterABI,
    Contract.CrateMinter[chain]
  );

  const pastEvents = await crateMintContract.getPastEvents(
    EventName.CratePurchased,
    {
      fromBlock: from,
      toBlock,
    }
  );

  await updateBlockNumber(BlockName.CratePurchased, toBlock, chain);

  for (let index = 0; index < pastEvents.length; index++) {
    const event: any = pastEvents[index];
    const amount = event.returnValues.amount;
    const user = event.returnValues.user;
    await sendMessage(bot, chain, Number(amount), user);
  }

  if (toBlock < to) {
    await getPastEvents(from + 9001, to, chain, bot);
  }
  console.log("scan finished for crate purcahse");
};

const start = async (chain: ChainType, bot: Telegraf<Context<Update>>) => {
  try {
    const web3 = new Web3(Config.RPCProvider[chain]);

    const fromBlock = await getBlockNumberFromName(
      BlockName.CratePurchased,
      chain
    );

    if (!fromBlock) return;

    const toBlock = await web3.eth.getBlockNumber();

    console.log({ fromBlock, toBlock });
    await getPastEvents(fromBlock + 1, Number(toBlock), chain, bot);
  } catch (err) {
    console.error(`Error in cratePurchase ${err}`);
  }
};

export const scanCratePurchase = async (
  chain: ChainType,
  bot: Telegraf<Context<Update>>
) => {
  setInterval(() => {
    start(chain, bot);
  }, 600 * 1000);

  start(chain, bot);
};
