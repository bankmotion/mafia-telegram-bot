import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { ChainType } from "../enums/ChainType";
import { Config, Contract } from "../config/config";
import { getContract } from "../utils/contract";
import Web3 from "web3";

import PerkBoxMinterABI from "../abis/PerkBoxMinter.json";
import { EventName } from "../enums/EventName";
import {
  getBlockNumberFromName,
  updateBlockNumber,
} from "../services/blockInfoService";
import { BlockName } from "../enums/BlockInfo";
import { ethers } from "ethers";

function escapeMarkdown(text: string) {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&");
}

const sendMessage = async (
  bot: Telegraf<Context<Update>>,
  chain: ChainType,
  amount: number,
  address: string
) => {
  for (const chatId of Config.BotCratePurchaseChatID) {
    console.log(
      `\`${address}\` purchased ${escapeMarkdown(
        Math.floor(amount).toString()
      )} Perk Boxes \\(${escapeMarkdown(
        (amount * 9.99).toString()
      )}\\\$\\) on ${chain}`
    );
    await bot.telegram.sendMessage(
      chatId,
      `\`${address}\` purchased ${escapeMarkdown(
        Math.floor(amount).toString()
      )} Perk Boxes \\(${escapeMarkdown(
        (amount * 9.99).toString()
      )}\\\$\\) on ${chain}`,
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
  const perkBoxMinterContract = getContract(
    chain,
    PerkBoxMinterABI,
    Contract.PerkBoxMinter[chain]
  );

  const pastEvents = await perkBoxMinterContract.getPastEvents(
    EventName.PerkBoxesPurchased,
    {
      fromBlock: from,
      toBlock,
    }
  );

  await updateBlockNumber(BlockName.PerkBoxesPurchased, toBlock, chain);

  for (let index = 0; index < pastEvents.length; index++) {
    const event: any = pastEvents[index];
    const buyer = event.returnValues.user;
    const perkBoxAmount = Number(event.returnValues.amount);
    await sendMessage(bot, chain, Number(perkBoxAmount), buyer);
  }

  if (toBlock < to) {
    await getPastEvents(from + 9001, to, chain, bot);
  }
  console.log("scan finished for perk box purchase");
};

const start = async (chain: ChainType, bot: Telegraf<Context<Update>>) => {
  try {
    const web3 = new Web3(Config.RPCProvider[chain]);

    const fromBlock = await getBlockNumberFromName(
      BlockName.PerkBoxesPurchased,
      chain
    );

    if (!fromBlock) return;

    const toBlock = await web3.eth.getBlockNumber();

    console.log({ fromBlock, toBlock });
    await getPastEvents(fromBlock + 1, Number(toBlock), chain, bot);
  } catch (err) {
    console.error(`Error in perk box purchase ${err}`);
  }
};

export const scanPerkBoxPurchase = async (
  chain: ChainType,
  bot: Telegraf<Context<Update>>
) => {
  setInterval(() => {
    start(chain, bot);
  }, 600 * 1000);

  start(chain, bot);
};
