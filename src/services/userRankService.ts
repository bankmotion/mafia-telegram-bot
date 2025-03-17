import axios from "axios";
import UserRank from "../models/UserRank";
import { ChainType } from "../enums/ChainType";
import { Config } from "../config/config";

export const getRankXpByUser = async (addr: string, chainType: ChainType) => {
  const data = await UserRank.findOne({
    where: { address: addr, chainType },
    raw: true,
  });
  return data;
};

export const updateRankXp = async (
  addr: string,
  rankXp: number | null,
  chainType: ChainType
) => {
  const data = await UserRank.findOne({
    where: { address: addr, chainType },
  });
  const userData = await axios.get(
    `${Config.BackendEndpoint[chainType]}profile/address/${addr}`
  );
  let familyData;
  if (userData.data.family && userData.data.family !== -1) {
    familyData = await axios.get(
      `${Config.BackendEndpoint[chainType]}family/id/${userData.data.family}`
    );
  }

  if (data) {
    if (rankXp) {
      data.rankXp = rankXp;
    }
    data.family = familyData?.data.familyInfo.name || "";
    data.worth = userData.data?.worth || 0;
    await data.save();
    return data;
  } else {
    if (userData.data) {
      const img = userData.data.imageId || -1;
      const user = {
        address: addr,
        rankXp: rankXp ? rankXp : 0,
        img,
        chainType,
        name: userData.data.name,
        gender: userData.data.gender,
        family: familyData?.data.familyInfo.name || "",
        worth: userData.data.worth,
      };
      const userRank = await UserRank.create(user);
      return userRank;
    }
  }
};
