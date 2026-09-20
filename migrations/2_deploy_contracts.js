const DocumentVerification = artifacts.require("DocumentVerification");

module.exports = async function (deployer) {
    await deployer.deploy(DocumentVerification);
};