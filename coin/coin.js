'use strict';
// jshint esversion: 8
// jshint node: true
// jshint trailingcomma: false
// jshint undef:true
// jshint unused:false
// jshint varstmt:true
// jshint browser: true 

const ETH_NETWORK_IDS = Object.freeze({MAINNET: 1, ROPSTEN: 3, KOVAN: 42, RINKEBY: 4, GOERLI: 5, 
    BSC: 56, BSC_TEST: 97, POLYGON: 137, POLYGON_TEST: 80001, GANACHE: 5777});
const DEPLOYED_NETWORK = ETH_NETWORK_IDS.RINKEBY;
const BLOCKCHAIN_EVENT_LOG = false;

const contractAddress = "0x7C4DBFF5496c64DdA9323e21837B0c69802F4E2f";
// const coinContractName    = "TestERC20";
const d = document;
let accountAddress = null;
let accountBalance = 0;
let stakingBalance = 0;
let allowanceBalance = 0;

let networkID = null;
let contractJson = null;
let contract = null;

//from chain:
let totalSupply = 0;
let contractName = null;
let contractSymbol = null;
let contractPaused = null;

function networkIDToString(_id)
{
    _id = parseInt(_id);
    switch (_id) 
    {
        case ETH_NETWORK_IDS.MAINNET:
            return "Ethereum Mainnet";
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
        case ETH_NETWORK_IDS.GANACHE:
            return "Ganache";
            break;
        case ETH_NETWORK_IDS.BSC:
            return "Binance Smart Chain Mainnet";
            break;
        case ETH_NETWORK_IDS.BSC_TEST:
            return "Binance Smart Chain TESTnet";
            break;
        case ETH_NETWORK_IDS.POLYGON:
            return "Polygon Mainnet";
            break;
        case ETH_NETWORK_IDS.POLYGON_TEST:
            return "Polygon TESTnet";
            break;
        default:
            return "unknown network ID: " + _id
    }
    return "unknown network ID: " + _id;
}

d.addEventListener('DOMContentLoaded', function()
{
    init();
});

async function init()
{
    contractJson = await(await fetch('../abis/StakerERC20_NoOwner.json')).json(); 
    if (!BLOCKCHAIN_EVENT_LOG) d.querySelector(".logbox").style.display = "none";

    await loadWeb3();
}

async function auxBlockchainMessage()
{
    const sendtoaddress = d.querySelector(".section_blockchain_sendmessage .datasendtoaddress").value;
    // let amount = Number.parseFloat( d.querySelector(".section_blockchain_sendmessage .dataamount").value );
    // amount = amount * 1000000000000000000;
    let amount = 0;
    const message = d.querySelector(".section_blockchain_sendmessage .datamessage").value;

    console.log("sendtoaddress", sendtoaddress);
    console.log("amount", amount);
    console.log("message", message);

    let hex = web3.utils.utf8ToHex(message);
    // console.log("Message: ", msg);
    // console.log("Hex: ", hex);
    // console.log("Revert: ", web3.utils.hexToUtf8(hex));

    const DEFAULT_GASLIMIT_SENDING_ETH = 42000;

    let txTransfer = {};
    txTransfer.from = accountAddress;
    txTransfer.to = sendtoaddress;
    txTransfer.gas = DEFAULT_GASLIMIT_SENDING_ETH;
    txTransfer.value = amount;
    txTransfer.data = hex;
    console.log(`Trying to send ETH from address ${txTransfer.from} to ${txTransfer.to}. Gaslimit: ${txTransfer.gas}. Amount: ${txTransfer.value}. With Message: ${message}`);
    d.querySelector(".auxbox .loader").style.visibility = "visible";

    try {
        let tx = await web3.eth.sendTransaction(txTransfer);
        console.log("tx", tx);
        console.log(`https://rinkeby.etherscan.io/tx/${tx.transactionHash}`);
        if (tx) 
        {
            d.querySelector(".auxbox .loader").style.visibility = "hidden";
            document.querySelector(".section_blockchain_sendmessage .blockchain_sendmessage-tx").innerHTML = 
            `<span class='statusok'>SUCCESS </span> <a href='https://rinkeby.etherscan.io/tx/${tx.transactionHash}' target='_blank'>Link to transaction via block explorer</a>`;
            await initContract();
            rebuildUI();
        }
    } catch (error) {
        d.querySelector(".auxbox .loader").style.visibility = "hidden";
        document.querySelector(".section_blockchain_sendmessage .blockchain_sendmessage-tx").innerHTML = 
            `<span class='warning'>FAILURE</span>`;
        console.log("error", error);
    }
    
}

