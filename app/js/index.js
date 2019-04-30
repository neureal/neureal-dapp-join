/* globals web3 */
import $ from 'jquery';
import EmbarkJS from 'Embark/EmbarkJS';
import NeurealRewards from 'Embark/contracts/NeurealRewards';

const netInfo = { // TODO limit this to main network on deploy
  1: { desc: 'Main Ethereum Network', explorer: 'https://etherscan.io', opensea: 'https://opensea.io', DAI: '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359' },
  // 3: { desc: 'Ropsten Test Network', explorer: 'https://ropsten.etherscan.io', opensea: '' },
  // 4: { desc: 'Rinkeby Test Network', explorer: 'https://rinkeby.etherscan.io', opensea: 'https://rinkeby.opensea.io' },
  // 42: { desc: 'Kovan Test Network', explorer: 'https://kovan.etherscan.io', opensea: '', DAI: '0xC4375B7De8af5a38a93548eb8453a498222C4fF2' },
  // 1337: { desc: 'Local Network', explorer: '', opensea: '' }
};

function error (err) {
  $('#div_error').removeClass('w3-hide');
  $('#div_error #text_description').text(err);
}

// TODO test for browser compatibility (only Chrome and Firefox works so far)
window.addEventListener('load', async () => {
  $('#div_numina').click(async function () { $('#div_numina_body').toggleClass('w3-hide'); });
  $('#div_nascent').click(async function () { $('#div_nascent_body').toggleClass('w3-hide'); });
  $('#div_nina').click(async function () { $('#div_nina_body').toggleClass('w3-hide'); });

  if (!window.ethereum) return;
  $('#modal_terms #span_required').addClass('w3-hide');
  $('#modal_terms #span_accept').removeClass('w3-hide');
  $('#modal_terms #btn_accept').click(async function () {
    $('#modal_terms').removeClass('w3-show');

    await EmbarkJS.enableEthereum();
    // if (window.ethereum) await window.ethereum.enable();
    EmbarkJS.onReady(async (err) => {
      try {
        // ** Check blockchain
        if (err) return;
        console.log('Blockchain OK');

        // ** Main
        const contractAddr = $('#contract_address').text();
        if (!web3.utils.isAddress(contractAddr)) throw new Error('Contract address incorrect.');
        const netid = await web3.eth.net.getId();
        if (netInfo[netid] === undefined) throw new Error(`Incompatable network for this dapp. Please choose ${netInfo[Object.keys(netInfo)[0]].desc}.`);

        const curContract = new EmbarkJS.Blockchain.Contract({
          abi: NeurealRewards.options.jsonInterface,
          address: contractAddr,
          // from: contract.deploymentAccount || web3.eth.defaultAccount,
          // gas: constants.tests.gasLimit,
          web3: web3
        });

        const curId = await curContract.methods.tokenId().call();
        $('#text_allocated').text(curId);

        const balDAI = await curContract.methods.getTokenBalance(netInfo[netid].DAI).call();
        $('#text_raised').text('$' + web3.utils.fromWei(balDAI).split('.')[0]);

        $('#btn-send-01').addClass('w3-button');
        $('#btn-send-01').on('click', function () { send(1, curContract); });
        $('#btn-send-02').addClass('w3-button');
        $('#btn-send-02').on('click', function () { send(10, curContract); });
        $('#btn-send-03').addClass('w3-button');
        $('#btn-send-03').on('click', function () { send(100, curContract); });
      } catch (err) { error(err); }
    });
  });
});

async function send (cards, contract) {
  try {
    $('#div_error').addClass('w3-hide');
    $('#modal_progress').addClass('w3-show');
    const accounts = await web3.eth.getAccounts();
    if (accounts.length < 1) throw new Error('No accounts available, please choose an account.');
    // console.log(accounts.length);
    // const balance = await web3.eth.getBalance(accounts[0]);
    // console.log(balance);
    const COST_DAI = await contract.methods.COST_DAI().call();
    // console.log(COST_DAI);
    const rate = await contract.methods.getExpectedRate().call();
    // console.log(rate.slippageRate);
    const ETHCost = (web3.utils.fromWei(COST_DAI) / web3.utils.fromWei(rate.slippageRate)) * cards;
    // if (balance < ETHCost) throw new Error('No accounts available, please choose an account with enough funding.');
    const val = web3.utils.toWei(ETHCost.toFixed(9));
    const receipt = await web3.eth.sendTransaction({ from: accounts[0], to: contract.options.address, value: val });
    // console.log(receipt);
    // console.log(receipt.status);
    // console.log(receipt.to);
    // console.log(receipt.from);
    const vals = decodeTransactionLog(receipt, 'TokenPurchase', contract);
    let textcards = '';
    if (vals.length > 0) {
      const foils = parseInt(vals.length / 10);
      const min = vals.reduce((min, p) => Number(p._tokenId) < min ? p._tokenId : min, Number(vals[0]._tokenId));
      const max = vals.reduce((max, p) => Number(p._tokenId) > max ? p._tokenId : max, Number(vals[0]._tokenId));

      const pad = 4;
      textcards = '';
      if (vals.length === 1) textcards += `card <b>#${vals[0]._tokenId.toString().padStart(pad, '0')}</b>`;
      else textcards += `cards <b>#${min.toString().padStart(pad, '0')}</b> to <b>#${max.toString().padStart(pad, '0')}</b>`;
      if (foils > 0) textcards += `, which includes <b>${foils}</b> foil cards`;
    }

    $('#modal_thankyou #text_cards').html(textcards);
    $('#modal_thankyou').addClass('w3-show');
  } catch (err) { error(err); }
  $('#modal_progress').removeClass('w3-show');
}

function decodeTransactionLog (receipt, event, contract) {
  // const eventJsonInterface = _.find(contract.options.jsonInterface, o => o.name === event && o.type === 'event');
  // const logs = _.filter(receipt.logs, l => l.topics.includes(eventJsonInterface.signature));
  // const result = words.filter(word => word.length > 6);

  const jsonI = contract.options.jsonInterface;
  let eventJsonI = null; for (let i = 0; i < jsonI.length; i++) {
    if (jsonI[i].name === event && jsonI[i].type === 'event') {
      eventJsonI = jsonI[i]; break;
    }
  }
  let values = []; for (let i = 0; i < receipt.logs.length; i++) {
    if (receipt.logs[i].topics.includes(eventJsonI.signature)) {
      values.push(web3.eth.abi.decodeLog(eventJsonI.inputs, receipt.logs[i].data, receipt.logs[i].topics.slice(1)));
    }
  }
  return values;
}
