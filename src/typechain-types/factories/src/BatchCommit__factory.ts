/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { BatchCommit, BatchCommitInterface } from "../../src/BatchCommit";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "gcc",
        type: "address",
      },
      {
        internalType: "address",
        name: "usdc",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "GCCEmission",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "USDCEmission",
    type: "event",
  },
  {
    inputs: [],
    name: "GCC",
    outputs: [
      {
        internalType: "contract IGCC",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "USDC",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "rewardAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "minImpactPower",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "commitGCC",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "rewardAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "minImpactPower",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "commitUSDC",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60c060405234801561000f575f80fd5b506040516107fc3803806107fc83398101604081905261002e91610060565b6001600160a01b039182166080521660a052610091565b80516001600160a01b038116811461005b575f80fd5b919050565b5f8060408385031215610071575f80fd5b61007a83610045565b915061008860208401610045565b90509250929050565b60805160a0516107146100e85f395f8181607b01528181610264015281816102fa01528181610384015261044b01525f818160be01528181610102015281816101a20152818161041901526104e501526107145ff3fe608060405234801561000f575f80fd5b506004361061004a575f3560e01c806329f048b41461004e5780636d1e66431461006357806389a3027114610076578063dc847fbb146100b9575b5f80fd5b61006161005c366004610593565b6100e0565b005b610061610071366004610593565b61024d565b61009d7f000000000000000000000000000000000000000000000000000000000000000081565b6040516001600160a01b03909116815260200160405180910390f35b61009d7f000000000000000000000000000000000000000000000000000000000000000081565b6040516323b872dd60e01b8152336004820152306024820152604481018690527f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316906323b872dd906064016020604051808303815f875af1158015610150573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190610174919061062c565b5060405163132a688d60e21b8152600481018690526001600160a01b038581166024830152604482018590527f00000000000000000000000000000000000000000000000000000000000000001690634ca9a2349060640160408051808303815f875af11580156101e7573d5f803e3d5ffd5b505050506040513d601f19601f8201168201806040525081019061020b9190610652565b50507f6af1c886f3eaa1d8d62a8778f1f7506afbcfbacfb5b591c14762415d919b5c32828260405161023e929190610674565b60405180910390a15050505050565b6040516370a0823160e01b81523060048201525f907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316906370a0823190602401602060405180830381865afa1580156102b1573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906102d591906106a2565b6040516323b872dd60e01b8152336004820152306024820152604481018890529091507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316906323b872dd906064016020604051808303815f875af1158015610348573d5f803e3d5ffd5b505050506040513d601f19601f8201168201806040525081019061036c919061062c565b506040516370a0823160e01b81523060048201525f907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316906370a0823190602401602060405180830381865afa1580156103d1573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906103f591906106a2565b90505f61040283836106b9565b60405163095ea7b360e01b81526001600160a01b037f000000000000000000000000000000000000000000000000000000000000000081166004830152602482018390529192507f00000000000000000000000000000000000000000000000000000000000000009091169063095ea7b3906044016020604051808303815f875af1158015610493573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906104b7919061062c565b5060405163150f756360e31b8152600481018290526001600160a01b038881166024830152604482018890527f0000000000000000000000000000000000000000000000000000000000000000169063a87bab18906064016020604051808303815f875af115801561052b573d5f803e3d5ffd5b505050506040513d601f19601f8201168201806040525081019061054f91906106a2565b507f30aae68dec5cd264d3fd9499425eb8680fa30246da8bf16677c5d25b434e20428585604051610581929190610674565b60405180910390a15050505050505050565b5f805f805f608086880312156105a7575f80fd5b8535945060208601356001600160a01b03811681146105c4575f80fd5b935060408601359250606086013567ffffffffffffffff808211156105e7575f80fd5b818801915088601f8301126105fa575f80fd5b813581811115610608575f80fd5b896020828501011115610619575f80fd5b9699959850939650602001949392505050565b5f6020828403121561063c575f80fd5b8151801515811461064b575f80fd5b9392505050565b5f8060408385031215610663575f80fd5b505080516020909101519092909150565b60208152816020820152818360408301375f818301604090810191909152601f909201601f19160101919050565b5f602082840312156106b2575f80fd5b5051919050565b818103818111156106d857634e487b7160e01b5f52601160045260245ffd5b9291505056fea2646970667358221220db0e4aa1fe9243b4e55fa2f09080d9165e2b7ae7a767be07bead0b89c9bf51fe64736f6c63430008150033";

type BatchCommitConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: BatchCommitConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class BatchCommit__factory extends ContractFactory {
  constructor(...args: BatchCommitConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    gcc: string,
    usdc: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<BatchCommit> {
    return super.deploy(gcc, usdc, overrides || {}) as Promise<BatchCommit>;
  }
  override getDeployTransaction(
    gcc: string,
    usdc: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(gcc, usdc, overrides || {});
  }
  override attach(address: string): BatchCommit {
    return super.attach(address) as BatchCommit;
  }
  override connect(signer: Signer): BatchCommit__factory {
    return super.connect(signer) as BatchCommit__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): BatchCommitInterface {
    return new utils.Interface(_abi) as BatchCommitInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): BatchCommit {
    return new Contract(address, _abi, signerOrProvider) as BatchCommit;
  }
}