function wrongNetwork(networkID)
{
    console.log("wrong current network", networkIDToString(networkID));

    d.querySelector(".networkbox .error").innerHTML = "WRONG NETWORK.<br />Please switch to network " + networkIDToString(DEPLOYED_NETWORK);
    d.querySelector(".networkbox .error").style.visibility = "visible";
    d.querySelector(".networkbox .networkchanger").style.display = "block";
    
}

async function initContract()
{
    if (networkID != DEPLOYED_NETWORK) return false;
    
    contract = new window.web3.eth.Contract(contractJson.abi, contractAddress);
    
    if (!contract || contract == null)
    {
        console.error("Contract could not be found.");
        return false;
    }
    totalSupply =  await contract.methods.totalSupply().call();
    contractName = await contract.methods.name().call();
    contractSymbol = await contract.methods.symbol().call();
    contractPaused = await contract.methods.paused().call();

    if (!contractPaused)
    {
        accountBalance   = await contract.methods.balanceOf(accountAddress).call();
        stakingBalance   = await contract.methods.stakeOf(accountAddress).call();
        allowanceBalance = await contract.methods.allowance(accountAddress, contractAddress).call();
    }
    
    if (BLOCKCHAIN_EVENT_LOG)
    {
        let options = {
            filter: {
                value: [],
            },
            fromBlock: 0
        };
        contract.events.Approval(options)
            .on('data', function(tx) {
                let _eventName = tx.event;
                let _blockHash = tx.blockHash;
                let _blockNumber = tx.blockNumber;
                let _values = tx.returnValues;
                let _html = "Undeclared event";
                if (_eventName == "Approval")
                {
                    _html = `\n<p>APPROVAL. Owner <span class='address'>${_values.owner}</span> # Spender <span class='address'>${_values.spender}</span> # Amount <span class='address'>${web3.utils.fromWei(_values.value)}</span></p>`;
                }
                console.log("full EVENT", tx);
                console.log("CHAIN EVENT", _eventName, _values);
                document.querySelector(".logbox .content").innerHTML += _html;
            })
            .on('changed', changed => console.log("events.Approval onchanged", changed))
            .on('error', err => console.error("events.Approval onerror", err))
            .on('connected', str => console.log("events.Approval onconnected", str));
    }
}
/*
PAST EVENTS

let options = {
    filter: {
        value: ['1000', '1337']    //Only get events where transfer value was 1000 or 1337
    },
    fromBlock: 0,                  //Number || "earliest" || "pending" || "latest"
    toBlock: 'latest'
};

myContract.getPastEvents('Transfer', options)
    .then(results => console.log(results))
    .catch(err => throw err);

*/

    /*
This method of subscribing to events is like a “catch-all” method. If you want you can listen to all event logs emitted from the blockchain with this method. 

let options = {
    fromBlock: 0,
    address: ['address-1', 'address-2'],    //Only get events from specific addresses
    topics: []                              //What topics to subscribe to
};

let subscription = web3.eth.subscribe('logs', options,(err,event) => {
    if (!err)
    console.log(event)
});

subscription.on('data', event => console.log(event))
subscription.on('changed', changed => console.log(changed))
subscription.on('error', err => { throw err })
subscription.on('connected', nr => console.log(nr))


web3.eth.clearSubscriptions() //Resets subscriptions.
    */


