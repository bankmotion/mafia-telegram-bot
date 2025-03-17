import MafiaBot from "./bots/mafia_rank_bot";

const bot = MafiaBot();
if (bot) {
  bot.launch();
}
console.log("Bot is running now");
