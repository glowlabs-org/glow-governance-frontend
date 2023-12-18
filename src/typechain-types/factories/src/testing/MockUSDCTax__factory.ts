/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  MockUSDCTax,
  MockUSDCTaxInterface,
} from "../../../src/testing/MockUSDCTax";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "currentAllowance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "requestedDecrease",
        type: "uint256",
      },
    ],
    name: "ERC20FailedDecreaseAllowance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "allowance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "needed",
        type: "uint256",
      },
    ],
    name: "ERC20InsufficientAllowance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "needed",
        type: "uint256",
      },
    ],
    name: "ERC20InsufficientBalance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "approver",
        type: "address",
      },
    ],
    name: "ERC20InvalidApprover",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "ERC20InvalidReceiver",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "ERC20InvalidSender",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "ERC20InvalidSpender",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
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
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
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
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "requestedDecrease",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "taxDenominator",
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
    name: "taxNumerator",
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
    name: "totalSupply",
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
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x6080604052606460055561271060065534801561001a575f80fd5b506040805180820182526004808252635553444360e01b60208084018290528451808601909552918452908301529060036100558382610104565b5060046100628282610104565b5050506101bf565b634e487b7160e01b5f52604160045260245ffd5b600181811c9082168061009257607f821691505b6020821081036100b057634e487b7160e01b5f52602260045260245ffd5b50919050565b601f8211156100ff575f81815260208120601f850160051c810160208610156100dc5750805b601f850160051c820191505b818110156100fb578281556001016100e8565b5050505b505050565b81516001600160401b0381111561011d5761011d61006a565b6101318161012b845461007e565b846100b6565b602080601f831160018114610164575f841561014d5750858301515b5f19600386901b1c1916600185901b1785556100fb565b5f85815260208120601f198616915b8281101561019257888601518255948401946001909101908401610173565b50858210156101af57878501515f19600388901b60f8161c191681555b5050505050600190811b01905550565b6108ce806101cc5f395ff3fe608060405234801561000f575f80fd5b50600436106100e5575f3560e01c806370a0823111610088578063a457c2d711610063578063a457c2d7146101bf578063a9059cbb146101d2578063b361b2b5146101e5578063dd62ed3e146101ee575f80fd5b806370a082311461018657806395d89b41146101ae5780639631af0b146101b6575f80fd5b806323b872dd116100c357806323b872dd1461013c578063313ce5671461014f578063395093511461015e57806340c10f1914610171575f80fd5b806306fdde03146100e9578063095ea7b31461010757806318160ddd1461012a575b5f80fd5b6100f1610201565b6040516100fe91906106d8565b60405180910390f35b61011a61011536600461073e565b610291565b60405190151581526020016100fe565b6002545b6040519081526020016100fe565b61011a61014a366004610766565b6102aa565b604051600681526020016100fe565b61011a61016c36600461073e565b6102cd565b61018461017f36600461073e565b6102ee565b005b61012e61019436600461079f565b6001600160a01b03165f9081526020819052604090205490565b6100f16102fc565b61012e60055481565b61011a6101cd36600461073e565b61030b565b61011a6101e036600461073e565b610366565b61012e60065481565b61012e6101fc3660046107bf565b610373565b606060038054610210906107f0565b80601f016020809104026020016040519081016040528092919081815260200182805461023c906107f0565b80156102875780601f1061025e57610100808354040283529160200191610287565b820191905f5260205f20905b81548152906001019060200180831161026a57829003601f168201915b5050505050905090565b5f3361029e81858561039d565b60019150505b92915050565b5f336102b78582856103af565b6102c2858585610412565b506001949350505050565b5f3361029e8185856102df8383610373565b6102e9919061083c565b61039d565b6102f882826104ac565b5050565b606060048054610210906107f0565b5f33816103188286610373565b90508381101561035957604051632983c0c360e21b81526001600160a01b038616600482015260248101829052604481018590526064015b60405180910390fd5b6102c2828686840361039d565b5f3361029e818585610412565b6001600160a01b039182165f90815260016020908152604080832093909416825291909152205490565b6103aa83838360016104e0565b505050565b5f6103ba8484610373565b90505f19811461040c57818110156103fe57604051637dc7a0d960e11b81526001600160a01b03841660048201526024810182905260448101839052606401610350565b61040c84848484035f6104e0565b50505050565b6001600160a01b03831661043b57604051634b637e8f60e11b81525f6004820152602401610350565b6001600160a01b0382166104645760405163ec442f0560e01b81525f6004820152602401610350565b5f60065460055483610476919061084f565b6104809190610866565b90505f61048d8284610885565b905061049a8530846105b2565b6104a58585836105b2565b5050505050565b6001600160a01b0382166104d55760405163ec442f0560e01b81525f6004820152602401610350565b6102f85f83836105b2565b6001600160a01b0384166105095760405163e602df0560e01b81525f6004820152602401610350565b6001600160a01b03831661053257604051634a1406b160e11b81525f6004820152602401610350565b6001600160a01b038085165f908152600160209081526040808320938716835292905220829055801561040c57826001600160a01b0316846001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925846040516105a491815260200190565b60405180910390a350505050565b6001600160a01b0383166105dc578060025f8282546105d1919061083c565b9091555061064c9050565b6001600160a01b0383165f908152602081905260409020548181101561062e5760405163391434e360e21b81526001600160a01b03851660048201526024810182905260448101839052606401610350565b6001600160a01b0384165f9081526020819052604090209082900390555b6001600160a01b03821661066857600280548290039055610686565b6001600160a01b0382165f9081526020819052604090208054820190555b816001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040516106cb91815260200190565b60405180910390a3505050565b5f6020808352835180828501525f5b81811015610703578581018301518582016040015282016106e7565b505f604082860101526040601f19601f8301168501019250505092915050565b80356001600160a01b0381168114610739575f80fd5b919050565b5f806040838503121561074f575f80fd5b61075883610723565b946020939093013593505050565b5f805f60608486031215610778575f80fd5b61078184610723565b925061078f60208501610723565b9150604084013590509250925092565b5f602082840312156107af575f80fd5b6107b882610723565b9392505050565b5f80604083850312156107d0575f80fd5b6107d983610723565b91506107e760208401610723565b90509250929050565b600181811c9082168061080457607f821691505b60208210810361082257634e487b7160e01b5f52602260045260245ffd5b50919050565b634e487b7160e01b5f52601160045260245ffd5b808201808211156102a4576102a4610828565b80820281158282048414176102a4576102a4610828565b5f8261088057634e487b7160e01b5f52601260045260245ffd5b500490565b818103818111156102a4576102a461082856fea2646970667358221220f677f525517b0d9f1141dedc869d53895244ff47e4f9a30db0b9438da0bf203464736f6c63430008150033";

type MockUSDCTaxConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MockUSDCTaxConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class MockUSDCTax__factory extends ContractFactory {
  constructor(...args: MockUSDCTaxConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<MockUSDCTax> {
    return super.deploy(overrides || {}) as Promise<MockUSDCTax>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): MockUSDCTax {
    return super.attach(address) as MockUSDCTax;
  }
  override connect(signer: Signer): MockUSDCTax__factory {
    return super.connect(signer) as MockUSDCTax__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MockUSDCTaxInterface {
    return new utils.Interface(_abi) as MockUSDCTaxInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MockUSDCTax {
    return new Contract(address, _abi, signerOrProvider) as MockUSDCTax;
  }
}
