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
};
