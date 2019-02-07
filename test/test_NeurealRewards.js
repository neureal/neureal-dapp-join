/* globals config, describe, it, web3 */
const assert = require('assert');

// For documentation please see https://embark.status.im/docs/contracts_testing.html
let accounts;
config({
  contracts: {
    // 'NeurealRewards': { args: [100] }
  },
  deployment: {
    accounts: [
      { mnemonic: 'depart spot hello jealous tip maximum renew practice flower danger enforce engine', balance: '5 ether' }, // 0x6240e511aEb6Db87192d49Ff4C065FEE486C8c89
      { mnemonic: 'success pause smile chimney plastic cousin ensure lawsuit spring rebel flat elder', balance: '2 ether' }, // 0x7d6A4C1E2bbd02310A3f03f996ac01e841Df6143
      { mnemonic: 'method potato interest wrap task turn sick live swarm tell purpose fly', balance: '8 ether' } // 0xbFb65267ded595CAAE6377d485CEe150bc6166E4
    ]
  }
}, (_err, web3Accounts) => {
  accounts = web3Accounts;
});

// Print environment info
console.log('web3.version: ', web3.version);

const NeurealRewards = require('Embark/contracts/NeurealRewards');
describe('NeurealRewards', function () {
  this.timeout(0);

  // it('should set constructor value', async function () {
  //   let result = await NeurealRewards.methods.storedData().call();
  //   assert.strictEqual(parseInt(result, 10), 100);
  // });

  // it('set storage value', async function () {
  //   await NeurealRewards.methods.set(150).send();
  //   let result = await NeurealRewards.methods.get().call();
  //   assert.strictEqual(parseInt(result, 10), 150);
  // });

  it('should have account with balance', async function () {
    // let instance = await NeurealRewards.deploy({ arguments: [accounts[1], accounts[2]] }).send();

    let balance = await web3.eth.getBalance(accounts[0]);
    console.log('Account 0 balance: ', web3.utils.fromWei(balance));
    balance = await web3.eth.getBalance(accounts[1]);
    console.log('Account 1 balance: ', web3.utils.fromWei(balance));
    balance = await web3.eth.getBalance(accounts[2]);
    console.log('Account 2 balance: ', web3.utils.fromWei(balance));

    assert.ok(web3.utils.toBN(balance).gt(0));
  });

  // CREATION

  // it('creation: contract should deploy with less than 4.7 mil gas', async function () {
  //   let instance = await NeurealRewards.new(NEUREAL_ETH_WALLET_ADDRESS, WHITELIST_PROVIDER_ADDRESS, {from: CONTRACT_CREATOR_ADDRESS, gas: deployGas, gasPrice: deployGasPrice});

  //   let receipt = await web3.eth.getTransactionReceipt(instance.transactionHash);
  //   console.log('Contract creation (gasUsed): ', receipt.gasUsed);
  //   assert.isBelow(receipt.gasUsed, 4700000);
  // });

  // it('creation: sending ether with contract deployment should revert', async function () {
  //   try {
  //     var result = await NeurealRewards.new({from: CONTRACT_CREATOR_ADDRESS, value: fromETHtoWeiBN(0.00001), gas: deployGas, gasPrice: deployGasPrice});
  //   } catch (err) { } // console.log(err.message); }
  //   assert.isUndefined(result);
  // });

  it('creation: test correct setting of state variables', async function () {
    let instance = await NeurealRewards.deploy().send();

    // let OPENING_RATE = await instance.methods.OPENING_RATE().call();
    // console.log('OPENING_RATE: ', OPENING_RATE);
    // assert.strictEqual(parseInt(OPENING_RATE, 10), 6400);

    let tokenId = await instance.methods.tokenId().call();
    console.log('tokenId: ', tokenId);
    assert.strictEqual(parseInt(tokenId, 10), 0);
  });

  it('creation: test correct setting of vanity information', async function () {
    let instance = await NeurealRewards.deploy().send();

    let name = await instance.methods.name().call();
    assert.strictEqual(name, 'Neureal Rewards');

    let symbol = await instance.methods.symbol().call();
    assert.strictEqual(symbol, 'NEUR');
  });
});