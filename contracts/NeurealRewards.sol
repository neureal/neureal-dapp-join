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

    /*** State Variables ***/
    // TODO Set this to the Neureal multisig wallet that will take the ETH from the sale
    address payable public constant NEUREAL_ETH_WALLET = 0x3B2c9752B55eab06A66A6117E5D428835b03169d;
    // TODO Set this to the address of the wallet that has authority to mint new NFTs
    address public constant MINTING_PROVIDER = 0xf9311383b518Ed6868126353704dD8139f7A30bE;
    
    uint256 public constant MAX_SUPPLY = 9999; // Maximum tokens possible to mint
    uint256 public constant COST_WEI = 1 * 10**15;

    address private _owner; // Contract creator
    function owner() external view returns (address) { return _owner; }

    uint256 private _tokenId = 0; // Unique ID of an NFT
    function tokenId() external view returns (uint256) { return _tokenId; }

    // Mapping from tokenID to allocated address
    mapping (uint256 => address) private _tokenAllocation;
    
    
    /*** Events ***/
    event TokenPurchase(uint256 _tokenId);

    /* Initializes contract */
    constructor() ERC721Full("XYZ NFT Series", "XYZT") public {  _owner = msg.sender; addMinter(MINTING_PROVIDER); }
    // constructor(address minter, uint256 mintcap, string memory name, string memory symbol) ERC721Full(name, symbol) public {
    //     _cap = mintcap;
    //     _owner = msg.sender;
    //     addMinter(minter); // Add allocation minter
    // }

    function mintWithTokenURI(address to, string calldata tokenURI) external {
        require(_tokenId < MAX_SUPPLY); // Contract is finished, everything is minted
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


    /* Token purchase (called whenever someone tries to send ether to this contract) */
    function() external payable {
        require(_tokenId < MAX_SUPPLY, ""); // Contract is finished, everything is minted
        require(msg.value > 10**14, ""); // Stop dust spamming, contract only calls, etc
        require(msg.data.length == 0, ""); // Prevent calls to invalid functions
        require(msg.sender != address(0), ""); // Prevent transfer to 0x0 address
        require(msg.sender != address(this), ""); // Prevent calls from this.transfer(this)
        // assert(address(this).balance >= msg.value, ""); // this.balance gets updated with msg.value before this function starts
        
        // TODO change this to denominate in DAI and use exchange to convert
        // check amount
        uint256 tokens = msg.value.div(COST_WEI);
        require(tokens != 0, ""); // Must purchase at least one item
        uint256 maxTokenId = _tokenId.add(tokens);
        require(maxTokenId <= MAX_SUPPLY, ""); // Check if there is enough available to allocate, the whole batch or nothing

        address msg_sender = msg.sender;
        for (uint256 i = 0; i < tokens; i++) {
            require(_tokenId < MAX_SUPPLY, ""); // Check if there is enough available to allocate
            _tokenAllocation[_tokenId] = msg_sender;
            _tokenId = _tokenId.add(1);
            emit TokenPurchase(_tokenId);
        }

        // TODO refund change???
        // uint256 refund = msg.value.mod(COST_WEI);
    }

    /* Withdraw current available ETH in contract */
    function withdraw() external {
        require(msg.sender == _owner); // Only owner
        uint256 withdrawalValue = address(this).balance;
        
        NEUREAL_ETH_WALLET.transfer(withdrawalValue); // This works with our multisig (using 2300 gas stipend)
        // require(NEUREAL_ETH_WALLET.call.value(withdrawalValue)()); // alternative to be able to send more gas
    }

    function mintAllocated(uint256 allocatedTokenId, string calldata tokenURI) external {
        address to = _tokenAllocation[allocatedTokenId];
        require(to != address(0), "");
        require(mintWithTokenURI(to, allocatedTokenId, tokenURI), "");
    }
}
