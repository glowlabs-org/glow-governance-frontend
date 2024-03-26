/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  MerkleConstruction,
  MerkleConstructionInterface,
} from "../../../src/temp/MerkleConstruction";

const _abi = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "newLeaf",
        type: "bytes32",
      },
    ],
    name: "addLeaf",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32[]",
        name: "nodes",
        type: "bytes32[]",
      },
    ],
    name: "calculateMerkleRoot",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "leaves",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "merkleRoot",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "leaf",
        type: "bytes32",
      },
      {
        internalType: "bytes32[]",
        name: "proof",
        type: "bytes32[]",
      },
    ],
    name: "verifyLeaf",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "root",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "leaf",
        type: "bytes32",
      },
      {
        internalType: "bytes32[]",
        name: "proof",
        type: "bytes32[]",
      },
    ],
    name: "verifyLeafFull",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "root",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "leaf",
        type: "bytes32",
      },
      {
        internalType: "bytes32[]",
        name: "proof",
        type: "bytes32[]",
      },
    ],
    name: "verifyLeafFullOZ",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561000f575f80fd5b5061071a8061001d5f395ff3fe608060405234801561000f575f80fd5b506004361061007a575f3560e01c80632eb4a7ab116100585780632eb4a7ab146100cc57806335e29c88146100e2578063d455a79d146100f5578063ea94934614610108575f80fd5b80630112d77a1461007e5780631a86e784146100a65780632b6d95e3146100b9575b5f80fd5b61009161008c3660046104b2565b61011d565b60405190151581526020015b60405180910390f35b6100916100b43660046104fa565b610133565b6100916100c73660046104fa565b610149565b6100d45f5481565b60405190815260200161009d565b6100d46100f036600461055d565b610156565b6100d4610103366004610616565b610312565b61011b610116366004610616565b610331565b005b5f61012b83835f54876103bc565b949350505050565b5f610140838387876103f4565b95945050505050565b5f610140838387876103bc565b5f808251116101ab5760405162461bcd60e51b815260206004820152601f60248201527f4e6f206c656176657320746f2063616c63756c61746520726f6f7420666f7200604482015260640160405180910390fd5b6001825111156102f1575f600283516101c49190610655565b90505f5b8181101561028457836101dc826002610668565b815181106101ec576101ec61067f565b6020026020010151848260026102029190610668565b61020d906001610693565b8151811061021d5761021d61067f565b602002602001015160405160200161023f929190918252602082015260400190565b604051602081830303815290604052805190602001208482815181106102675761026761067f565b60209081029190910101528061027c816106a6565b9150506101c8565b506002835161029391906106be565b6001036102ea5782600184516102a991906106d1565b815181106102b9576102b961067f565b60200260200101518382815181106102d3576102d361067f565b60209081029190910101526102e7816106a6565b90505b82526101ab565b815f815181106103035761030361067f565b60200260200101519050919050565b60018181548110610321575f80fd5b5f91825260209091200154905081565b6001805480820182555f8290527fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6018290558054604080516020838102820181019092528281526103b793909290918301828280156103ad57602002820191905f5260205f20905b815481526020019060010190808311610399575b5050505050610156565b5f5550565b5f83156103ec578360051b8501855b803580851160051b94855260209485185260405f2093018181106103cb5750505b501492915050565b5f8261040186868561040b565b1495945050505050565b5f81815b8481101561044d576104398287878481811061042d5761042d61067f565b90506020020135610456565b915080610445816106a6565b91505061040f565b50949350505050565b5f8281526020829052604090205b92915050565b5f8083601f84011261047a575f80fd5b50813567ffffffffffffffff811115610491575f80fd5b6020830191508360208260051b85010111156104ab575f80fd5b9250929050565b5f805f604084860312156104c4575f80fd5b83359250602084013567ffffffffffffffff8111156104e1575f80fd5b6104ed8682870161046a565b9497909650939450505050565b5f805f806060858703121561050d575f80fd5b8435935060208501359250604085013567ffffffffffffffff811115610531575f80fd5b61053d8782880161046a565b95989497509550505050565b634e487b7160e01b5f52604160045260245ffd5b5f602080838503121561056e575f80fd5b823567ffffffffffffffff80821115610585575f80fd5b818501915085601f830112610598575f80fd5b8135818111156105aa576105aa610549565b8060051b604051601f19603f830116810181811085821117156105cf576105cf610549565b6040529182528482019250838101850191888311156105ec575f80fd5b938501935b8285101561060a578435845293850193928501926105f1565b98975050505050505050565b5f60208284031215610626575f80fd5b5035919050565b634e487b7160e01b5f52601260045260245ffd5b634e487b7160e01b5f52601160045260245ffd5b5f826106635761066361062d565b500490565b808202811582820484141761046457610464610641565b634e487b7160e01b5f52603260045260245ffd5b8082018082111561046457610464610641565b5f600182016106b7576106b7610641565b5060010190565b5f826106cc576106cc61062d565b500690565b818103818111156104645761046461064156fea264697066735822122036b73744a5d646e40a9bd147963fa4cdcdf2fb34fecc88e6314687676961bb8664736f6c63430008150033";

type MerkleConstructionConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MerkleConstructionConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class MerkleConstruction__factory extends ContractFactory {
  constructor(...args: MerkleConstructionConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<MerkleConstruction> {
    return super.deploy(overrides || {}) as Promise<MerkleConstruction>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): MerkleConstruction {
    return super.attach(address) as MerkleConstruction;
  }
  override connect(signer: Signer): MerkleConstruction__factory {
    return super.connect(signer) as MerkleConstruction__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MerkleConstructionInterface {
    return new utils.Interface(_abi) as MerkleConstructionInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MerkleConstruction {
    return new Contract(address, _abi, signerOrProvider) as MerkleConstruction;
  }
}
