import { Web3 } from "web3";
import { ChainType } from "../enums/ChainType";
import { Config } from "../config/config";

export const getContract = (
  chain: ChainType,
  abi: any,
  contractAddr: string
) => {
  const web3 = new Web3(Config.RPCProvider[chain]);
  const contract = new web3.eth.Contract(abi, contractAddr);

  return contract;
};
