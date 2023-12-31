/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IEarlyLiquidity,
  IEarlyLiquidityInterface,
} from "../../../src/interfaces/IEarlyLiquidity";

const _abi = [
  {
    inputs: [],
    name: "AllSold",
    type: "error",
  },
  {
    inputs: [],
    name: "MinerPoolAlreadySet",
    type: "error",
  },
  {
    inputs: [],
    name: "ModNotZero",
    type: "error",
  },
  {
    inputs: [],
    name: "PriceTooHigh",
    type: "error",
  },
  {
    inputs: [],
    name: "TooManyIncrements",
    type: "error",
  },
  {
    inputs: [],
    name: "ZeroAddress",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "glwReceived",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalUSDCSpent",
        type: "uint256",
      },
    ],
    name: "Purchase",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "increments",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxCost",
        type: "uint256",
      },
    ],
    name: "buy",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getCurrentPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "increments",
        type: "uint256",
      },
    ],
    name: "getPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSold",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export class IEarlyLiquidity__factory {
  static readonly abi = _abi;
  static createInterface(): IEarlyLiquidityInterface {
    return new utils.Interface(_abi) as IEarlyLiquidityInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IEarlyLiquidity {
    return new Contract(address, _abi, signerOrProvider) as IEarlyLiquidity;
  }
}
