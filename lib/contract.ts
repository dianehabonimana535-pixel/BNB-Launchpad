/**
 * Compiled artifact for BEP20MemeToken.sol (contracts/BEP20MemeToken.sol
 * in this repo — kept for reference/auditing, not used at runtime).
 *
 * This is the on-chain equivalent of Solana's already-deployed SPL Token
 * + Metaplex Token Metadata programs: on Solana those programs already
 * exist on-chain and every "mint" is just a call into them. BNB Smart
 * Chain has no equivalent shared program, so instead every token created
 * on this launchpad deploys its own fresh instance of this same, fixed,
 * pre-audited-by-you-once bytecode. The frontend never touches raw
 * Solidity or needs a build toolchain (Hardhat/Foundry) at deploy time —
 * it just sends this bytecode + constructor args from the user's own
 * wallet, exactly like a Solana transaction is built client-side and
 * signed by Phantom.
 *
 * Compiled with solc 0.8.26, optimizer enabled (runs: 200).
 * Regenerate by editing contracts/BEP20MemeToken.sol and recompiling with
 * solc, then pasting the new abi/bytecode below.
 */

export const BEP20MEMETOKEN_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_symbol",
        "type": "string"
      },
      {
        "internalType": "uint8",
        "name": "_decimals",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "_initialSupply",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_recipient",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_metadataURI",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "_authority",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "_revokeMint",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "_revokeFreeze",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "_revokeUpdate",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "AccountFrozen",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "AccountUnfrozen",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "FreezeAuthorityRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "newUri",
        "type": "string"
      }
    ],
    "name": "MetadataUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "MintAuthorityRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "UpdateAuthorityRevoked",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "freeze",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "freezeAuthority",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getOwner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "isFrozen",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "metadataURI",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "mintAuthority",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "revokeFreezeAuthority",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "revokeMintAuthority",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "revokeUpdateAuthority",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "unfreeze",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "updateAuthority",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "newUri",
        "type": "string"
      }
    ],
    "name": "updateMetadata",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const BEP20MEMETOKEN_BYTECODE = "0x608060405234801561000f575f80fd5b5060405161150438038061150483398101604081905261002e916103a0565b6001600160a01b03861661009b5760405162461bcd60e51b815260206004820152602960248201527f42455032304d656d65546f6b656e3a20726563697069656e74206973207a65726044820152686f206164647265737360b81b60648201526084015b60405180910390fd5b6001600160a01b0384166101035760405162461bcd60e51b815260206004820152602960248201527f42455032304d656d65546f6b656e3a20617574686f72697479206973207a65726044820152686f206164647265737360b81b6064820152608401610092565b5f61010e8b82610520565b50600161011b8a82610520565b506002805460ff191660ff8a1617905560046101378682610520565b506101428688610243565b600580546001600160a01b0386166001600160a01b031991821681179092556006805482168317905560078054909116909117905582156101b657600580546001600160a01b03191690556040517fe60cda49358d35f082dc1801cff80c5c62b6dd369405c7e80d749237412c2890905f90a15b81156101f557600680546001600160a01b03191690556040517f44a7cc43b9dde8562c1d95a638720af292e565aed2e4e8caae9da94503c14066905f90a15b801561023457600780546001600160a01b03191690556040517f1d3f494043441636d1f19de438e718fd1e7400eecbadd3a7eeea5dadfa46d787905f90a15b505050505050505050506105ff565b8060035f82825461025491906105da565b90915550506001600160a01b0382165f90815260086020526040812080548392906102809084906105da565b90915550506040518181526001600160a01b038316905f907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a35050565b634e487b7160e01b5f52604160045260245ffd5b5f82601f8301126102ec575f80fd5b81516001600160401b03811115610305576103056102c9565b604051601f8201601f19908116603f011681016001600160401b0381118282101715610333576103336102c9565b60405281815283820160200185101561034a575f80fd5b8160208501602083015e5f918101602001919091529392505050565b805160ff81168114610376575f80fd5b919050565b80516001600160a01b0381168114610376575f80fd5b80518015158114610376575f80fd5b5f805f805f805f805f806101408b8d0312156103ba575f80fd5b8a516001600160401b038111156103cf575f80fd5b6103db8d828e016102dd565b60208d0151909b5090506001600160401b038111156103f8575f80fd5b6104048d828e016102dd565b99505061041360408c01610366565b60608c0151909850965061042960808c0161037b565b60a08c01519096506001600160401b03811115610444575f80fd5b6104508d828e016102dd565b95505061045f60c08c0161037b565b935061046d60e08c01610391565b925061047c6101008c01610391565b915061048b6101208c01610391565b90509295989b9194979a5092959850565b600181811c908216806104b057607f821691505b6020821081036104ce57634e487b7160e01b5f52602260045260245ffd5b50919050565b601f82111561051b57805f5260205f20601f840160051c810160208510156104f95750805b601f840160051c820191505b81811015610518575f8155600101610505565b50505b505050565b81516001600160401b03811115610539576105396102c9565b61054d81610547845461049c565b846104d4565b6020601f82116001811461057f575f83156105685750848201515b5f19600385901b1c1916600184901b178455610518565b5f84815260208120601f198516915b828110156105ae578785015182556020948501946001909201910161058e565b50848210156105cb57868401515f19600387901b60f8161c191681555b50505050600190811b01905550565b808201808211156105f957634e487b7160e01b5f52601160045260245ffd5b92915050565b610ef88061060c5f395ff3fe608060405234801561000f575f80fd5b506004361061013d575f3560e01c806362e55047116100b45780639340b21e116100795780639340b21e1461029457806395d89b41146102a7578063a9059cbb146102af578063dd62ed3e146102c2578063e5839836146102ec578063f4ff84e01461030e575f80fd5b806362e550471461023657806370a082311461023e578063893d20e81461025d5780638d1fdf2f1461026e578063918b5be114610281575f80fd5b806319394e9b1161010557806319394e9b146101ab57806323b872dd146101d65780632bc88f4d146101e9578063313ce567146101f157806340c10f191461021057806345c8b1a614610223575f80fd5b806303ee438c1461014157806306fdde031461015f578063095ea7b3146101675780631350ec4c1461018a57806318160ddd14610194575b5f80fd5b610149610321565b6040516101569190610acd565b60405180910390f35b6101496103ad565b61017a610175366004610b1d565b6103b9565b6040519015158152602001610156565b610192610425565b005b61019d60035481565b604051908152602001610156565b6006546101be906001600160a01b031681565b6040516001600160a01b039091168152602001610156565b61017a6101e4366004610b45565b610492565b610192610560565b6002546101fe9060ff1681565b60405160ff9091168152602001610156565b61019261021e366004610b1d565b6105c4565b610192610231366004610b7f565b6105fc565b61019261066e565b61019d61024c366004610b7f565b60086020525f908152604090205481565b6005546001600160a01b03166101be565b61019261027c366004610b7f565b6106d2565b61019261028f366004610b9f565b610747565b6005546101be906001600160a01b031681565b6101496107bc565b61017a6102bd366004610b1d565b6107c9565b61019d6102d0366004610c0d565b600960209081525f928352604080842090915290825290205481565b61017a6102fa366004610b7f565b600a6020525f908152604090205460ff1681565b6007546101be906001600160a01b031681565b6004805461032e90610c3e565b80601f016020809104026020016040519081016040528092919081815260200182805461035a90610c3e565b80156103a55780601f1061037c576101008083540402835291602001916103a5565b820191905f5260205f20905b81548152906001019060200180831161038857829003601f168201915b505050505081565b5f805461032e90610c3e565b335f8181526009602090815260408083206001600160a01b038716808552925280832085905551919290917f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925906104139086815260200190565b60405180910390a35060015b92915050565b6007546001600160a01b031633146104585760405162461bcd60e51b815260040161044f90610c76565b60405180910390fd5b600780546001600160a01b03191690556040517f1d3f494043441636d1f19de438e718fd1e7400eecbadd3a7eeea5dadfa46d787905f90a1565b6001600160a01b0383165f908152600960209081526040808320338452909152812054828110156105145760405162461bcd60e51b815260206004820152602660248201527f42455032304d656d65546f6b656e3a20696e73756666696369656e7420616c6c6044820152656f77616e636560d01b606482015260840161044f565b5f19811461054a576105268382610cce565b6001600160a01b0386165f9081526009602090815260408083203384529091529020555b6105558585856107de565b506001949350505050565b6006546001600160a01b0316331461058a5760405162461bcd60e51b815260040161044f90610ce1565b600680546001600160a01b03191690556040517f44a7cc43b9dde8562c1d95a638720af292e565aed2e4e8caae9da94503c14066905f90a1565b6005546001600160a01b031633146105ee5760405162461bcd60e51b815260040161044f90610d25565b6105f88282610a47565b5050565b6006546001600160a01b031633146106265760405162461bcd60e51b815260040161044f90610ce1565b6001600160a01b0381165f818152600a6020526040808220805460ff19169055517ff915cd9fe234de6e8d3afe7bf2388d35b2b6d48e8c629a24602019bde79c213a9190a250565b6005546001600160a01b031633146106985760405162461bcd60e51b815260040161044f90610d25565b600580546001600160a01b03191690556040517fe60cda49358d35f082dc1801cff80c5c62b6dd369405c7e80d749237412c2890905f90a1565b6006546001600160a01b031633146106fc5760405162461bcd60e51b815260040161044f90610ce1565b6001600160a01b0381165f818152600a6020526040808220805460ff19166001179055517f4f2a367e694e71282f29ab5eaa04c4c0be45ac5bf2ca74fb67068b98bdc2887d9190a250565b6007546001600160a01b031633146107715760405162461bcd60e51b815260040161044f90610c76565b600461077e828483610dc7565b507f1c306e70c05992619e2128ad1ef88df75f36c9476282e59f51401b2abaa42e4e82826040516107b0929190610e81565b60405180910390a15050565b6001805461032e90610c3e565b5f6107d53384846107de565b50600192915050565b6001600160a01b0382166108455760405162461bcd60e51b815260206004820152602860248201527f42455032304d656d65546f6b656e3a207472616e7366657220746f207a65726f604482015267206164647265737360c01b606482015260840161044f565b6001600160a01b0383165f908152600a602052604090205460ff16156108be5760405162461bcd60e51b815260206004820152602860248201527f42455032304d656d65546f6b656e3a2073656e646572206163636f756e7420696044820152673990333937bd32b760c11b606482015260840161044f565b6001600160a01b0382165f908152600a602052604090205460ff161561093a5760405162461bcd60e51b815260206004820152602b60248201527f42455032304d656d65546f6b656e3a20726563697069656e74206163636f756e60448201526a3a1034b990333937bd32b760a91b606482015260840161044f565b6001600160a01b0383165f90815260086020526040902054818110156109ae5760405162461bcd60e51b8152602060048201526024808201527f42455032304d656d65546f6b656e3a20696e73756666696369656e742062616c604482015263616e636560e01b606482015260840161044f565b6109b88282610cce565b6001600160a01b038086165f9081526008602052604080822093909355908516815290812080548492906109ed908490610eaf565b92505081905550826001600160a01b0316846001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef84604051610a3991815260200190565b60405180910390a350505050565b8060035f828254610a589190610eaf565b90915550506001600160a01b0382165f9081526008602052604081208054839290610a84908490610eaf565b90915550506040518181526001600160a01b038316905f907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a35050565b602081525f82518060208401528060208501604085015e5f604082850101526040601f19601f83011684010191505092915050565b80356001600160a01b0381168114610b18575f80fd5b919050565b5f8060408385031215610b2e575f80fd5b610b3783610b02565b946020939093013593505050565b5f805f60608486031215610b57575f80fd5b610b6084610b02565b9250610b6e60208501610b02565b929592945050506040919091013590565b5f60208284031215610b8f575f80fd5b610b9882610b02565b9392505050565b5f8060208385031215610bb0575f80fd5b823567ffffffffffffffff811115610bc6575f80fd5b8301601f81018513610bd6575f80fd5b803567ffffffffffffffff811115610bec575f80fd5b856020828401011115610bfd575f80fd5b6020919091019590945092505050565b5f8060408385031215610c1e575f80fd5b610c2783610b02565b9150610c3560208401610b02565b90509250929050565b600181811c90821680610c5257607f821691505b602082108103610c7057634e487b7160e01b5f52602260045260245ffd5b50919050565b60208082526024908201527f42455032304d656d65546f6b656e3a206e6f742075706461746520617574686f6040820152637269747960e01b606082015260800190565b634e487b7160e01b5f52601160045260245ffd5b8181038181111561041f5761041f610cba565b60208082526024908201527f42455032304d656d65546f6b656e3a206e6f7420667265657a6520617574686f6040820152637269747960e01b606082015260800190565b60208082526022908201527f42455032304d656d65546f6b656e3a206e6f74206d696e7420617574686f7269604082015261747960f01b606082015260800190565b634e487b7160e01b5f52604160045260245ffd5b601f821115610dc257805f5260205f20601f840160051c81016020851015610da05750805b601f840160051c820191505b81811015610dbf575f8155600101610dac565b50505b505050565b67ffffffffffffffff831115610ddf57610ddf610d67565b610df383610ded8354610c3e565b83610d7b565b5f601f841160018114610e24575f8515610e0d5750838201355b5f19600387901b1c1916600186901b178355610dbf565b5f83815260208120601f198716915b82811015610e535786850135825560209485019460019092019101610e33565b5086821015610e6f575f1960f88860031b161c19848701351681555b505060018560011b0183555050505050565b60208152816020820152818360408301375f818301604090810191909152601f909201601f19160101919050565b8082018082111561041f5761041f610cba56fea2646970667358221220ec0917641c7aa170643055ec601f6a14d9788bdeea74346f1ab24dcfefda698164736f6c634300081a0033";
