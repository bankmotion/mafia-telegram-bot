import * as dotenv from "dotenv";
import { ChainType } from "../enums/ChainType";

dotenv.config();

export const AllowSendMSG = true;

export const Config = {
  MafiaTGBotToken: process.env.MAFIA_TGBOT_TOKEN || "",
  OnChainBotToken: process.env.ONCHAIN_BOT_TOKEN || "",

  BotChatId: {
    [ChainType.PLS]: -1001939196872,
    [ChainType.BNB]: -1002105055432,
    // [ChainType.PLS]: -1002688244422,
    // [ChainType.BNB]: -1002688244422,
  },
  BotChainGroupID: -1002688074997,

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

  Addresses: ["0x048c2aC5F5F7DE81074bA1fEEAeFDFF395401F96"],
};

export const Contract = {
  RankXP: {
    [ChainType.PLS]: "0x74eADd7ebeeED638FD7c413134FA3D3433699D92",
    [ChainType.BNB]: "0x48F2C9C0ea337854492aF5bEbEa74e8917712B71",
  },
  CarNick: {
    [ChainType.PLS]: "0x2bf1EEaa4e1D7502AeF7f5beCCf64356eDb4a8c8",
    [ChainType.BNB]: "0x60B8e0dd9566b42F9CAa5538350aA0D29988373c",
  },
  Jail: {
    [ChainType.PLS]: "0xDCD5E9c0b2b4E9Cb93677A258521D854b3A9f5A1",
    [ChainType.BNB]: "0x7371580cd13dE739C734AE85062F75194d13Fac2",
  },
  Smuggle: {
    [ChainType.PLS]: "0x9bf722B3350832ae9023B7C9762227bE33943d09",
    [ChainType.BNB]: "0x36b09f1854CF3614Eb8d10fFae847511BB08868e",
  },
  Crime: {
    [ChainType.PLS]: "0xf077d4d0508505c5a80249aFC10bc6Ead90E47F1",
    [ChainType.BNB]: "0x167ad284C7bcc4d6342991Aa258422E7a04f926E",
  },
};
