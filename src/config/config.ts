import * as dotenv from "dotenv";

dotenv.config();

export const Config = {
  MafiaTGBotToken: process.env.MAFIA_TGBOT_TOKEN || "",
};
