/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  ECDSA,
  ECDSAInterface,
} from "../../../../../../lib/openzeppelin-contracts/contracts/utils/cryptography/ECDSA";

const _abi = [
  {
    inputs: [],
    name: "ECDSAInvalidSignature",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "length",
        type: "uint256",
      },
    ],
    name: "ECDSAInvalidSignatureLength",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
    ],
    name: "ECDSAInvalidSignatureS",
    type: "error",
  },
];

const _bytecode =
  "0x60556032600b8282823980515f1a607314602657634e487b7160e01b5f525f60045260245ffd5b305f52607381538281f3fe730000000000000000000000000000000000000000301460806040525f80fdfea264697066735822122053d25fddc50bf1923b927d95837ccca19467c1c899a26ac03178ed176b0fd30464736f6c63430008150033";

type ECDSAConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ECDSAConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ECDSA__factory extends ContractFactory {
  constructor(...args: ECDSAConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ECDSA> {
    return super.deploy(overrides || {}) as Promise<ECDSA>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): ECDSA {
    return super.attach(address) as ECDSA;
  }
  override connect(signer: Signer): ECDSA__factory {
    return super.connect(signer) as ECDSA__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ECDSAInterface {
    return new utils.Interface(_abi) as ECDSAInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): ECDSA {
    return new Contract(address, _abi, signerOrProvider) as ECDSA;
  }
}