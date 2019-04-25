/* globals web3 */
import $ from 'jquery';
import EmbarkJS from 'Embark/EmbarkJS';
import NeurealRewards from 'Embark/contracts/NeurealRewards';
// import EmbarkJS from './embarkArtifacts/embarkjs';
// import Token from './embarkArtifacts/contracts/Token';

const ipfsApiProvider = ipfsOptionsURL('https://ipfs.neureal.io:8443');
const ipfsLiveGateway = 'https://cloudflare-ipfs.com';

const netInfo = { // TODO limit this to main network on deploy
  1: { desc: 'Main Ethereum Network', explorer: 'https://etherscan.io', opensea: 'https://opensea.io/assets', DAI: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359' },
  3: { desc: 'Ropsten Test Network', explorer: 'https://ropsten.etherscan.io', opensea: '' },
  4: { desc: 'Rinkeby Test Network', explorer: 'https://rinkeby.etherscan.io', opensea: 'https://rinkeby.opensea.io/assets' },
  42: { desc: 'Kovan Test Network', explorer: 'https://kovan.etherscan.io', opensea: '', DAI: '0xC4375B7De8af5a38a93548eb8453a498222C4fF2' },
  1337: { desc: 'Local Network', explorer: '', opensea: '' }
};

function ipfsOptionsURL (urltxt) {
  const url = new URL(urltxt);
  return { host: url.hostname, port: url.port, protocol: url.protocol.slice(0, -1), getUrl: `${url.protocol}//${url.hostname}/ipfs/` };
}

function error (err) {
  $('#div_error').removeClass('w3-hide');
  $('#div_error #text_description').text(err);
}

// const uint256MAX = web3.utils.toBN('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF');
// function inputToUint256 (inv) {
//   const invt = +inv;
//   if (isNaN(invt) || invt % 1 !== 0) inv = web3.utils.utf8ToHex(inv);
//   inv = web3.utils.toBN(inv).abs();
//   if (inv.gt(uint256MAX)) throw new Error('web3 uint256 overflow!');
//   return inv;
// }

window.addEventListener('load', async () => {
  try {
    if (!window.ethereum && !window.web3) throw new Error('Non-Ethereum browser detected.');
    if (window.ethereum) await EmbarkJS.enableEthereum();
    // if (window.ethereum) await window.ethereum.enable();

    EmbarkJS.onReady(async (err) => {
      try {
        // ** Check blockchain
        if (err) throw new Error(err);
        console.log('Blockchain OK');
        // // ** Check communication
        // await EmbarkJS.Messages.Providers.whisper.getWhisperVersion();
        // console.log('whisper OK');
        // ** Check storage
        const result = await EmbarkJS.Storage.isAvailable();
        if (!result) throw new Error('Storage not available.');
        console.log('Storage OK');
        // console.log('web3.version: ', web3.version);

        // ** Main
        var curContract = NeurealRewards;
        const netid = await web3.eth.net.getId();
        if (netInfo[netid] === undefined) throw new Error(`Incompatable network for this dapp. Please choose ${netInfo[Object.keys(netInfo)[0]].desc}.`);

        // Setup objects
        const urlParams = new URLSearchParams(window.location.search);
        const ipfsUrl = urlParams.get('ipfs');
        const ipfsApiPvdrBkup = (ipfsUrl === null) ? null : ipfsOptionsURL(ipfsUrl);
        if (ipfsApiPvdrBkup !== null) {
          EmbarkJS.Storage.setProvider('ipfs', ipfsApiPvdrBkup);
          const result = await EmbarkJS.Storage.isAvailable();
          if (!result) throw new Error('Backup storage not available.');
          console.log('Backup Storage OK');
          EmbarkJS.Storage.setProvider('ipfs', ipfsApiProvider);
        }
        const contractAddr = urlParams.get('contract');
        if (web3.utils.isAddress(contractAddr)) {
          curContract = new EmbarkJS.Blockchain.Contract({
            abi: NeurealRewards.options.jsonInterface,
            address: contractAddr,
            // from: contract.deploymentAccount || web3.eth.defaultAccount,
            // gas: constants.tests.gasLimit,
            web3: web3
          });
        } else {
          // Deploy new contract
          $('#div_deploy').removeClass('w3-hide');
          $('#div_deploy #text_network').text(netInfo[netid].desc);
          $('#div_deploy #button_deploy').click(async function () {
            try {
              $('#div_error').addClass('w3-hide');
              $('#modal_progress').addClass('w3-show');
              // const minter = $('#div_deploy #input_address').val(); if (!web3.utils.isAddress(minter)) throw new Error('Address is not a correctly formated Ethereum address.');
              // const inputname = $('#div_deploy #input_name').val(); if (inputname.length > 32) throw new Error('Contract name too long.');
              // const inputsymbol = $('#div_deploy #input_symbol').val(); if (inputsymbol.length > 8) throw new Error('Contract symbol too long.');
              // const inputcap = web3.utils.toBN($('#div_deploy #input_cap').val()).toString();
              // curContract = await NeurealRewards.deploy({ arguments: [minter, inputcap, inputname, inputsymbol], data: NeurealRewards.options.data }).send();
              curContract = await NeurealRewards.deploy({ data: NeurealRewards.options.data }).send();
              window.location.search = 'contract=' + encodeURI(curContract.options.address);
            } catch (err) { error(err); }
            $('#modal_progress').removeClass('w3-show');
          });
          return;
        }
        $('#div_withdraw #hdr').click(async function () { $('#div_withdraw #span_content').toggleClass('w3-hide'); });
        $('#div_mint #hdr').click(async function () { $('#div_mint #span_content').toggleClass('w3-hide'); });
        $('#div_list_id #hdr').click(async function () { $('#div_list_id #span_content').toggleClass('w3-hide'); });
        $('#div_list_owner #hdr').click(async function () { $('#div_list_owner #span_content').toggleClass('w3-hide'); });
        $('#div_list #hdr').click(async function () { $('#div_list #span_content').toggleClass('w3-hide'); });

        // Contract Info
        const name = await curContract.methods.name().call();
        $('#div_info #text_name').text(name);
        const symbol = await curContract.methods.symbol().call();
        $('#div_info #text_symbol').text(symbol);
        $('#div_info #text_network').text(netInfo[netid].desc);
        $('#div_info #text_address').text(curContract.options.address);
        $('#div_info #text_details').html(`&rarr; <a href="${netInfo[netid].explorer}/address/${curContract.options.address}" target="_blank">View&nbsp;Contract&nbsp;Details</a>`);
        const accounts = await web3.eth.getAccounts();
        if (accounts.length < 1) throw new Error('No Ethereum accounts available.');
        const minter = await curContract.methods.isMinter(accounts[0]).call();
        $('#div_info #text_account').text(accounts[0]); $('#div_info #text_minter').text(minter);
        const curId = await curContract.methods.tokenId().call();
        const cap = await curContract.methods.MAX_SUPPLY().call();
        $('#div_info #text_curId').text(curId); $('#div_info #text_cap').text(cap);
        const balDAI = await curContract.methods.getTokenBalance(netInfo[netid].DAI).call();
        const balETH = await web3.eth.getBalance(curContract.options.address);
        $('#div_info #text_balDAI').text(web3.utils.fromWei(balDAI)); $('#div_info #text_balETH').text(web3.utils.fromWei(balETH));

        // Withdraw DAI
        $('#div_withdraw #button_DAI').click(async function () {
          try {
            $('#div_error').addClass('w3-hide');
            $('#modal_progress').addClass('w3-show');
            $('#div_withdraw #span_content #d').remove();
            const receipt = await curContract.methods.withdrawToken(netInfo[netid].DAI).send();
            // TODO Embark is not returning from the previous await because its not detecting the transaction finishing
            // const amount = receipt.events['TokenWithdraw'].returnValues.amount;
            const balDAI = await curContract.methods.getTokenBalance(netInfo[netid].DAI).call();
            $('#div_info #text_balDAI').text(web3.utils.fromWei(balDAI));
            // $('#div_withdraw #span_content').append(`<p id="d"><b>SUCCESS</b> | <b>${web3.utils.fromWei(amount)}</b> DAI withdrawn</p>`);
          } catch (err) { error(err); }
          $('#modal_progress').removeClass('w3-show');
        });

        // Withdraw ETH
        $('#div_withdraw #button_ETH').click(async function () {
          try {
            $('#div_error').addClass('w3-hide');
            $('#modal_progress').addClass('w3-show');
            $('#div_withdraw #span_content #d').remove();
            // TODO I have not tested if any of this works
            const receipt = await curContract.methods.withdrawEther().send();
            const amount = receipt.events['EtherWithdraw'].returnValues.amount;
            const balETH = await web3.eth.getBalance(curContract.options.address);
            $('#div_info #text_balETH').text(web3.utils.fromWei(balETH));
            $('#div_withdraw #span_content').append(`<p id="d"><b>SUCCESS</b> | <b>${web3.utils.fromWei(amount)}</b> ETH withdrawn</p>`);
          } catch (err) { error(err); }
          $('#modal_progress').removeClass('w3-show');
        });

        // Mint NFT
        // $('#div_mint #input_json').val(jsonex);
        // TODO ping this after change: https://rinkeby-api.opensea.io/api/v1/asset/<your_contract_address>/<token_id>/?force_update=true
        $('#div_mint #button_execute').click(async function () {
          try {
            $('#div_error').addClass('w3-hide');
            $('#modal_progress').addClass('w3-show');
            $('#div_mint #span_content #d').remove();
            const id = web3.utils.toBN($('#div_mint #input_id').val()).toString();
            let json = {};
            const inputimageurl = $('#div_mint #input_image_url');
            if (inputimageurl.prop('files').length > 0) {
              const hash = await EmbarkJS.Storage.uploadFile(inputimageurl);
              if (ipfsApiPvdrBkup !== null) {
                EmbarkJS.Storage.setProvider('ipfs', ipfsApiPvdrBkup);
                await EmbarkJS.Storage.uploadFile(inputimageurl);
                EmbarkJS.Storage.setProvider('ipfs', ipfsApiProvider);
              }
              json['image_url'] = ipfsLiveGateway + '/ipfs/' + hash;
            }
            const inputname = $('#div_mint #input_name').val(); if (inputname !== '') json['name'] = inputname;
            const inputdescription = $('#div_mint #input_description').val(); if (inputdescription !== '') json['description'] = inputdescription;
            const inputbackgroundcolor = $('#div_mint #input_background_color').val(); if (inputbackgroundcolor !== '') json['background_color'] = inputbackgroundcolor;
            const inputtraits = JSON.parse('[' + $('#div_mint #input_traits').val() + ']'); if (inputtraits.length > 0) json['traits'] = inputtraits;
            json = JSON.stringify(json);
            const hash = await EmbarkJS.Storage.saveText(json);
            if (ipfsApiPvdrBkup !== null) {
              EmbarkJS.Storage.setProvider('ipfs', ipfsApiPvdrBkup);
              await EmbarkJS.Storage.saveText(json);
              EmbarkJS.Storage.setProvider('ipfs', ipfsApiProvider);
            }
            const uri = ipfsLiveGateway + '/ipfs/' + hash; // 'fs:/ipfs/','/ipfs/','ipfs/' didn't work on OpenSea
            const receipt = await curContract.methods.mintAllocated(id, uri).send();
            const owner = receipt.events['Transfer'].returnValues.to;
            const item = `<p id="d"><b>NFT</b> | <a href="${uri}" target="_blank">MetaData</a> | <a href="${netInfo[netid].opensea}/${curContract.options.address}/${id}" target="_blank">OpenSea</a>` +
            ` | <a href="${netInfo[netid].explorer}/token/${curContract.options.address}?a=${id}" target="_blank">History</a> | ID[${id}] Owner[${owner}]</p>`;
            $('#div_mint #span_content').append(item);
            const curId = await curContract.methods.tokenId().call();
            $('#div_info #text_curId').text(curId);
          } catch (err) { error(err); }
          $('#modal_progress').removeClass('w3-show');
        });

        // Get an NFT by ID
        $('#div_list_id #button_query').click(async function () {
          try {
            $('#div_error').addClass('w3-hide');
            $('#div_list_id #span_content #d').remove();
            // const id = inputToUint256($('#div_list_id #input_id').val());
            const id = web3.utils.toBN($('#div_list_id #input_id').val()).toString();
            const owner = await curContract.methods.ownerOf(id).call();
            const uri = await curContract.methods.tokenURI(id).call();
            const item = `<p id="d"><b>NFT</b> | <a href="${uri}" target="_blank">MetaData</a> | <a href="${netInfo[netid].opensea}/${curContract.options.address}/${id}" target="_blank">OpenSea</a>` +
            ` | <a href="${netInfo[netid].explorer}/token/${curContract.options.address}?a=${id}" target="_blank">History</a> | ID[${id}] Owner[${owner}]</p>`;
            $('#div_list_id #span_content').append(item);
          } catch (err) { error(err); }
        });

        // List NFTs owned by address
        $('#div_list_owner #button_list').click(async function () {
          try {
            $('#div_error').addClass('w3-hide');
            $('#div_list_owner #span_content #d').remove();
            const owner = $('#div_list_owner #input_address').val();
            if (!web3.utils.isAddress(owner)) throw new Error('Address is not a correctly formated Ethereum address.');
            const count = await curContract.methods.balanceOf(owner).call();
            for (let i = 0; i < count; i++) {
              const id = await curContract.methods.tokenOfOwnerByIndex(owner, i).call();
              const uri = await curContract.methods.tokenURI(id).call();
              const item = `<p id="d"><b>NFT</b> | <a href="${uri}" target="_blank">MetaData</a> | <a href="${netInfo[netid].opensea}/${curContract.options.address}/${id}" target="_blank">OpenSea</a>` +
              ` | <a href="${netInfo[netid].explorer}/token/${curContract.options.address}?a=${id}" target="_blank">History</a> | ID[${id}]</p>`;
              $('#div_list_owner #span_content').append(item);
            }
          } catch (err) { error(err); }
        });

        // List all minted NFTs
        $('#div_list #button_list').click(async function () {
          try {
            $('#div_error').addClass('w3-hide');
            $('#div_list #span_content #d').remove();
            const count = await curContract.methods.totalSupply().call();
            for (let i = 0; i < count; i++) {
              const id = await curContract.methods.tokenByIndex(i).call();
              const owner = await curContract.methods.ownerOf(id).call();
              const uri = await curContract.methods.tokenURI(id).call();
              const item = `<p id="d"><b>NFT</b> | <a href="${uri}" target="_blank">MetaData</a> | <a href="${netInfo[netid].opensea}/${curContract.options.address}/${id}" target="_blank">OpenSea</a>` +
              ` | <a href="${netInfo[netid].explorer}/token/${curContract.options.address}?a=${id}" target="_blank">History</a> | ID[${id}] Owner[${owner}]</p>`;
              $('#div_list #span_content').append(item);
            }
          } catch (err) { error(err); }
        });
        $('#span_admin').removeClass('w3-hide');
      } catch (err) { error(err); }
    });
  } catch (err) { error(err); }
});

// const jsonex = `
// {
//   "name": "Dave Starbelly",
//   "description": "Friendly OpenSea Creature that enjoys long swims in the ocean.",
//   "image_url": "https://ipfs.infura.io/ipfs/QmNNbkdPJPeScw3gZGnDQxsM7wDKzehZ6inMq2HSqm9SBk",
//   "external_link": "https://join.neureal.net/nft/3",
//   "background_color": "FFFFFF",
//   "traits": [
//     {
//       "trait_type": "base",
//       "value": "starfish"
//     },
//     {
//       "trait_type": "eyes",
//       "value": "big"
//     },
//     {
//       "trait_type": "mouth",
//       "value": "surprised"
//     },
//     {
//       "trait_type": "level",
//       "value": 5
//     },
//     {
//       "trait_type": "stamina",
//       "value": 1.4
//     },
//     {
//       "trait_type": "personality",
//       "value": "sad"
//     },
//     {
//       "trait_type": "aqua_power",
//       "display_type": "boost_number",
//       "value": 40
//     },
//     {
//       "trait_type": "stamina_increase",
//       "display_type": "boost_percentage",
//       "value": 10
//     },
//     {
//       "trait_type": "generation",
//       "display_type": "number",
//       "value": 2
//     }
//   ]
// }
// `;
