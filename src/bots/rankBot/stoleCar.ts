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

import CarNickABI from "../../abis/CarNick.json";
import { EventName } from "../../enums/EventName";
import { CarNickType } from "../../types/CarNickType";
import { updateRankXp } from "../../services/userRankService";
import UserRank from "../../models/UserRank";
import { toUSDFormat } from "../../utils";
import { menLinksSmall, womenLinksSmall } from "../../const/avatarLinks";
import { CarsList } from "../../const/cars";
import { City } from "../../const/city";

const sendMessage = async (
  bot: Telegraf<Context<Update>>,
  car: CarNickType,
  user: UserRank,
  chain: ChainType
) => {
  const endpoint = Config.FrontendEndPoint[chain];
  const worth = toUSDFormat(user.worth || 0);
  const img =
    user.gender === 0 ? menLinksSmall[user.img] : womenLinksSmall[user.img];
  const familyText = user.family
    ? `(<a href="${endpoint}family/${user.family}">${user.family}</a>)`
    : "(No family)";
  const carText = `<u>${CarsList[car.carType].carName}</u> (${
    car.damagePercent
  }% damage) in <u>${City[car.cityId]}</u>`;
  const caption = `Expensive car\n\n<a href="${endpoint}profile/${user.name}">${user.name}</a> ${familyText} just stole ${carText}.`;

  await bot.telegram.sendPhoto(
    Config.BotChatId[chain],
    CarsList[car.carType].link,
    {
      caption,
      parse_mode: "HTML",
    }
  );
};

const getPastEvents = async (
  from: number,
  to: number,
  chain: ChainType,
  bot: Telegraf<Context<Update>>
) => {
  const toBlock = Math.min(from + 9000, to);
  const carNickContract = getContract(
    chain,
    CarNickABI,
    Contract.CarNick[chain]
  );

  console.log(`stolecar past event started from ${from} to ${toBlock}`);

  const pastEvents = await carNickContract.getPastEvents(EventName.NewCarNick, {
    fromBlock: from,
    toBlock,
  });

  for (let index = 0; index < pastEvents.length; index++) {
    const event: any = pastEvents[index];
    const succeed =
      event.returnValues.isSuccess && !event.returnValues.isJailed;
    if (succeed) {
      const car: CarNickType = {
        address: event.returnValues.criminal,
        cityId: Number(event.returnValues.cityId),
        carType: Number(event.returnValues.carType),
        damagePercent: Number(event.returnValues.damagePercent),
      };

      const userData = await updateRankXp(car.address, null, chain);
      if (userData && AllowSendMSG) {
        await sendMessage(bot, car, userData, chain);
      }
    }
  }

  await updateBlockNumber(BlockName.StoleCarBlock, toBlock, chain);

  if (toBlock < to) {
    await getPastEvents(from + 9001, to, chain, bot);
  }
};

const start = async (chain: ChainType, bot: Telegraf<Context<Update>>) => {
  try {
    const web3 = new Web3(Config.RPCProvider[chain]);

    const fromBlock = await getBlockNumberFromName(
      BlockName.StoleCarBlock,
      chain
    );
    if (!fromBlock) return;

    const toBlock = await web3.eth.getBlockNumber();

    await getPastEvents(fromBlock + 1, Number(toBlock), chain, bot);
  } catch (err) {
    console.error(`Error in scanStoleCar ${err}`);
  }
};

export const scanStoleCar = async (
  chain: ChainType,
  bot: Telegraf<Context<Update>>
) => {
  setInterval(() => {
    start(chain, bot);
  }, 120 * 1000);
  start(chain, bot);
};
