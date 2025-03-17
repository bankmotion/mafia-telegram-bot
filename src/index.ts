import MafiaBot from "./bots/mafia_rank_bot";

try {
  const bot = MafiaBot();
  bot.launch();
} catch (err) {
  console.error(err);
}

console.log("Bot is running now");
