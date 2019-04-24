module.exports = {
  // default applies to all environments
  default: {
    enabled: true,
    available_providers: ['ipfs'],
    ipfs_bin: 'ipfs',
    upload: {
      provider: 'ipfs',
      host: 'localhost',
      port: 5001,
      getUrl: 'http://localhost:8080/ipfs/'
    },
    versions: {
      // TODO 'ipfs-api': '26.1.2' or change to ipfs-http-client
      'ipfs-api': '18.2.0'
    }
  },

  // default environment, merges with the settings in default
  // assumed to be the intended environment by `embark run`
  development: {
    dappConnection: [
      {
        provider: 'ipfs',
        host: 'localhost',
        port: 5001,
        getUrl: 'http://localhost:8080/ipfs/'
      }
    ]
    // Configuration to start Swarm in the same terminal as `embark run`
    // ,account: {
    //   address: 'YOUR_ACCOUNT_ADDRESS', // Address of account accessing Swarm
    //   password: 'PATH/TO/PASSWORD/FILE' // File containing the password of the account
    // },
    // swarmPath: 'PATH/TO/SWARM/EXECUTABLE' // Path to swarm executable (default: swarm)
  },

  // merges with the settings in default
  // used with 'embark run privatenet'
  privatenet: {
  },

  // merges with the settings in default
  // used with 'embark run testnet'
  testnet: {
    dappConnection: [
      {
        provider: 'ipfs',
        host: 'ipfs.neureal.io',
        port: 8443,
        protocol: 'https',
        getUrl: 'https://ipfs.infura.io/ipfs/'
      }
    ]
  },

  // merges with the settings in default
  // used with 'embark run livenet'
  livenet: {
    // TODO setup Cloudflare DNS to make this work at 'https://domain.com/'
    // https://developers.cloudflare.com/distributed-web/ipfs-gateway/connecting-website/
    dappConnection: [
      {
        provider: 'ipfs',
        host: 'ipfs.neureal.io',
        port: 8443,
        protocol: 'https',
        getUrl: 'https://ipfs.infura.io/ipfs/'
      }
    ]
  }

  // you can name an environment with specific settings and then specify with
  // 'embark run custom_name'
  // ,custom_name: {
  // }
};
