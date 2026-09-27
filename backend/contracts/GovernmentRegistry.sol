// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GovernmentRegistry {
    address public admin;

    struct GovernmentID {
        string id;
        string idType;
        string holderName;
        string holderWallet;
        string ipfs;
        uint256 date;
        bool valid;
    }

    mapping(string => GovernmentID) public records;
    mapping(address => string[]) public holderRecords;
    string[] public allIds;
    uint256 public total;
    uint256 public revokedCount;

    event Issued(
        string id,
        string idType,
        string holderName,
        string ipfs,
        uint256 date,
        string holderWallet
    );

    event Revoked(string id, uint256 date);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function issue(
        string memory _id,
        string memory _idType,
        string memory _holderName,
        string memory _ipfs,
        string memory _holderWallet
    ) public onlyAdmin {
        require(bytes(_id).length > 0, "ID required");
        require(bytes(_holderName).length > 0, "Name required");
        require(!records[_id].valid, "ID exists");

        records[_id] = GovernmentID({
            id: _id,
            idType: _idType,
            holderName: _holderName,
            holderWallet: _holderWallet,
            ipfs: _ipfs,
            date: block.timestamp,
            valid: true
        });

        allIds.push(_id);
        holderRecords[msg.sender].push(_id);
        total++;

        emit Issued(_id, _idType, _holderName, _ipfs, block.timestamp, _holderWallet);
    }

    function verify(string memory _id)
        public
        view
        returns (
            string memory holderName,
            string memory idType,
            string memory ipfs,
            uint256 date,
            bool valid
        )
    {
        GovernmentID memory r = records[_id];
        return (r.holderName, r.idType, r.ipfs, r.date, r.valid);
    }

    function revoke(string memory _id) public onlyAdmin {
        require(records[_id].valid, "Not found or already revoked");
        records[_id].valid = false;
        revokedCount++;
        emit Revoked(_id, block.timestamp);
    }

    function getRecordsByWallet(string memory _wallet)
        public
        view
        returns (string[] memory)
    {
        string[] memory result = new string[](allIds.length);
        uint256 count = 0;

        for (uint256 i = 0; i < allIds.length; i++) {
            if (
                keccak256(bytes(records[allIds[i]].holderWallet)) ==
                keccak256(bytes(_wallet))
            ) {
                result[count] = allIds[i];
                count++;
            }
        }

        string[] memory trimmed = new string[](count);
        for (uint256 i = 0; i < count; i++) {
            trimmed[i] = result[i];
        }

        return trimmed;
    }

    function getAllIds() public view returns (string[] memory) {
        return allIds;
    }
}