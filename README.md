# neureal-dapp-join
Neureal Foundation NFT for rewarding contributors

Compatible with OpenSea https://opensea.io/

## Usage

`https://cloudflare-ipfs.com/ipfs/<dapp-version>/?contract=<minted-contract-address>&ipfs=<backup-ipfs-gateway>`

## Development Requirements

https://embark.status.im/docs/installation.html
- install the latest, ie `npm -g install embark@4.0.2`
- make sure to install local Geth and IPFS

`npm install`

## Development

Run with local development blockchain and webserver

`embark run`

Run all code tests

`embark test`

Run on Rinkeby with local webserver

`embark run testnet`

Deploy to public testnet (Rinkeby + IPFS)

- `embark upload testnet`
- must be running `ipfs daemon` in seperate console
- access at `https://cloudflare-ipfs.com/ipfs/<your-site-ipfs-hash>`

