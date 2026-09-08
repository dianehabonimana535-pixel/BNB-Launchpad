// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title BEP20MemeToken
/// @notice A standalone, self-contained BEP-20 (ERC-20 compatible) token
///         deployed fresh for every token created on the launchpad -- there
///         is no shared factory holding platform authority over anyone's
///         token. Everything a creator needs (the fixed initial supply, the
///         off-chain metadata pointer, and the three revocable authorities)
///         is set once, in the constructor, in the single transaction the
///         user's wallet signs to deploy this contract. There is no
///         separate "revoke" transaction: if the creator chose to revoke an
///         authority in the UI, it is already zeroed out by the time this
///         constructor returns.
contract BEP20MemeToken {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;

    /// @notice IPFS URI for the token's off-chain JSON metadata (logo,
    /// description, social links). Mirrors Metaplex's metadata URI.
    string public metadataURI;

    /// @notice Mirrors Solana's mint authority. While set, this address can
    /// call mint() to create additional supply. Zero address = revoked.
    address public mintAuthority;

    /// @notice Mirrors Solana's freeze authority. While set, this address
    /// can freeze/unfreeze individual holder balances. Zero address =
    /// revoked -- no one can ever freeze a holder again.
    address public freezeAuthority;

    /// @notice Mirrors Solana's metadata update authority. While set, this
    /// address can repoint metadataURI. Zero address = revoked -- metadata
    /// is permanently immutable.
    address public updateAuthority;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => bool) public isFrozen;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event MintAuthorityRevoked();
    event FreezeAuthorityRevoked();
    event UpdateAuthorityRevoked();
    event AccountFrozen(address indexed account);
    event AccountUnfrozen(address indexed account);
    event MetadataUpdated(string newUri);

    modifier onlyMintAuthority() {
        require(msg.sender == mintAuthority, "BEP20MemeToken: not mint authority");
        _;
    }

    modifier onlyFreezeAuthority() {
        require(msg.sender == freezeAuthority, "BEP20MemeToken: not freeze authority");
        _;
    }

    modifier onlyUpdateAuthority() {
        require(msg.sender == updateAuthority, "BEP20MemeToken: not update authority");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _initialSupply,
        address _recipient,
        string memory _metadataURI,
        address _authority,
        bool _revokeMint,
        bool _revokeFreeze,
        bool _revokeUpdate
    ) {
        require(_recipient != address(0), "BEP20MemeToken: recipient is zero address");
        require(_authority != address(0), "BEP20MemeToken: authority is zero address");

        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        metadataURI = _metadataURI;

        _mint(_recipient, _initialSupply);

        mintAuthority = _authority;
        freezeAuthority = _authority;
        updateAuthority = _authority;

        if (_revokeMint) {
            mintAuthority = address(0);
            emit MintAuthorityRevoked();
        }
        if (_revokeFreeze) {
            freezeAuthority = address(0);
            emit FreezeAuthorityRevoked();
        }
        if (_revokeUpdate) {
            updateAuthority = address(0);
            emit UpdateAuthorityRevoked();
        }
    }

    // --- BEP-20 / ERC-20 standard surface ---

    /// @dev Some BSC explorers and older tooling expect this BEP-20
    /// convention alongside the standard ERC-20 interface.
    function getOwner() external view returns (address) {
        return mintAuthority;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        require(allowed >= amount, "BEP20MemeToken: insufficient allowance");
        if (allowed != type(uint256).max) {
            allowance[from][msg.sender] = allowed - amount;
        }
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(to != address(0), "BEP20MemeToken: transfer to zero address");
        require(!isFrozen[from], "BEP20MemeToken: sender account is frozen");
        require(!isFrozen[to], "BEP20MemeToken: recipient account is frozen");
        uint256 fromBalance = balanceOf[from];
        require(fromBalance >= amount, "BEP20MemeToken: insufficient balance");
        balanceOf[from] = fromBalance - amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    // --- Authority-gated actions (no-ops forever once revoked) ---

    function mint(address to, uint256 amount) external onlyMintAuthority {
        _mint(to, amount);
    }

    function revokeMintAuthority() external onlyMintAuthority {
        mintAuthority = address(0);
        emit MintAuthorityRevoked();
    }

    function freeze(address account) external onlyFreezeAuthority {
        isFrozen[account] = true;
        emit AccountFrozen(account);
    }

    function unfreeze(address account) external onlyFreezeAuthority {
        isFrozen[account] = false;
        emit AccountUnfrozen(account);
    }

    function revokeFreezeAuthority() external onlyFreezeAuthority {
        freezeAuthority = address(0);
        emit FreezeAuthorityRevoked();
    }

    function updateMetadata(string calldata newUri) external onlyUpdateAuthority {
        metadataURI = newUri;
        emit MetadataUpdated(newUri);
    }

    function revokeUpdateAuthority() external onlyUpdateAuthority {
        updateAuthority = address(0);
        emit UpdateAuthorityRevoked();
    }
}
