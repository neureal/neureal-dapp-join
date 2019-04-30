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
    // address payable public constant NEUREAL_ETH_WALLET = 0xb659137d98B9904d39B2c21560E6Cf6ea95b4a12; // mainnet
    address payable public constant NEUREAL_ETH_WALLET = 0x3B2c9752B55eab06A66A6117E5D428835b03169d; // testnet
    // TODO Set this to the address of the wallet that has authority to mint new NFTs
    // address private constant MINTING_PROVIDER = 0x5D1189578df87a4Db81eAf48677F291D66AcC23c; // mainnet
    address private constant MINTING_PROVIDER = 0xf9311383b518Ed6868126353704dD8139f7A30bE; // testnet

    // TODO set these to Mainnet on release https://developer.kyber.network/docs/MainnetEnvGuide/
    // IKyberNetworkProxy public constant KYBER_NETWORK_PROXY = IKyberNetworkProxy(0x818E6FECD516Ecc3849DAf6845e3EC868087B755); // Mainnet
    IKyberNetworkProxy public constant KYBER_NETWORK_PROXY = IKyberNetworkProxy(0x692f391bCc85cefCe8C237C01e1f636BbD70EA4D); // Kovan
    // IERC20 public constant DAI_TOKEN_ADDRESS = IERC20(0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359); // Mainnet
    IERC20 public constant DAI_TOKEN_ADDRESS = IERC20(0xC4375B7De8af5a38a93548eb8453a498222C4fF2); // Kovan
    IERC20 public constant ETH_TOKEN_ADDRESS = IERC20(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE); // Same for all networks
    
    
    uint256 public constant MAX_SUPPLY = 115; // TODO set maximum tokens possible to mint
    uint256 public constant COST_DAI = 1 * 10**17; // TODO set DAI price of single card here

    address private _owner; // Contract creator
    // function owner() external view returns (address) { return _owner; }

    uint256 private _tokenId = 0; // Unique ID of an NFT
    function tokenId() external view returns (uint256) { return _tokenId; }

    // Mapping from tokenID to allocated address
    mapping (uint256 => address) private _tokenAllocation;
    
    
    /*** Events ***/
    event TokenPurchase(uint256 _tokenId);

    /* Initializes contract */
    // TODO change name before making live
    constructor() ERC721Full("XYZ NFT Series", "XYZT") public {
        _owner = msg.sender;
        addMinter(MINTING_PROVIDER); // Add allocation minter
        renounceMinter(); // Remove owner as minter for security
    }
    // constructor(address minter, uint256 mintcap, string memory name, string memory symbol) ERC721Full(name, symbol) public {
    //     _maxSupply = mintcap;
    //     _owner = msg.sender;
    //     addMinter(minter); // Add allocation minter
    // }

    // To mint, call mintWithTokenURI(to, tokenId, tokenURI)
    // to read asset url, call tokenURI(tokenId)
    
    // TODO override tokenURI(tokenId) to combine an ipfs host, stored seperately and changeable, with the unchangeable ipfs url, ie
    // "https://ipfs.infura.io" + "/ipfs/QmcvYFgYKZa4pzSgTYktHKY8m6bSFsVBmYXPTWEMVv9Sne"
    // TODO look at Status plugin to see how to put public dapp on Status on phone
    // TODO add ability to detect DAI and other ERC20 tokens on Kyber that are sent to the contract and allocate NFT to value
    // https://www.wealdtech.com/articles/ethereum-smart-service-payment-with-tokens/

    // /* Manual minting */
    // function mintWithTokenURI(address to, string calldata tokenURI) external {
    //     require(_tokenId < MAX_SUPPLY, ""); // Contract is finished, everything is minted
    //     require(mintWithTokenURI(to, _tokenId, tokenURI), "");
    //     _tokenId = _tokenId.add(1);
    // }

    /* Current ETH/DAI market rate */
    function getExpectedRate() external view returns(uint256 expectedRate, uint256 slippageRate) {
        return KYBER_NETWORK_PROXY.getExpectedRate(ETH_TOKEN_ADDRESS, DAI_TOKEN_ADDRESS, 1 * 10**18);
    }
    
    /* Token purchase (called whenever someone tries to send ether to this contract) */
    function() external payable {
        require(_tokenId < MAX_SUPPLY, ""); // Contract is finished, everything is minted
        require(msg.value > 10**14, ""); // Stop dust spamming, contract only calls, etc
        require(msg.data.length == 0, ""); // Prevent calls to invalid functions
        require(msg.sender != address(0), ""); // Prevent minting to 0x0 address
        require(msg.sender != address(this), ""); // Prevent calls from this.transfer(this)
        // assert(address(this).balance >= msg.value, ""); // this.balance gets updated with msg.value before this function starts
        
        uint256 minRate; // The trade rate from ETH to DAI, example: 140000000000000000000 (1 ETH = 140 DAI)
        (, minRate) = KYBER_NETWORK_PROXY.getExpectedRate(ETH_TOKEN_ADDRESS, DAI_TOKEN_ADDRESS, msg.value);
        // will send back tokens to this contract's address, returns example: 10000000000000000000 (10 DAI)
        uint256 traded = KYBER_NETWORK_PROXY.swapEtherToToken.value(msg.value)(DAI_TOKEN_ADDRESS, minRate);

        // check amount
        uint256 tokens = traded.div(COST_DAI);
        require(tokens != 0, ""); // Must purchase at least one item
        // uint256 maxTokenId = _tokenId.add(tokens);
        // require(maxTokenId <= MAX_SUPPLY, ""); // the whole batch or revert, not needed, will not emit any events

        address msg_sender = msg.sender;
        for (uint256 i = 0; i < tokens; i++) {
            require(_tokenId < MAX_SUPPLY, ""); // Check if there is enough available to allocate
            _tokenAllocation[_tokenId] = msg_sender;
            emit TokenPurchase(_tokenId);
            _tokenId = _tokenId.add(1);
        }

        // TODO stop reentrancy
        // TODO refund change???
        // uint256 refund = msg.value.mod(COST_WEI);
    }

    /* Mint an allocated token, every token must be allocated before minting */
    function mintAllocated(uint256 allocatedTokenId, string calldata tokenURI) external {
        require(allocatedTokenId < _tokenId, ""); // Restrict to currently allocated tokens
        address to = _tokenAllocation[allocatedTokenId];
        require(to != address(0), ""); // Prevent minting to 0x0 address
        require(mintWithTokenURI(to, allocatedTokenId, tokenURI), "");
    }

    /* Current available specified ERC20 token in contract */
    function getTokenBalance(IERC20 token) external view returns(uint256 tokenBalance) {
        return token.balanceOf(address(this));
    }

    /* Withdraw all current available specified ERC20 token in contract */
    function withdrawToken(IERC20 token) external {
        require(msg.sender == _owner, ""); // Only owner
        uint256 amount = token.balanceOf(address(this));
        require(amount > 0, ""); // Don't call transfer if nothing available
        // emit TokenWithdraw(token, amount, NEUREAL_ETH_WALLET);
        // TODO Embark fails to recognize this transaction finishing because of this external function call
        require(token.transfer(NEUREAL_ETH_WALLET, amount), "");
    }
    // event TokenWithdraw(IERC20 token, uint256 amount, address sendTo);

    /* Withdraw all current available ETH in contract, this is for failsafe purposes only */
    function withdrawEther() external {
        // TODO I have not tested if this works
        require(msg.sender == _owner, ""); // Only owner
        uint256 amount = address(this).balance;
        require(amount > 0, ""); // Don't call transfer if nothing available
        // emit EtherWithdraw(amount, NEUREAL_ETH_WALLET);
        NEUREAL_ETH_WALLET.transfer(amount); // This works with our multisig (using 2300 gas stipend)
        // require(NEUREAL_ETH_WALLET.call.value(amount)(), ""); // alternative to be able to send more gas
    }
    // event EtherWithdraw(uint256 amount, address sendTo);
}
