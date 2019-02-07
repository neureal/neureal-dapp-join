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

// const uint256MAX = web3.utils.toBN('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF');
// function inputToUint256 (inv) {
//   const invt = +inv;
//   if (isNaN(invt) || invt % 1 !== 0) inv = web3.utils.utf8ToHex(inv);
//   inv = web3.utils.toBN(inv).abs();
//   if (inv.gt(uint256MAX)) throw new Error('web3 uint256 overflow!');
//   return inv;
// }

// TODO figure out better gasLimit and prices

async function pinIpfs (gateway, hash) {
  if (gateway === null) return;
  const call = `${gateway}/api/v0/pin/add?arg=/ipfs/${hash}&recursive=true`;
  const response = await fetch(call);
  if (!response.ok) throw new Error('pinIpfs HTTP error, status = ' + response.status);
  const json = await response.text();
  const hashRsp = JSON.parse(json)['Pins'];
  return (hashRsp) ? hashRsp[0] === hash : false;
}

// TODO add progress bars
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

        // Get current contract address
        const urlParams = new URLSearchParams(window.location.search);
        const ipfsApiGtwyBkupHost = urlParams.get('ipfs');
        const ipfsApiGtwyBkup = (ipfsApiGtwyBkupHost === null) ? null : (new URL(`https://${ipfsApiGtwyBkupHost}`)).toString().slice(0, -1);
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
          $('#div_deploy #button_deploy').click(async function () {
            try {
              // const inputname = $('#div_deploy #input_name').val(); if (inputname.length > 32) throw new Error('Contract name too long.');
              // const inputsymbol = $('#div_deploy #input_symbol').val(); if (inputsymbol.length > 8) throw new Error('Contract symbol too long.');
              // curContract = await NeurealRewards.deploy({ arguments: [inputname, inputsymbol], data: NeurealRewards.options.data }).send({ gas: 6000000 });
              curContract = await NeurealRewards.deploy({ data: NeurealRewards.options.data }).send({ gas: 6000000 });
              window.location.search = 'contract=' + encodeURI(curContract.options.address);
            } catch (err) { error(err); }
          });
          return;
        }
        $('#div_mint #hdr').click(async function () { $('#div_mint #span_content').toggleClass('w3-hide'); });
        $('#div_list_id #hdr').click(async function () { $('#div_list_id #span_content').toggleClass('w3-hide'); });
        $('#div_list_owner #hdr').click(async function () { $('#div_list_owner #span_content').toggleClass('w3-hide'); });
        $('#div_list #hdr').click(async function () { $('#div_list #span_content').toggleClass('w3-hide'); });

        // Contract Info
        const name = await curContract.methods.name().call();
        $('#div_info #text_name').text(name);
        const symbol = await curContract.methods.symbol().call();
        $('#div_info #text_symbol').text(symbol);
        $('#div_info #text_address').text(curContract.options.address);
        const accounts = await web3.eth.getAccounts();
        if (accounts.length < 1) throw new Error('No accounts available.');
        const divInfo = $('#div_info');
        for (var i = 0; i < 3 && i < accounts.length; i++) {
          const minter = await curContract.methods.isMinter(accounts[i]).call();
          const balance = await web3.eth.getBalance(accounts[i]);
          const item = `<p>Account[${i}]: ${accounts[i]}<br>owner? ${minter} | ${web3.utils.fromWei(balance)} ETH</p>`;
          divInfo.append(item);
        }

        // Mint NFT
        // $('#div_mint #input_json').val(jsonex);
        // TODO ping this after change: https://rinkeby-api.opensea.io/api/v1/asset/<your_contract_address>/<token_id>/?force_update=true
        $('#div_mint #button_execute').click(async function () {
          try {
            $('#div_mint #span_content #d').remove();
            const owner = $('#div_mint #input_address').val();
            if (!web3.utils.isAddress(owner)) throw new Error('Address is not a correctly formated Ethereum address.');
            // const id = inputToUint256($('#div_mint #input_id').val());
            let json = {};
            const inputimageurl = $('#div_mint #input_image_url');
            if (inputimageurl.prop('files').length > 0) {
              const hash = await EmbarkJS.Storage.uploadFile(inputimageurl);
              await pinIpfs(ipfsApiGateway, hash); await pinIpfs(ipfsApiGtwyBkup, hash);
              json['image_url'] = ipfsLiveGateway + '/ipfs/' + hash;
            }
            const inputname = $('#div_mint #input_name').val(); if (inputname !== '') json['name'] = inputname;
            const inputdescription = $('#div_mint #input_description').val(); if (inputdescription !== '') json['description'] = inputdescription;
            const inputbackgroundcolor = $('#div_mint #input_background_color').val(); if (inputbackgroundcolor !== '') json['background_color'] = inputbackgroundcolor;
            const inputtraits = JSON.parse('[' + $('#div_mint #input_traits').val() + ']'); if (inputtraits.length > 0) json['traits'] = inputtraits;
            const hash = await EmbarkJS.Storage.saveText(JSON.stringify(json));
            await pinIpfs(ipfsApiGateway, hash); await pinIpfs(ipfsApiGtwyBkup, hash);
            const uri = ipfsLiveGateway + '/ipfs/' + hash; // 'fs:/ipfs/','/ipfs/','ipfs/' didn't work on OpenSea
            const receipt = await curContract.methods.mintWithTokenURI(owner, uri).send({ gas: 4000000 });
            const id = receipt.events['Transfer'].returnValues.tokenId;
            const item = `<p id="d">NFT | <a href="${uri}" target="_blank">MetaData</a> | <a href="${OpenSeaLink}/${curContract.options.address}/${id}" target="_blank">OpenSea</a> | ID[${id}]</p>`;
            $('#div_mint #span_content').append(item);
          } catch (err) { error(err); }
        });

        // Get an NFT by ID
        $('#div_list_id #button_query').click(async function () {
          try {
            $('#div_list_id #span_content #d').remove();
            // const id = inputToUint256($('#div_list_id #input_id').val());
            const id = web3.utils.toBN($('#div_list_id #input_id').val());
            const owner = await curContract.methods.ownerOf(id).call();
            const uri = await curContract.methods.tokenURI(id).call();
            const item = `<p id="d">NFT | <a href="${uri}" target="_blank">MetaData</a> | <a href="${OpenSeaLink}/${curContract.options.address}/${id}" target="_blank">OpenSea</a> | ID[${id}] Owner[${owner}]</p>`;
            $('#div_list_id #span_content').append(item);
          } catch (err) { error(err); }
        });

        // List NFTs owned by address
        $('#div_list_owner #button_list').click(async function () {
          try {
            $('#div_list_owner #span_content #d').remove();
            const owner = $('#div_list_owner #input_address').val();
            if (!web3.utils.isAddress(owner)) throw new Error('Address is not a correctly formated Ethereum address.');
            const count = await curContract.methods.balanceOf(owner).call();
            for (var i = 0; i < count; i++) {
              const id = await curContract.methods.tokenOfOwnerByIndex(owner, i).call();
              const uri = await curContract.methods.tokenURI(id).call();
              const item = `<p id="d">NFT | <a href="${uri}" target="_blank">MetaData</a> | <a href="${OpenSeaLink}/${curContract.options.address}/${id}" target="_blank">OpenSea</a> | ID[${id}]</p>`;
              $('#div_list_owner #span_content').append(item);
            }
          } catch (err) { error(err); }
        });

        // List all minted NFTs
        $('#div_list #button_list').click(async function () {
          try {
            $('#div_list #span_content #d').remove();
            const count = await curContract.methods.totalSupply().call();
            for (var i = 0; i < count; i++) {
              const id = await curContract.methods.tokenByIndex(i).call();
              const owner = await curContract.methods.ownerOf(id).call();
              const uri = await curContract.methods.tokenURI(id).call();
              const item = `<p id="d">NFT | <a href="${uri}" target="_blank">MetaData</a> | <a href="${OpenSeaLink}/${curContract.options.address}/${id}" target="_blank">OpenSea</a> | ID[${id}] Owner[${owner}]</p>`;
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