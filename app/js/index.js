/* globals web3 */
import $ from 'jquery';
import EmbarkJS from 'Embark/EmbarkJS';
import NeurealRewards from 'Embark/contracts/NeurealRewards';

function error (err) {
  $('#div_error').removeClass('w3-hide');
  $('#div_error #text_description').text(err);
}

window.addEventListener('load', async () => {
  $('#btn_terms').click(async function () {
    $('#modal_terms').removeClass('w3-show');

    if (!window.ethereum && !window.web3) return;
    if (window.ethereum) await window.ethereum.enable();
    EmbarkJS.onReady(async (err) => {
      try {
        // ** Check blockchain
        if (err) return;
        console.log('blockchain OK');

        // ** Main
        const contractAddr = $('#contract-address').text();
        if (!web3.utils.isAddress(contractAddr)) throw new Error('Contract address incorrect.');
        const curContract = new EmbarkJS.Blockchain.Contract({
          abi: NeurealRewards.options.jsonInterface,
          address: contractAddr,
          // from: contract.deploymentAccount || web3.eth.defaultAccount,
          // gas: constants.tests.gasLimit,
          web3: web3
        });

        $('#btn-send-01').addClass('w3-button');
        $('#btn-send-01').on('click', function () { send(25, curContract); });
        $('#btn-send-02').addClass('w3-button');
        $('#btn-send-02').on('click', function () { send(100, curContract); });
        $('#btn-send-03').addClass('w3-button');
        $('#btn-send-03').on('click', function () { send(1000, curContract); });
      } catch (err) { error(err); }
    });
  });
});

async function send (usd, curContract) {
  try {
    $('#div_error').addClass('w3-hide');
    $('#modal_progress').addClass('w3-show');
    const accounts = await web3.eth.getAccounts();
    if (accounts.length < 1) throw new Error('No accounts available, please choose an account.');
    console.log(accounts.length);
    const balance = await web3.eth.getBalance(accounts[0]);
    console.log(balance);
    // if (balance < 25) throw new Error('No accounts available, please choose an account with enough funding.');
    const val = web3.utils.toWei('0.001', 'ether');
    const receipt = await web3.eth.sendTransaction({ from: accounts[0], to: curContract.options.address, value: val });
    // const id = receipt.events['Transfer'].returnValues.tokenId;
    console.log(receipt);
  } catch (err) { error(err); }
  $('#modal_progress').removeClass('w3-show');
}
