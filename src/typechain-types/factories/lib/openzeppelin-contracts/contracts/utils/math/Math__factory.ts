/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  Math,
  MathInterface,
} from "../../../../../../lib/openzeppelin-contracts/contracts/utils/math/Math";

const _abi = [
  {
    inputs: [],
    name: "MathOverflowedMulDiv",
    type: "error",
  },
];

const _bytecode =
  "0x60556032600b8282823980515f1a607314602657634e487b7160e01b5f525f60045260245ffd5b305f52607381538281f3fe730000000000000000000000000000000000000000301460806040525f80fdfea2646970667358221220a0134c9cdda3bfad0ed7f9fd4cdd22245393cd63479ecf453d697369832d47eb64736f6c63430008150033";

type MathConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MathConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Math__factory extends ContractFactory {
  constructor(...args: MathConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<Math> {
    return super.deploy(overrides || {}) as Promise<Math>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): Math {
    return super.attach(address) as Math;
  }
  override connect(signer: Signer): Math__factory {
    return super.connect(signer) as Math__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MathInterface {
    return new utils.Interface(_abi) as MathInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): Math {
    return new Contract(address, _abi, signerOrProvider) as Math;
  }
}
