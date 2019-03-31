module.exports = {
  // default applies to all environments
  default: {
    // Automatically call `ethereum.enable` if true.
    // If false, the following code must run before sending any transaction: `await EmbarkJS.enableEthereum();`
    // Default value is true.
    dappAutoEnable: false,

    // order of connections the dapp should connect to
    dappConnection: [
      '$WEB3' // uses pre existing web3 object if available (e.g in Mist)
    ],
    gas: 'auto',
    // Strategy for the deployment of the contracts:
    // - implicit will try to deploy all the contracts located inside the contracts directory
    //            or the directory configured for the location of the contracts. This is default one
    //            when not specified
    // - explicit will only attempt to deploy the contracts that are explicity specified inside the
    //            contracts section.
    // strategy: 'explicit', // TODO not working in Embark 3.2.7

    contracts: {
      'SafeMath': { deploy: false },
      'Address': { deploy: false },
      'Roles': { deploy: false },
      'Counters': { deploy: false },

      'ERC721Full': { deploy: false },
      'ERC721MetadataMintable': { deploy: false },
      'ERC721': { deploy: false },
      'ERC721Enumerable': { deploy: false },
      'ERC721Metadata': { deploy: false }

      // example:
      // 'ERC20': {
      //   deploy: false,
      //   from: '0xfeedaa0e295b09cd84d6ea2cce390eb443bcfdfc',
      //   fromIndex: 0,
      //   args: [ 'Token Name', 'SYMB' ],
      //   args: {
      //     'initial_value': 100
      //   },
      //   file: 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol',
      //   gas: 800000,
      //   gasPrice: 5,
      // },
    },
    // // Blockchain node to deploy the contracts
    // deployment: {
    //   // Accounts to use instead of the default account to populate your wallet
    //   // The order here corresponds to the order of `web3.eth.getAccounts`, so the first one is the `defaultAccount`
    //   accounts: [
    //     {
    //       nodeAccounts: true // Uses the Ethereum node's accounts
    //     },
    //     {
    //       privateKey: 'your_private_key',
    //       balance: '5 ether'  // You can set the balance of the account in the dev environment
    //                           // Balances are in Wei, but you can specify the unit with its name
    //     },
    //     {
    //       privateKeyFile: 'path/to/file', // Either a keystore or a list of keys, separated by , or ;
    //       password: 'passwordForTheKeystore' // Needed to decrypt the keystore file
    //     },
    //     {
    //       mnemonic: '12 word mnemonic', // BIP39 https://iancoleman.io/bip39/
    //       addressIndex: '0', // Optionnal. The index to start getting the address
    //       numAddresses: '1', // Optionnal. The number of addresses to get
    //       hdpath: 'm/44\'/60\'/0\'/0/' // Optionnal. HD derivation path: m/44'/60'/0'/0
    //     }
    //   ]
    // },
    versions: {
      'web3': '1.0.0-beta', // = '1.0.0-beta.37'
      // TODO 'web3': '1.0.0-beta.51',
      'solc': '0.5.2'
      // TODO 'solc': '0.5.7'
    }
  },

  // default environment, merges with the settings in default
  // assumed to be the intended environment by `embark run`
  development: {
    dappConnection: [
      'ws://localhost:8546',
      'http://localhost:8545',
      '$WEB3' // uses pre existing web3 object if available (e.g in Mist)
    ],
    contracts: {
      'NeurealRewards': { args: [ '0xf9311383b518Ed6868126353704dD8139f7A30bE', '99999', 'XYZ NFT', 'XYZT' ] }
    },
    deployment: {
      host: 'localhost', // Host of the blockchain node
      port: 8546, // Port of the blockchain node
      type: 'ws' // Type of connection (ws or rpc)
    }
  },

  // merges with the settings in default
  // used with 'embark run privatenet'
  privatenet: {
  },

  // merges with the settings in default
  // used with 'embark run testnet'
  testnet: {
    contracts: {
      'NeurealRewards': { deploy: false }
    },
    deployment: {
      // accounts: [
      //   {
      //     privateKey: 'b5aa22aca3722a3ede6945b61882049c57ccf31fbe374a9974fdb6344c6a49f8' // 0xF0Aa93485C6373f1A9f121AD89b40592918fC48a
      //     // addressIndex: '0', // Optional. The index to start getting the address
      //     // numAddresses: '2', // Optional. The number of addresses to get
      //     // hdpath: 'm/44\'/60\'/0\'/0/' // Optional. HD derivation path
      //   }
      // ],
      host: 'rinkeby.infura.io/v3/3faed45f144b4138a4f32f75367e34a1',
      port: false,
      protocol: 'https',
      type: 'rpc' // TODO does Infura websocket (ws) work here?
    }
  },

  // merges with the settings in default
  // used with 'embark run livenet'
  livenet: {
    contracts: {
      'NeurealRewards': { deploy: false }
    },
    deployment: {
      host: 'mainnet.infura.io/v3/3faed45f144b4138a4f32f75367e34a1',
      port: false,
      protocol: 'https',
      type: 'rpc' // TODO does Infura websocket (ws) work here?
    }
  }

  // you can name an environment with specific settings and then specify with
  // 'embark run custom_name' or 'embark blockchain custom_name'
  // custom_name: {
  // }
};
