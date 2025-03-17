import { ChainType } from "../enums/ChainType";
import BlockInfo from "../models/BlockInfo";

export const getBlockNumberFromName = async (
  name: string,
  chainType: ChainType
) => {
  let block: BlockInfo | null;
  block = await BlockInfo.findOne({ where: { name }, raw: true });

  return chainType === ChainType.PLS ? block?.plsBlock : block?.bnbBlock;
};

export const updateBlockNumber = async (
  name: string,
  block: number,
  chainType: ChainType
) => {
  if (chainType === ChainType.PLS) {
    await BlockInfo.update({ plsBlock: block }, { where: { name } });
  } else {
    await BlockInfo.update({ bnbBlock: block }, { where: { name } });
  }
};
