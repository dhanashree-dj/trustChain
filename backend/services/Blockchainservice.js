const path = require("path");
const fs = require("fs");
const { Web3 } = require("web3");
require("dotenv").config();

const RPC_URL = process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const web3 = new Web3(RPC_URL);

// Truffle writes compiled artifacts to <project-root>/build/contracts.
// This file lives at backend/services/, so go up two levels to the
// TrustChain root, then into build/contracts.
const artifactPath = path.join(
  __dirname,
  "..",
  "..",
  "build",
  "contracts",
  "DocumentVerification.json"
);

let contract = null;

function getContract() {
  if (contract) return contract;

  if (!fs.existsSync(artifactPath)) {
    throw new Error(
      `Contract artifact not found at ${artifactPath}. Run "npx truffle migrate" from the project root first.`
    );
  }

  if (!CONTRACT_ADDRESS) {
    throw new Error("CONTRACT_ADDRESS is not set in .env");
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  contract = new web3.eth.Contract(artifact.abi, CONTRACT_ADDRESS);
  return contract;
}

async function getDefaultAccount() {
  const accounts = await web3.eth.getAccounts();
  return accounts[0];
}

async function registerDocumentOnChain(documentId, documentHash) {
  const c = getContract();
  const from = await getDefaultAccount();

  const receipt = await c.methods
    .registerDocument(String(documentId), documentHash)
    .send({ from, gas: 300000 });

  return receipt.transactionHash;
}

async function verifyDocumentOnChain(documentId, documentHash) {
  const c = getContract();
  const isValid = await c.methods
    .verifyDocument(String(documentId), documentHash)
    .call();
  return isValid;
}

async function revokeDocumentOnChain(documentId) {
  const c = getContract();
  const from = await getDefaultAccount();

  const receipt = await c.methods
    .revokeDocument(String(documentId))
    .send({ from, gas: 100000 });

  return receipt.transactionHash;
}

module.exports = {
  registerDocumentOnChain,
  verifyDocumentOnChain,
  revokeDocumentOnChain,
};