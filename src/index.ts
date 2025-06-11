import MafiaBot from "./bots/mafia_rank_bot";
import OnChainClaimBot from "./bots/onchain_claim_bot";
try {
  const mafiaBot = MafiaBot();
  mafiaBot.launch();

  const bot = OnChainClaimBot();
  bot.launch();
} catch (err) {
  console.error(err);
}

console.log("Bot is running now");
