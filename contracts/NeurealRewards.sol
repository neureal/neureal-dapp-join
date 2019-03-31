pragma solidity 0.5.2;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721MetadataMintable.sol";

/**
 * @title NeurealRewards
 * Neureal NeurealRewards - Neureal Foundation NFT for rewarding contributors
 * @dev 
 */
contract NeurealRewards is ERC721Full, ERC721MetadataMintable {
    using SafeMath for uint256;
    // using Address for address;

    /*** TODO Testing (remove for production) ***/
    // uint256 public constant OPENING_RATE = 6400;

    /*** State Variables ***/
    uint256 private _cap;
    function cap() public view returns (uint256) { return _cap; }

    uint256 private _tokenId = 0;
    function tokenId() public view returns (uint256) { return _tokenId; }

    // Mapping from token ID to allocated address
    mapping (uint256 => address) private _tokenAllocation;
    
    
    /*** Events ***/

    /* Initializes contract */
    // constructor(address account) ERC721Full("Neureal Rewards", "NEUR") public {
    constructor(address minter, uint256 mintcap, string memory name, string memory symbol) ERC721Full(name, symbol) public {
        _cap = mintcap;
        addMinter(minter); // Add allocation minter
    }

    function mintWithTokenURI(address to, string calldata tokenURI) external {
        require(mintWithTokenURI(to, _tokenId, tokenURI), "");
        _tokenId = _tokenId.add(1);
    }
    // To mint, call mintWithTokenURI(to, tokenId, tokenURI)
    // to read asset url, call tokenURI(tokenId)
    
    // TODO override tokenURI(tokenId) to combine an ipfs host, stored seperately and changeable, with the unchangeable ipfs url, ie
    // "https://ipfs.infura.io" + "/ipfs/QmcvYFgYKZa4pzSgTYktHKY8m6bSFsVBmYXPTWEMVv9Sne"
    // TODO make public facing dapp that lets people send ETH or DAI here, how to seperate public and admin?
    // TODO add this in with reward amount levels that auto mint for public dapp
    // TODO look at Status plugin to see how to put public dapp on Status on phone
    // /* (called whenever someone tries to send ether to this contract) */
    function() external payable {
        require(msg.value != 0, ""); // Stop spamming, contract only calls, etc
        require(msg.data.length == 0); // Prevent calls to invalid functions
        require(msg.sender != address(0), ""); // Prevent transfer to 0x0 address
        require(msg.sender != address(this), ""); // Prevent calls from this.transfer(this)
        // assert(address(this).balance >= msg.value, ""); // this.balance gets updated with msg.value before this function starts

        //check amount
        //save msg.sender

        //lock in current token Id
        _tokenId = _tokenId.add(1);
    }

    function mintAllocated(uint256 allocatedTokenId, string calldata tokenURI) external {
        address to = _tokenAllocation[allocatedTokenId];
        require(to != address(0), "");
        require(mintWithTokenURI(to, allocatedTokenId, tokenURI), "");
    }
}
