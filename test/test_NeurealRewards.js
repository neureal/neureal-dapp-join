/* globals config, before, beforeEach, describe, it, web3 */
const assert = require('assert');

// const args = [ '0xf9311383b518Ed6868126353704dD8139f7A30bE', web3.utils.toWei('99999'), 'XYZ NFT', 'XYZT' ];
const args = [ ];
const NeurealRewards = require('Embark/contracts/NeurealRewards');

// For documentation please see https://embark.status.im/docs/contracts_testing.html
var accounts;
config({
  // contracts: {
  //   'NeurealRewards': { args: args } // pre-create contract for tests
  // },
  deployment: {
    host: 'localhost', // Host of the blockchain node
    port: 8546, // Port of the blockchain node
    type: 'ws', // Type of connection (ws or rpc)
    accounts: [
      { mnemonic: 'depart spot hello jealous tip maximum renew practice flower danger enforce engine', balance: '99999999999999999 ether' }, // 0x6240e511aEb6Db87192d49Ff4C065FEE486C8c89
      { mnemonic: 'success pause smile chimney plastic cousin ensure lawsuit spring rebel flat elder', balance: '2 ether' }, // 0x7d6A4C1E2bbd02310A3f03f996ac01e841Df6143
      { mnemonic: 'method potato interest wrap task turn sick live swarm tell purpose fly', balance: '8 ether' } // 0xbFb65267ded595CAAE6377d485CEe150bc6166E4
    ]
  }
}, function (_err, web3Accounts) {
  accounts = web3Accounts;
  console.log('web3.version: ', web3.version);
  console.log('web3.eth.currentProvider: ', web3.eth.currentProvider.constructor.name);

  let numExtraAcounts = 3 - accounts.length;
  if (numExtraAcounts > 0) {
    web3.eth.accounts.wallet.create(numExtraAcounts);
    for (let i = 0; i < numExtraAcounts; i++) { accounts.push(web3.eth.accounts.wallet[i].address); }
  }
  console.log(accounts);
});

