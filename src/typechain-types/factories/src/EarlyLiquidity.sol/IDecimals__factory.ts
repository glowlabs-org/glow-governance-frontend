/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IDecimals,
  IDecimalsInterface,
} from "../../../src/EarlyLiquidity.sol/IDecimals";

const _abi = [
  {
    inputs: [],
    name: "IncorrectDecimals",
    type: "error",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export class IDecimals__factory {
  static readonly abi = _abi;
  static createInterface(): IDecimalsInterface {
    return new utils.Interface(_abi) as IDecimalsInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IDecimals {
    return new Contract(address, _abi, signerOrProvider) as IDecimals;
  }
}
