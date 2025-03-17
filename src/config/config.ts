import * as dotenv from "dotenv";
import { ChainType } from "../enums/ChainType";

dotenv.config();

export const Config = {
  MafiaTGBotToken: process.env.MAFIA_TGBOT_TOKEN || "",

  BotChatId: {
    [ChainType.PLS]: -4717564289,
    [ChainType.BNB]: -4717564289,
  },

  RPCProvider: {
    [ChainType.PLS]: "https://rpc.pulsechain.com",
    [ChainType.BNB]: process.env.BNB_PROVIDER,
  },

  BackendEndpoint: {
    [ChainType.PLS]: "https://backend.pulsemafia.io/",
    [ChainType.BNB]: "https://backend.bnbmafia.io/",
  },

  FrontendEndPoint: {
    [ChainType.PLS]: "https://pulsemafia.io/",
    [ChainType.BNB]: "https://bnbmafia.io/",
  },

  MYSQL: {
    Name: "bot_db",
    User: "root",
    Password: process.env.MYSQL_PASSWORD,
  },
};

export const Contract = {
  RankXP: {
    [ChainType.PLS]: "",
    [ChainType.BNB]: "0xCeA74Da2020C42AbD1f0633ece2C3dcA7c45BC65",
  },
  CarNick: {
    [ChainType.PLS]: "",
    [ChainType.BNB]: "0x0E16b9B89A19C7b70F881c18c80a8934587D6E9F",
  },
  Jail: {
    [ChainType.PLS]: "",
    [ChainType.BNB]: "0x4376020D730d66222ae22140760599cf1FAd4B45",
  },
  Smuggle: {
    [ChainType.PLS]: "",
    [ChainType.BNB]: "0xF2ec62776AC62901fE5Ce027bDa8d40eF8f01142",
  },
};
