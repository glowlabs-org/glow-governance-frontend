export const CarbonCreditDescendingPriceAuctionABI = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'glow',
        type: 'address',
        internalType: 'contract IERC20',
      },
      {
        name: 'gcc',
        type: 'address',
        internalType: 'contract IERC20',
      },
      {
        name: 'startingPrice',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'GCC',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IERC20',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'GLOW',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IERC20',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'SALE_UNIT',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'buyGCC',
    inputs: [
      {
        name: 'unitsToBuy',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'maxPricePerUnit',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getPricePerUnit',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'pseudoPrice24HoursAgo',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'receiveGCC',
    inputs: [
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'timestamps',
    inputs: [],
    outputs: [
      {
        name: 'lastSaleTimestamp',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'lastReceivedTimestamp',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'lastPriceChangeTimestamp',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'firstReceivedTimestamp',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalAmountReceived',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalSaleUnits',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalSupply',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalUnitsSold',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'unitsForSale',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'error',
    name: 'CallerNotGCC',
    inputs: [],
  },
  {
    type: 'error',
    name: 'CannotBuyZeroUnits',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotEnoughGCCForSale',
    inputs: [],
  },
  {
    type: 'error',
    name: 'UserPriceNotHighEnough',
    inputs: [],
  },
]
