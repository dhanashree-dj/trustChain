// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract DocumentVerification {

    struct Document {
        string documentId;
        string documentHash;
        address issuer;
        uint256 timestamp;
        bool isValid;
    }

    mapping(string => Document) public documents;

    function registerDocument(
        string memory _documentId,
        string memory _documentHash
    ) public {

        documents[_documentId] = Document(
            _documentId,
            _documentHash,
            msg.sender,
            block.timestamp,
            true
        );
    }

    function verifyDocument(
        string memory _documentId,
        string memory _documentHash
    ) public view returns (bool) {

        Document memory doc = documents[_documentId];

        if (
            keccak256(bytes(doc.documentHash)) ==
            keccak256(bytes(_documentHash))
            && doc.isValid == true
        ) {
            return true;
        }

        return false;
    }

    function revokeDocument(
        string memory _documentId
    ) public {

        documents[_documentId].isValid = false;
    }
}