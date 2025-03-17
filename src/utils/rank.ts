import { RankXP, RankXPName } from "../const/rank";

export const getRankXpByValue = (xpValue: number) => {
  const targetIndex = RankXP.filter((rank) => xpValue >= rank).length;
  return { targetIndex, name: RankXPName[targetIndex - 1] };
};
