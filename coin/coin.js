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
const DEPLOYED_NETWORK = ETH_NETWORK_IDS.GANACHE;

const coinContractAddress = "0x5E9daA2534Fc4813006a10B51845C8AB56bf3325";
// const coinContractName    = "TestERC20";
const d = document;
let accountAddress = null;
let accountBalance = 0;
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

    //d.querySelector(".sendmessagebox .sendbutton").click = buttonSendTransactionWithMessage;
    await loadWeb3();
}

async function auxBlockchainMessage()
{
    const sendtoaddress = d.querySelector(".section_blockchain_sendmessage .datasendtoaddress").value;
    let amount = Number.parseFloat( d.querySelector(".section_blockchain_sendmessage .dataamount").value );
    const message = d.querySelector(".section_blockchain_sendmessage .datamessage").value;

    amount = amount * 1000000000000000000;

    console.log("sendtoaddress", sendtoaddress);
    console.log("amount", amount);
    console.log("message", message);
    let tx = await sendTransactionWithMessage(accountAddress, sendtoaddress, message, amount);

    document.querySelector(".section_blockchain_sendmessage .blockchain_sendmessage-tx").innerHTML = `<a href='https://rinkeby.etherscan.io/tx/${tx.transactionHash}' target='_blank'>Link to transaction via block explorer</a>`;
}

async function sendTransactionWithMessage(_fromAddr, _toAddr, msg, amount)
{
    let hex = web3.utils.utf8ToHex(msg);
    // console.log("Message: ", msg);
    // console.log("Hex: ", hex);
    // console.log("Revert: ", web3.utils.hexToUtf8(hex));

    const DEFAULT_GASLIMIT_SENDING_ETH = 42000;

    let txTransfer = {};
    txTransfer.from = _fromAddr;
    txTransfer.to = _toAddr;
    txTransfer.gas = DEFAULT_GASLIMIT_SENDING_ETH;
    txTransfer.value = amount;
    txTransfer.data = hex;
    console.log(`Trying to send ETH from address ${txTransfer.from} to ${txTransfer.to}. Gaslimit: ${txTransfer.gas}. Amount: ${txTransfer.value}. With Message: ${msg}`);
    let tx = await web3.eth.sendTransaction(txTransfer);
    console.log("tx", tx);
    console.log(`https://rinkeby.etherscan.io/tx/${tx.transactionHash}`);
    return tx;
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

    contract = new window.web3.eth.Contract(contractJson.abi, coinContractAddress);
    if (!contract || contract == null)
    {
        console.error("Contract could not be found.");
        return false;
    }
    totalSupply =  web3.utils.fromWei(await contract.methods.totalSupply().call());
    contractName = await contract.methods.name().call();
    contractSymbol = await contract.methods.symbol().call();
    contractPaused = await contract.methods.paused().call();

    accountBalance = await contract.methods.balanceOf(accountAddress).call();
    console.log("type of accountbalance", accountBalance);
}

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
    let tx = await contract.methods.setPaused(setTo).send({ from: accountAddress });
    console.log(tx);

    await initContract();
    rebuildUI();
}

async function burnMe()
{
    let amount = parseFloat(document.querySelector(".functionbox .section_burn input").value).toString();
    let strAmount = ""+web3.utils.toWei(amount).toString();
    console.log(typeof strAmount);
    console.log("Gonna burn", strAmount);
    // web3.utils.from
    //poll amount from textbox
    let tx = await contract.methods.burn( accountAddress, strAmount ).send({ from: accountAddress });
    console.log(tx);
    if (tx)
    {
        setTimeout(async function()
        {
            await initContract();
            rebuildUI();
        }, 7000);
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
    let tx = await contract.methods.mint( accountAddress, strAmount ).send({ from: accountAddress });
    console.log(tx);
    if (tx)
    {
        setTimeout(async function()
        {
            await initContract();
            rebuildUI();
        }, 7000);
    }
}

async function addMyTokenToMetamask()
{
    await ethereum.request(
    {
        method: 'wallet_watchAsset',
        params: {
            type: 'ERC20', 
            options: {
            address: '', 
            symbol: '', 
            decimals: 0, 
            image: '', 
            },
        },
    });
}

async function auxAddToMetamask()
{
    const wasAdded = await ethereum.request(
    {
        method: 'wallet_watchAsset',
        params: {
            type: 'ERC20', 
            options: {
            address: '0xd00981105e61274c8a5cd5a88fe7e037d935b513', 
            symbol: 'TUT', 
            decimals: 18, 
            image: 'http://placekitten.com/200/300', 
            },
        },
    });
    
    if (wasAdded)
    {
        //added
    }
    else
    {
        //rejected
    }
}

function rebuildUI()
{
    d.querySelector(".networkbox .networkchanger").style.display = "none";
    d.querySelector(".error").style.visibility = "hidden";
    d.querySelector(".networkbox .box-title").innerHTML = "Chain Data";
    d.querySelector(".networkbox .networkbox-id").innerText = networkIDToString(networkID);
    d.querySelector(".networkbox .networkbox-symbol").innerText = contractSymbol;
    d.querySelector(".networkbox .networkbox-totalsupply").innerText = totalSupply;
    d.querySelector(".networkbox .networkbox-paused").innerText = contractPaused;

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
    d.querySelector(".walletbox .box-title").innerHTML = "Your Wallet Address:";
    d.querySelector(".walletbox .content").innerHTML = "" + accountAddress;
    d.querySelector(".walletbox .loader").style.visibility = "hidden";
    if (networkID != DEPLOYED_NETWORK) wrongNetwork(networkID);

    if (contract != null)
    {
        d.querySelector(".stakingbox .loader").style.visibility = "hidden";
        d.querySelector(".functionbox .loader").style.visibility = "hidden";
    }

    document.querySelector(".walletbox .balanceamount").innerText = web3.utils.fromWei(accountBalance);
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