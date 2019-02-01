/* globals web3 fetch */
import $ from 'jquery';
import EmbarkJS from 'Embark/EmbarkJS';
import NeurealRewards from 'Embark/contracts/NeurealRewards';

const OpenSeaLink = 'https://rinkeby.opensea.io/assets';
const ipfsApiGateway = 'https://ipfs.infura.io:5001';
const ipfsLiveGateway = 'https://cloudflare-ipfs.com';

function error (err) {
}

window.addEventListener('load', async () => {
  try {
    if (!window.ethereum && !window.web3) throw new Error('Non-Ethereum browser detected.');
    if (window.ethereum) await window.ethereum.enable();

    EmbarkJS.onReady(async (err) => {
      try {
        // ** Check blockchain
        if (err) throw new Error(err);
        console.log('blockchain OK');
        // // ** Check communication
        // await EmbarkJS.Messages.Providers.whisper.getWhisperVersion();
        // console.log('whisper OK');
        // ** Check storage
        const result = await EmbarkJS.Storage.isAvailable();
        if (!result) throw new Error('Storage not available.');
        console.log('storage OK');

        // ** Main
        var curContract = NeurealRewards;

      } catch (err) { error(err); }
    });
  } catch (err) { error(err); }
});
