const ETH_NETWORK_IDS = Object.freeze({MAINNET: 1, ROPSTEN: 3, KOVAN: 42, RINKEBY: 4, GOERLI: 5});
const DEPLOYED_NETWORK = ETH_NETWORK_IDS.RINKEBY;

let d = document;
let ui = {}; //uicache
//const erc20ABI = abi();

let accountAddress;
let nftcontractJson;
let contractAddress;
let contractABI;
let contract;

let totalSupply;
let chainData = [];

function networkIDToString(_id)
{
    _id = parseInt(_id);
    switch (_id) 
    {
        case ETH_NETWORK_IDS.MAINNET:
            return "Mainnet";
            break;
        case ETH_NETWORK_IDS.ROPSTEN:
            return "Ropsten";
            break;
        case ETH_NETWORK_IDS.KOVAN:
            return "Kovan";
            break;
        case ETH_NETWORK_IDS.RINKEBY:
            return "Rinkeby";
            break;
        case ETH_NETWORK_IDS.GOERLI:
            return "Goerli";
            break;
        default:
            return "unknown network ID: " + _id
    }
    return "unknown network ID: " + _id;
}

async function init()
{
    const nftcontractJsonFILE = await fetch('../abis/MyNFTContract.json'); 
    nftcontractJson = await nftcontractJsonFILE.json();

    await loadWeb3();
    let r = await initContract();
    if (r != -1) await loadChainData();
    if (r != -1) buildUI();
}

d.addEventListener('DOMContentLoaded', function()
{
    ui.signbox = d.querySelector(".signbox");

    //d.querySelector("#muhfield").innerHTML = "yello";
    init();
});

function wrongNetwork(networkID)
{
    //TODO: push network error message to ui
    console.log("wrong current network", networkIDToString(networkID));
}

async function loadWeb3() // this will popup the connect metamask window for confirm
{
    if (window.ethereum) 
    {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();

        window.ethereum.on('accountsChanged', function (accounts) 
        {
            console.log('accountsChanges', accounts);
        });

        window.ethereum.on('networkChanged', function(networkId)
        {
            console.log('networkChanged', networkId);
            if (networkId != DEPLOYED_NETWORK) wrongNetwork(networkId);
        });
        console.log('NETWORK:', networkIDToString(window.ethereum.networkVersion));
    }
    else if (window.web3) 
    {
        window.web3 = new Web3(window.web3.currentProvider);
    }
    else
    {
        console.log("ERROR: no web3 provider");
    }
    let accounts = await window.web3.eth.getAccounts();
    accountAddress = accounts[0];
    d.querySelector(".walletbox .walletaddress").innerHTML = accountAddress;
    // d.querySelector(".walletbox .loader").style.display = "none";
    d.querySelector(".walletbox .loader").style.visibility = "hidden";
}

async function initContract()
{
    const providerNetworkId = await window.web3.eth.net.getId();
    if (providerNetworkId != DEPLOYED_NETWORK)
    {
        wrongNetwork(providerNetworkId);
        return -1;
    }
    //which network. ganache has a network ID, and so does mainnet ETH etc
    const contractNetworkData = nftcontractJson.networks[providerNetworkId];
    if (!contractNetworkData)
    {
        console.log("NO contractNetworkData. Not deployed.");
        return -1;
    }
    contractAddress = contractNetworkData.address; 
    contractABI = nftcontractJson.abi;
    contract = new window.web3.eth.Contract(contractABI, contractAddress);
}

async function loadChainData()
{
    totalSupply = 0;
    totalSupply = await contract.methods.totalSupply().call();
    d.querySelector(".contractbox .loader").style.visibility = "hidden";

    chainData = [];

    for (let i = 0; i < totalSupply; i++)
    {
        const r = await contract.methods.someData(i).call();
        chainData.push(r);
    }
}

function buildUI()
{
    d.querySelector(".totalsupply").innerHTML = totalSupply;
    d.querySelector(".contractaddress").innerHTML = contractAddress;
    
    d.querySelector(".nftlist_entries").innerHTML = "";
    let entriesHTML = "";
    for (let i = 0; i < totalSupply; i++)
    {
        entriesHTML+=`<div class='nftlist_item'>${chainData[i]}</div>`;
    }
    d.querySelector(".nftlist_entries").innerHTML = entriesHTML;

    d.querySelector(".tokendatabox .loader").style.visibility = "hidden";
}

async function mint(_data, _fromAddress)
{
    let receipt = await contract.methods.mint(_data).send({ from: _fromAddress });
    console.log("receipt", receipt);
    await this.loadChainData();
    buildUI();
}

async function sign(_data)
{
    //in the rest of of the dapp, you already check here, if the account here mismatches the account polled earlier and WARN
    let accounts = await web3.eth.getAccounts();
    let msg = _data;
    let sig = await web3.eth.personal.sign(msg, accounts[0], "for unlocked metamask this password field is not relevant");
    let whoSigned = await web3.eth.accounts.recover(msg, sig);
    return (whoSigned == accounts[0]);
}

async function signProcess()
{
    let accounts = await web3.eth.getAccounts();
    if (accounts[0] != accountAddress)
    {
        ui.signbox.querySelector(".error").innerHTML = "Wrong account selected.";
        return;
    }

    let message = "I hereby whatever";

    let result = await sign(message);
    console.log(result);
    if (result) ui.signbox.innerHTML = "Signature Success";
    else        ui.signbox.querySelector(".error").innerHTML = "SIGNATURE FAILURE";
}