// imports
// main function (not needed here)
// calling of main function (not needed here)

// function deployFunc(hre) {
//     console.log("Hi")
// }

// module.exports.default = deployFunc()

// or alternative below (cleaner)

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
// equivalent to
// const helperConfig = require("../helper-hardhat-config")
// const networkConfig = helperConfig.networkConfig
const { getNamedAccounts, deployments, network } = require("hardhat")
const { verify } = require("../utils/verify")

// module.exports = async (hre) => {
//    const { getNamedAccounts, deployments } = hre
module.exports = async ({ getNamedAccounts, deployments }) => {
    // hre.getNamedAccounts
    // hre.deployments
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    //if chainId is X use address Y
    //if chainId is Z use address W
    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    log("----------------------------------------------------")
    log("Deploying FundMe and waiting for confirmations...")
    // if contract does not exist we create a minimal version of it for our local testing

    // wehat happens when we want to change chains
    // when going for a localhost or hardhat network we want to use a mock

    const args = [ethUsdPriceFeedAddress]

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // put price feed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log(`FundMe deployed at ${fundMe.address}`)

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        // verify contracts
        await verify(fundMe.address, args)
    }

    log("--------------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
