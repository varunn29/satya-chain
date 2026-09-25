// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CertificateRegistry {
	address public admin;
	uint256 public total;

	struct Cert {
		string name;
		string course;
		string ipfs;
		uint256 date;
		bool valid;
	}

	mapping(string => Cert) public certs;
	mapping(address => string[]) public studentCerts;

	event Issued(
		string id,
		string name,
		string ipfs,
		uint256 date,
		address studentWallet
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
		string memory id,
		string memory name,
		string memory course,
		string memory ipfs,
		address studentWallet
	) public onlyAdmin {
		require(!certs[id].valid, "ID exists");
		require(bytes(id).length > 0, "ID required");
		require(bytes(name).length > 0, "Name required");
		require(bytes(course).length > 0, "Course required");
		require(bytes(ipfs).length > 0, "IPFS required");
		require(studentWallet != address(0), "Student wallet required");

		certs[id] = Cert(name, course, ipfs, block.timestamp, true);
		studentCerts[studentWallet].push(id);
		total++;
		emit Issued(id, name, ipfs, block.timestamp, studentWallet);
	}

	function getCertificatesByStudent(address student)
		public
		view
		returns (string[] memory)
	{
		return studentCerts[student];
	}

	function verify(string memory id)
		public
		view
		returns (string memory, string memory, string memory, uint256, bool)
	{
		Cert memory c = certs[id];
		return (c.name, c.course, c.ipfs, c.date, c.valid);
	}

	function revoke(string memory id) public onlyAdmin {
		require(certs[id].valid, "Not found");
		certs[id].valid = false;
		emit Revoked(id, block.timestamp);
	}
}
