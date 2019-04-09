pragma solidity 0.5.2;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721MetadataMintable.sol";
import "./IKyberNetworkProxy.sol";

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

    // TODO set these to Mainnet on release https://developer.kyber.network/docs/MainnetEnvGuide/
    // IKyberNetworkProxy public constant KYBER_NETWORK_PROXY = IKyberNetworkProxy(0x818E6FECD516Ecc3849DAf6845e3EC868087B755); // Mainnet
    IKyberNetworkProxy public constant KYBER_NETWORK_PROXY = IKyberNetworkProxy(0x692f391bCc85cefCe8C237C01e1f636BbD70EA4D); // Kovan
    // IERC20 public constant DAI_TOKEN_ADDRESS = IERC20(0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359); // Mainnet
    IERC20 public constant DAI_TOKEN_ADDRESS = IERC20(0xC4375B7De8af5a38a93548eb8453a498222C4fF2); // Kovan
    IERC20 public constant ETH_TOKEN_ADDRESS = IERC20(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE); // Same for all networks
    
    
    uint256 public constant MAX_SUPPLY = 7200; // Maximum tokens possible to mint
    uint256 public constant COST_DAI = 1 * 10**17; // TODO set DAI price of single card here

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

    function getExpectedRate() external view returns(uint256 expectedRate, uint256 slippageRate) {
        return KYBER_NETWORK_PROXY.getExpectedRate(ETH_TOKEN_ADDRESS, DAI_TOKEN_ADDRESS, 1 * 10**18);
    }
    
    /* Token purchase (called whenever someone tries to send ether to this contract) */
    function() external payable {
        require(_tokenId < MAX_SUPPLY, ""); // Contract is finished, everything is minted
        require(msg.value > 10**14, ""); // Stop dust spamming, contract only calls, etc
        require(msg.data.length == 0, ""); // Prevent calls to invalid functions
        require(msg.sender != address(0), ""); // Prevent transfer to 0x0 address
        require(msg.sender != address(this), ""); // Prevent calls from this.transfer(this)
        // assert(address(this).balance >= msg.value, ""); // this.balance gets updated with msg.value before this function starts
        
        // TODO change this to denominate in DAI and use exchange to convert
        uint256 minRate;
        (, minRate) = KYBER_NETWORK_PROXY.getExpectedRate(ETH_TOKEN_ADDRESS, DAI_TOKEN_ADDRESS, msg.value);
        // will send back tokens to this contract's address
        uint256 traded = KYBER_NETWORK_PROXY.swapEtherToToken.value(msg.value)(DAI_TOKEN_ADDRESS, minRate);

        // check amount
        uint256 tokens = traded.div(COST_DAI);
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

        // TODO stop reentrancy
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
