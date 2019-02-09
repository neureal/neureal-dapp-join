/* globals web3 fetch */
import $ from 'jquery';
import EmbarkJS from 'Embark/EmbarkJS';
import NeurealRewards from 'Embark/contracts/NeurealRewards';

const OpenSeaLink = 'https://rinkeby.opensea.io/assets';
const ipfsApiGateway = 'https://ipfs.infura.io:5001';
const ipfsLiveGateway = 'https://cloudflare-ipfs.com';

function error (err) {
  $('#div_error').removeClass('w3-hide');
  $('#div_error #text_description').text(err);
}

window.addEventListener('load', async () => {
  $('#btn_terms').click(function () {
    $('#modal_terms').removeClass('w3-show');
  });

  try {
    if (!window.ethereum && !window.web3) throw new Error('Non supported browser detected.');
    if (window.ethereum) await window.ethereum.enable();

    EmbarkJS.onReady(async (err) => {
      try {
        // ** Check blockchain
        // if (err) throw new Error(err);
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
        $('#btn-send-01').click(async function () {
          try {
            $('#progress').removeClass('w3-hide');
            const accounts = await web3.eth.getAccounts();
            if (accounts.length < 1) throw new Error('No accounts available, please choose an account.');
            const balance = await web3.eth.getBalance(accounts[0]);
            // if (balance < 25) throw new Error('No accounts available, please choose an account with enough funding.');
            const val = web3.utils.toWei('0.001', 'ether');
            const receipt = await web3.eth.sendTransaction({ from: accounts[0], to: curContract.options.address, value: val, gas: '4000000' });
            // const id = receipt.events['Transfer'].returnValues.tokenId;

          } catch (err) { error(err); }
          $('#progress').addClass('w3-hide');
        });

      } catch (err) { error(err); }
    });
  } catch (err) { error(err); }
});
