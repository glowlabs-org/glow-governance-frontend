/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  UQ112x112,
  UQ112x112Interface,
} from "../../../../src/UnifapV2/libraries/UQ112x112";

const _abi = [
  {
    inputs: [],
    name: "Q112",
    outputs: [
      {
        internalType: "uint224",
        name: "",
        type: "uint224",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x6092610033600b8282823980515f1a607314602757634e487b7160e01b5f525f60045260245ffd5b305f52607381538281f3fe73000000000000000000000000000000000000000030146080604052600436106032575f3560e01c80633bf7a83e146036575b5f80fd5b6040600160701b81565b6040516001600160e01b03909116815260200160405180910390f3fea26469706673582212206065d43679943c17ee1a8408230d808081e65b9bb0a52a3c4807c9018742ff9a64736f6c63430008150033";

type UQ112x112ConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: UQ112x112ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class UQ112x112__factory extends ContractFactory {
  constructor(...args: UQ112x112ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<UQ112x112> {
    return super.deploy(overrides || {}) as Promise<UQ112x112>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): UQ112x112 {
    return super.attach(address) as UQ112x112;
  }
  override connect(signer: Signer): UQ112x112__factory {
    return super.connect(signer) as UQ112x112__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): UQ112x112Interface {
    return new utils.Interface(_abi) as UQ112x112Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): UQ112x112 {
    return new Contract(address, _abi, signerOrProvider) as UQ112x112;
  }
}