// Run tests
describe('NeurealRewards', function () {
  this.timeout(0);

  before(async function () {
  });

  beforeEach(async function () {
  });

  it('an account should be available with a balance', async function () {
    let balance = await web3.eth.getBalance(accounts[0]);
    console.log('Account 0', accounts[0], 'ETH balance: ', web3.utils.fromWei(balance));
    let receipt1 = await web3.eth.sendTransaction({ from: accounts[0], to: accounts[1], value: web3.utils.toWei('2.0') });
    console.log('Account 1', accounts[1], 'ETH balance: ', web3.utils.fromWei(await web3.eth.getBalance(accounts[1])));
    let receipt2 = await web3.eth.sendTransaction({ from: accounts[0], to: accounts[2], value: web3.utils.toWei('8') });
    console.log('Account 2', accounts[2], 'ETH balance: ', web3.utils.fromWei(await web3.eth.getBalance(accounts[2])));

    assert.ok(web3.utils.toBN(balance).gt(0));
  });

  // it('reentrancy: should not be suseptable to reentrancy', async function () {
  // });

  // CREATION

  // it('creation: contract should deploy with less than 4.7 mil gas', async function () {
  //   var txHash = null;
  //   let instance = await NeurealRewards.deploy({ arguments: args, data: NeurealRewards.options.data }).send({ from: accounts[0] }).on('transactionHash', (transactionHash) => { txHash = transactionHash; });

  //   let receipt = await web3.eth.getTransactionReceipt(txHash);
  //   assert.ok(receipt.gasUsed < 4700000);
  // });

  // it('creation: test correct setting of state variables', async function () {
  //   let instance = await NeurealRewards.deploy({ arguments: args, data: NeurealRewards.options.data }).send({ from: accounts[0] });

  //   let tokenId = await instance.methods.tokenId().call();
  //   console.log('tokenId: ', tokenId);
  //   assert.strictEqual(parseInt(tokenId, 10), 0);
  // });

  // it('creation: test correct setting of vanity information', async function () {
  //   let instance = await NeurealRewards.deploy({ arguments: args, data: NeurealRewards.options.data }).send({ from: accounts[0] });

  //   let cap = await instance.methods.cap().call();
  //   assert.strictEqual(cap, args[0]);
  //   let name = await instance.methods.name().call();
  //   assert.strictEqual(name, args[1]);
  //   let symbol = await instance.methods.symbol().call();
  //   assert.strictEqual(symbol, args[2]);
  // });

  // it('creation: sending ETH with contract deployment should error', async function () {
  //   await assert.rejects(async function () {
  //     await NeurealRewards.deploy({ arguments: args, data: NeurealRewards.options.data }).send({ from: accounts[0], value: web3.utils.toWei('0.01') });
  //   });
  // });

  // PAYMENT

  // it('payment: sending ETH to contract address should revert', async function () {
  //   let instance = await NeurealRewards.deploy({ arguments: args, data: NeurealRewards.options.data }).send({ from: accounts[0] });

  //   await assert.rejects(async function () {
  //     await web3.eth.sendTransaction({ from: accounts[0], to: instance.options.address, value: web3.utils.toWei('1.01') });
  //   });

  //   // cast contract to address payable
  //   // address payable wallet = address(uint160(address(addr)));
  // });

  // it('purchase: trying to purchase under MIN_PURCHASE should be reverted', async () => {
  //   let instance = await TESTToken.new(NEUREAL_ETH_WALLET_ADDRESS, WHITELIST_PROVIDER_ADDRESS, {from: CONTRACT_CREATOR_ADDRESS, gas: deployGas, gasPrice: deployGasPrice});
  //   await instance.transition({from: CONTRACT_CREATOR_ADDRESS});
  //   await instance.whitelist(BUYER_ADDRESS, {from: WHITELIST_PROVIDER_ADDRESS});

  //   let value = fromETHtoWeiBN(0.001);
  //   try {
  //     var transaction = await instance.sendTransaction({from: BUYER_ADDRESS, value: value, gas: 4712388, gasPrice: 100000000000});
  //   } catch (err) { } // console.log(err.message); }
  //   assert.isUndefined(transaction);
  // });
  
  // it('purchase: trying to purchase over MAX_SALE should be reverted', async () => {
  //   let instance = await TESTToken.new(NEUREAL_ETH_WALLET_ADDRESS, WHITELIST_PROVIDER_ADDRESS, {from: CONTRACT_CREATOR_ADDRESS, gas: deployGas, gasPrice: deployGasPrice});

  //   await instance.transition({from: CONTRACT_CREATOR_ADDRESS}); // set to Sale
  //   await instance.whitelist(BUYER_ADDRESS, {from: WHITELIST_PROVIDER_ADDRESS}); // must be whitelisted

  //   let MAX_SALE = await instance.MAX_SALE.call();
  //   let OPENING_RATE = await instance.OPENING_RATE.call();
  //   let value = MAX_SALE.dividedToIntegerBy(OPENING_RATE).add(1); // Amount to purchase with
  //   try {
  //     var result = await instance.sendTransaction({from: BUYER_ADDRESS, value: value, gas: 4712388, gasPrice: 100000000000});
  //   } catch (err) { } // console.log(err.message); }
  //   assert.isUndefined(result);
  // });

  // it('purchase: should purchase token by sending ether to contract fallback function', async () => {
  //   let instance = await TESTToken.new(NEUREAL_ETH_WALLET_ADDRESS, WHITELIST_PROVIDER_ADDRESS, {from: CONTRACT_CREATOR_ADDRESS, gas: deployGas, gasPrice: deployGasPrice});

  //   await instance.transition({from: CONTRACT_CREATOR_ADDRESS}); // set to Sale
  //   await instance.whitelist(BUYER_ADDRESS, {from: WHITELIST_PROVIDER_ADDRESS}); // must be whitelisted

  //   let value = fromETHtoWeiBN(0.01); // Amount to purchase with
  //   var purchase = await instance.sendTransaction({from: BUYER_ADDRESS, value: value, gas: 4712388, gasPrice: 100000000000});
  //   console.log('purchase (gasUsed): ', purchase.receipt.gasUsed);
  //   assert.isTrue(findEvent(purchase, 'Transfer'));
  //   assert.isTrue(findEvent(purchase, 'TokenPurchase'));

  //   let OPENING_RATE = await instance.OPENING_RATE.call();
  //   let balanceOf = await instance.balanceOf.call(BUYER_ADDRESS);
  //   // console.log('balanceOf: ', balanceOf.toFormat());
  //   // console.log('buy: ', toETHString(OPENING_RATE.times(value)));
  //   assert.isTrue(balanceOf.eq(OPENING_RATE.times(value)));
  // });

  // TRANSFERS

  // it('transfers: should allow approve and transfer from', async function () {
  //   const transferAmount = 100;
  //   await seven.setSaleContract(accounts[0]);
  //   await seven.mint(accounts[0], transferAmount);

  //   let totalSupply = await seven.totalSupply();
  //   assert.equal(totalSupply, transferAmount);

  //   let approveTx = await seven.approve(accounts[1], transferAmount, {from: accounts[0]});

  //   let allowance = await seven.allowance.call(accounts[0], accounts[1]);
  //   assert.equal(allowance.toNumber(), transferAmount);

  //   let transferTx = await seven.transferFrom(accounts[0], accounts[1], transferAmount, {from: accounts[1]});

  //   let balance = await seven.balanceOf.call(accounts[0]);
  //   assert.equal(balance.toNumber(), 0);

  //   let balance2 = await seven.balanceOf.call(accounts[1]);
  //   assert.equal(balance2.toNumber(), transferAmount);
  // });

  // it('transfers: transfering zero token should revert', async function () {
  //   var ctr;
  //   NECPToken.new({from: accounts[0]}).then(function(result) {
  //     ctr = result;
  //     return ctr.transfer.call(accounts[1], 0, {from: accounts[0]});
  //   }).then(function (result) {
  //     assert.isFalse(result);
  //     done();
  //   }).catch(done);
  // });

  // MINTING

  // it('minting: should not allow minting zero', async function () {
  //   let instance = await NeurealRewards.deploy({ arguments: args, data: NeurealRewards.options.data }).send({ from: accounts[0] });

  //   await assert.rejects(async function () {
  //     await instance.methods.mint(accounts[1], '0').send({ from: accounts[0] });
  //   });
  // });

  // it('minting: should not allow minting by non-owner', async function () {
  //   let instance = await NeurealRewards.deploy({ arguments: args, data: NeurealRewards.options.data }).send({ from: accounts[0] });

  //   await assert.rejects(async function () {
  //     await instance.methods.mint(accounts[1], web3.utils.toWei('10000.00')).send({ from: accounts[1] });
  //   });
  // });

  // it('minting: should not allow minting more than the token limit', async function () {
  //   let instance = await NeurealRewards.deploy({ arguments: args, data: NeurealRewards.options.data }).send({ from: accounts[0] });

  //   await assert.rejects(async function () {
  //     await instance.methods.mint(accounts[1], web3.utils.toWei('10000.01')).send({ from: accounts[0] });
  //   });
  // });

  // it('minting: reciepient balance should match minted amount', async function () {
  //   let instance = await NeurealRewards.deploy({ arguments: args, data: NeurealRewards.options.data }).send({ from: accounts[0] });

  //   let txAmt = '23.01';
  //   const receipt = await instance.methods.mint(accounts[1], web3.utils.toWei(txAmt)).send({ from: accounts[0] });
  //   const bal = web3.utils.fromWei(await instance.methods.balanceOf(accounts[1]).call({ from: accounts[1] }));
  //   // console.log('Account 1 Token balance: ', bal);
  //   assert.strictEqual(bal, txAmt);
  // });
});