async function loadWeb3() // this will popup the connect metamask window for confirm
{
    if (window.ethereum) 
    {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();

        window.ethereum.on('accountsChanged', async function (accounts) 
        {
            accountAddress = accounts[0];
            console.log('account was changed to', accountAddress);
            await initContract();
            rebuildUI();
        });

        window.ethereum.on('networkChanged', async function(_nid)
        {
            console.log('network was changed to', networkIDToString(_nid));
            networkID = _nid; 
            await initContract();
            rebuildUI();
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

    accountAddress = (await window.web3.eth.getAccounts())[0];
    networkID = await window.web3.eth.net.getId();
    await initContract();
    rebuildUI();
}


async function contractInteraction_togglePause()
{
    console.log("contractInteraction_togglePause()", "current pause state:", contractPaused);
    let setTo = true;
    if (contractPaused == true) setTo = false;
    console.log("setTo", setTo);
    //await contract.methods.setPaused(setTo).call();
    d.querySelector(".networkbox .loader").style.visibility = "visible";

    try {
        let tx = await contract.methods.setPaused(setTo).send({ from: accountAddress });
        console.log(tx);
        if (tx) 
        {
            d.querySelector(".networkbox .loader").style.visibility = "hidden";
            await initContract();
            rebuildUI();
        }
    } catch (error) {
        d.querySelector(".networkbox .loader").style.visibility = "hidden";
        console.log("error", error);
    }
    
}

async function approveMe()
{
    // _approve(address spender, uint256 amount
    let amount = parseFloat(document.querySelector(".functionbox .section_approve input").value).toString();
    let strAmount = ""+web3.utils.toWei(amount).toString();
    console.log("Gonna approve", strAmount);
    d.querySelector(".walletbox .loader").style.visibility = "visible";
    
    try {
        let tx = await contract.methods.approve( contractAddress, strAmount ).send({ from: accountAddress });
        console.log(tx);
        if (tx) 
        {
            d.querySelector(".walletbox .loader").style.visibility = "hidden";
            await initContract();
            rebuildUI();
        }
    } catch (error) {
        d.querySelector(".walletbox .loader").style.visibility = "hidden";
        console.log("error", error);
    }
}

async function stakeMe()
{
    let amount = parseFloat(document.querySelector(".stakingbox input").value).toString();
    let strAmount = ""+web3.utils.toWei(amount).toString();
    console.log("Gonna stake", strAmount);
    d.querySelector(".walletbox .loader").style.visibility = "visible";
    
    try {
        let tx = await contract.methods.createStake( strAmount ).send({ from: accountAddress });
        console.log(tx);
        if (tx) 
        {
            d.querySelector(".walletbox .loader").style.visibility = "hidden";
            await initContract();
            rebuildUI();
        }
    } catch (error) {
        d.querySelector(".walletbox .loader").style.visibility = "hidden";
        console.log("error", error);
    }
}

async function unstakeMe()
{
    let amount = parseFloat(document.querySelector(".stakingbox input").value).toString();
    let strAmount = ""+web3.utils.toWei(amount).toString();
    console.log("Gonna removeStake", strAmount);
    d.querySelector(".walletbox .loader").style.visibility = "visible";
    
    try {
        let tx = await contract.methods.removeStake( strAmount ).send({ from: accountAddress });
        console.log(tx);
        if (tx) 
        {
            d.querySelector(".walletbox .loader").style.visibility = "hidden";
            await initContract();
            rebuildUI();
        }
    } catch (error) {
        d.querySelector(".walletbox .loader").style.visibility = "hidden";
        console.log("error", error);
    }
    
}

async function burnMe()
{
    let amount = parseFloat(document.querySelector(".functionbox .section_burn input").value).toString();
    let strAmount = ""+web3.utils.toWei(amount).toString();
    console.log(typeof strAmount);
    console.log("Gonna burn", strAmount);
    // web3.utils.from
    //poll amount from textbox
    d.querySelector(".walletbox .loader").style.visibility = "visible";
    
    try {
        let tx = await contract.methods.burn( accountAddress, strAmount ).send({ from: accountAddress });
        console.log(tx);
        if (tx) 
        {
            d.querySelector(".walletbox .loader").style.visibility = "hidden";
            await initContract();
            rebuildUI();
        }
    } catch (error) {
        d.querySelector(".walletbox .loader").style.visibility = "hidden";
        console.log("error", error);
    }
}

async function mintMe()
{
    let amount = parseFloat(document.querySelector(".functionbox .section_mint input").value).toString();
    let strAmount = ""+web3.utils.toWei(amount).toString();
    console.log(typeof strAmount);
    console.log("Gonna mint", strAmount);
    // web3.utils.from
    //poll amount from textbox
    d.querySelector(".walletbox .loader").style.visibility = "visible";
    try {
        let tx = await contract.methods.mint( accountAddress, strAmount ).send({ from: accountAddress });
        console.log(tx);
        if (tx) 
        {
            d.querySelector(".walletbox .loader").style.visibility = "hidden";
            await initContract();
            rebuildUI();
        }
    } catch (error) {
        d.querySelector(".walletbox .loader").style.visibility = "hidden";
        console.log("error", error);
    }
    
}

async function addMyTokenToMetamask()
{
    const wasAdded =await ethereum.request(
    {
        method: 'wallet_watchAsset',
        params: {
            type: 'ERC20', 
            options: {
            address: contractAddress, 
            symbol: 'SENO', 
            decimals: 18
            //image: '', 
            },
        },
    });
}

function rebuildUI()
{
    d.querySelector(".networkbox .networkchanger").style.display = "none";
    d.querySelector(".error").style.visibility = "hidden";
    d.querySelector(".networkbox .box-title").innerHTML = "Chain Data";
    d.querySelector(".networkbox .networkbox-id").innerText = networkIDToString(networkID);
    d.querySelector(".networkbox .networkbox-symbol").innerText = contractSymbol;
    d.querySelector(".networkbox .networkbox-totalsupply").innerText = web3.utils.fromWei(totalSupply);
    d.querySelector(".networkbox .networkbox-paused").innerHTML = (contractPaused ? "<span class='warning'>PAUSED</span>" : "<span class='statusok'>ACTIVE</span>");

    if (contract != null)
    {
        d.querySelector(".networkbox .success").innerText = "SYSTEM READY";
        d.querySelector(".networkbox .success").style.visibility = "visible";
    }
    else 
    {
        d.querySelector(".networkbox .error").innerText = "CANNOT CONNECT";
        d.querySelector(".networkbox .error").style.visibility = "visible";
    }

    d.querySelector(".networkbox .loader").style.visibility = "hidden";
    d.querySelector(".walletbox .walletaddress").innerHTML = "" + accountAddress;
    d.querySelector(".walletbox .walletaddress").title = "" + accountAddress;
    d.querySelector(".walletbox .loader").style.visibility = "hidden";
    if (networkID != DEPLOYED_NETWORK) wrongNetwork(networkID);

    if (contract != null)
    {
        d.querySelector(".stakingbox .loader").style.visibility = "hidden";
        d.querySelector(".functionbox .loader").style.visibility = "hidden";
        d.querySelector(".auxbox .loader").style.visibility = "hidden";
    }

    if (!contractPaused)
    {
        document.querySelector(".walletbox .balanceamount").innerHTML = web3.utils.fromWei(accountBalance)+" "+contractSymbol;
        document.querySelector(".walletbox .staking_balance").innerHTML = web3.utils.fromWei(stakingBalance)+" "+contractSymbol;
        document.querySelector(".walletbox .approvedamount").innerHTML = web3.utils.fromWei(allowanceBalance)+" "+contractSymbol;
    }
    else
    {
        document.querySelector(".walletbox .balanceamount").innerHTML = "<span class='warning'>CONTRACT PAUSED</span>";
        document.querySelector(".walletbox .staking_balance").innerHTML = "<span class='warning'>CONTRACT PAUSED</span>";;
        document.querySelector(".walletbox .approvedamount").innerHTML = "<span class='warning'>CONTRACT PAUSED</span>";;
    }
    
}

async function auxSignProof()
{
    let accounts = await web3.eth.getAccounts();
    if (accounts[0] != accountAddress)
    {
        d.querySelector(".section_signproof").querySelector(".error").innerHTML = "Wrong account selected.";
        return;
    }
    let msg = "I hereby sign this message with my key";
    let sig = await web3.eth.personal.sign(msg, accounts[0], "for unlocked metamask this password field is not relevant");
    let whoSigned = await web3.eth.accounts.recover(msg, sig);
    let success = (whoSigned == accounts[0]);
    if (success)
    {
        d.querySelector(".section_signproof").querySelector(".success").innerHTML = "Signature Success, validated";
        d.querySelector(".section_signproof").querySelector(".success").style.visibility = "visible";
    }
    else
    {
        d.querySelector(".section_signproof").querySelector(".error").innerHTML = "SIGNATURE FAILURE";
        d.querySelector(".section_signproof").querySelector(".error").style.visibility = "visible";
    }

}

async function requestRinkebyNetwork()
{
    try
    {
        await window.ethereum.request(
        {
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x4' }]
        });    
        await initContract();
        rebuildUI();
    }
    catch (error)
    {
        console.error(error);
        return;
    }
    
}


async function auxAddNetwork()
{
    /*
    0x38	56	Binance Smart Chain Main Network (bsc-mainnet)
    0x61	97	Binance Smart Chain Test Network (bsc-testnet)
    */

    if (window.ethereum)
    {
        try
        {
            // check if the chain to connect to is installed
            await window.ethereum.request(
            {
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x38' }], // chainId must be in hexadecimal numbers
            });
        }
        catch (error)
        {
            // This error code indicates that the chain has not been added to MetaMask
            // if it is not, then install it into the user MetaMask
            if (error.code === 4902)
            {
                try
                {
                    await window.ethereum.request(
                    {
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: '0x38', //chain id has to be in hex
                                chainName: 'Binance Smart Chain Mainnet',
                                nativeCurrency: {
                                    name: "Binance Coin",
                                    symbol: "BNB", // 2-6 characters long
                                    decimals: 18
                                },
                                rpcUrls: ['https://bsc-dataseed1.binance.org/'],
                                blockExplorerUrls: ['https://bscscan.com']
                            },
                        ],
                    });
                }
                catch (addError)
                {
                    console.error(addError);
                }
            }
            console.error(error);
        }
    }
    else
    {
        console.log('MetaMask is not installed.');
    }
    
}