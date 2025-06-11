import { Context, Telegraf } from "telegraf";
import { Config, Contract } from "../config/config";
import Web3, { EventLog } from "web3";
import fs from "fs";
import { BigNumberish, ethers } from "ethers";
import { toUSDFormat } from "../utils";
import { ChainType } from "../enums/ChainType";
const tokenABI = JSON.parse(fs.readFileSync("./src/abis/token.json", "utf8"));

let endBlock = {
  [ChainType.PLS]: 0,
  [ChainType.BNB]: 0,
};

const tokenAddress = {
  [ChainType.PLS]: "0xC52F739f544d20725BA7aD47Bb42299034F06f4F",
  [ChainType.BNB]: "0x4D9927a8Dc4432B93445dA94E4084D292438931F",
};
const toAddress = "0x2cd847B050891dDaE68a69B56998BFfB1Dc02106";

const tokenName = {
  [ChainType.PLS]: "PLSP",
  [ChainType.BNB]: "BNBP",
};

const rating = {
  [ChainType.PLS]: 100,
  [ChainType.BNB]: 33,
};

const startScan = async (chain: ChainType, bot: Telegraf<Context>) => {
  try {
    const web3 = new Web3(Config.RPCProvider[chain]);
    const currentBlock = Number(await web3.eth.getBlockNumber());
    console.log(currentBlock);

    if (endBlock[chain] < currentBlock) {
      const plspContract = new web3.eth.Contract(tokenABI, tokenAddress[chain]);
      const events = (await plspContract.getPastEvents("Transfer", {
        fromBlock: endBlock[chain] === 0 ? currentBlock : endBlock[chain],
        toBlock: currentBlock,
      })) as EventLog[];

      endBlock[chain] = currentBlock;

      for (const event of events) {
        const from = event.returnValues.from as string;
        const to = event.returnValues.to as string;
        const amount = Number(
          ethers.formatEther(event.returnValues.value as BigNumberish)
        );

        if (to.toLowerCase() === toAddress.toLowerCase()) {
          if (amount > 1) {
            await bot.telegram.sendMessage(
              Config.BotChainGroupID,
              `🚀 *New OC Token Conversion Alert* 🚀\n\n` +
                `✨ User \`${from}\` has successfully joined the OC Token conversion\n\n` +
                `💰 They converted \`${toUSDFormat(amount)}\` of *${
                  tokenName[chain]
                }* Token\n` +
                `🎯 Based on the current rating of \`${
                  rating[chain]
                }\`, they gained *${toUSDFormat(
                  Math.floor(amount * rating[chain])
                )}* OC Tokens 🎉\n\n` +
                `✅ Keep up the great work, \`${from}\` 💪`,
              {
                parse_mode: "MarkdownV2",
              }
            );
          }
        }
      }
    }
  } catch (err) {
    console.error(`Error in scanRankXP ${err}`);
  }
};
const scanTransferToken = (bot: Telegraf<Context>) => {
  setInterval(() => {
    startScan(ChainType.PLS, bot);
    startScan(ChainType.BNB, bot);
  }, 60 * 5 * 1000);
  // startScan(ChainType.PLS, bot);
  // startScan(ChainType.BNB, bot);
};

const OnChainClaimBot = () => {
  const bot = new Telegraf(Config.OnChainBotToken);

  scanTransferToken(bot);

  bot.start((ctx) => {
    ctx.reply("Welcome to the bot!");
  });

  bot.on("message", (ctx) => {
    const chatId = ctx.chat.id;
    console.log({ chatId });
  });

  return bot;
};

export default OnChainClaimBot;
