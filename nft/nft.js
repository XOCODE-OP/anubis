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

const contractAddress = "0x60d7c98458Ea3558d8F6335fE5745E4F08a33412";
const d = document;
let accountAddress = null;
// let accountBalance = 0;
// let stakingBalance = 0;
// let allowanceBalance = 0;

let networkID = null;
let contractJson = null;
let contract = null;

//from chain:
// let totalSupply = 0;
let contractNextID = -1;
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
        case ETH_NETWORK_IDS.ROPSTEN:
            return "Ropsten";
        case ETH_NETWORK_IDS.KOVAN:
            return "Kovan";
        case ETH_NETWORK_IDS.RINKEBY:
            return "Rinkeby";
        case ETH_NETWORK_IDS.GOERLI:
            return "Goerli";
        case ETH_NETWORK_IDS.GANACHE:
            return "Ganache";
        case ETH_NETWORK_IDS.BSC:
            return "Binance Smart Chain Mainnet";
        case ETH_NETWORK_IDS.BSC_TEST:
            return "Binance Smart Chain TESTnet";
        case ETH_NETWORK_IDS.POLYGON:
            return "Polygon Mainnet";
        case ETH_NETWORK_IDS.POLYGON_TEST:
            return "Polygon TESTnet";
        default:
            return "unknown network ID: " + _id;
    }
}

d.addEventListener('DOMContentLoaded', function()
{
    init();
});

async function init()
{
    contractJson = await(await fetch('../abis/Showcase721.json')).json(); 
    await loadWeb3();
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
    // totalSupply =  await contract.methods.totalSupply().call();
    contractName = await contract.methods.name().call();
    contractSymbol = await contract.methods.symbol().call();
    contractPaused = await contract.methods.paused().call();
    contractNextID  = await contract.methods.nextTokenID().call();

    
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
            await rebuildUI();
        });

        window.ethereum.on('networkChanged', async function(_nid)
        {
            console.log('network was changed to', networkIDToString(_nid));
            networkID = _nid; 
            await initContract();
            await rebuildUI();
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
    await rebuildUI();
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
            await rebuildUI();
        }
    } catch (error) {
        d.querySelector(".networkbox .loader").style.visibility = "hidden";
        console.log("error", error);
    }
    
}

async function mintNewNFT()
{
    const osirisNFT = await(await fetch(`https://templeosiris.herokuapp.com/create_showcase_nft?addr=${accountAddress}`)).json(); 

    console.log("Gonna mint NFT", osirisNFT);

    d.querySelector(".tokendatabox .loader").style.visibility = "visible";
    d.querySelector(".functionbox .loader").style.visibility = "visible";
    // try {
        let tx = await contract.methods.mint(accountAddress, osirisNFT.nftuuid).send({ from: accountAddress });
        console.log(tx);
        if (tx) 
        {
            await initContract();
            await rebuildUI();

            //send success to the server, which will sync, and thereby also remove it from the unminted list
            //await
            //THEN rebuild
        }
    // } catch (error) {
    //     d.querySelector(".tokendatabox .loader").style.visibility = "hidden";
    //     console.log("error in mint");
    //     //console.log("error", error);
    // }
    
}

function getAllNFTsOfAddress()
{
    //const osirisNFT = await(await fetch(`https://templeosiris.herokuapp.com/get_showcase_nft_data?nft=${nftuuid}`)).json(); 
}

function validAddress(address)
{
    address = address.toLowerCase();
    return /^(0x)?[0-9a-f]{40}$/i.test(address);
}

async function rebuildUI()
{
    d.querySelector(".nftlist_entries").innerHTML = "";
    let tokensOfAddr = null;
    if (!contractPaused) 
    {
        console.log("fetching get_showcase_nfts");
        tokensOfAddr = await(await fetch(`https://templeosiris.herokuapp.com/get_showcase_nfts?addr=${accountAddress}`)).json(); 
        console.log("tokensOfAddr", accountAddress, tokensOfAddr);
        const nftEntriesListDiv = d.querySelector(".nftlist_entries");
        for (let i = 0; i < tokensOfAddr.length; i++)
        {
            const e = tokensOfAddr[i];

            //collist

            const section = document.createElement("section");
            section.classList.add("section_nft");

            const title = document.createElement("p");
            title.innerText = ""+e.title;
            title.classList.add("section_title");

            const allcontent = document.createElement("div");
            allcontent.classList.add("section_allcontent");
            allcontent.style.display = "none";

            title.addEventListener('click', function (){
                if (allcontent.style.display == "none") allcontent.style.display = "block";
                else allcontent.style.display = "none";
            });

            const uuid = document.createElement("p");
            uuid.innerText = ""+e.nftuuid;
            uuid.classList.add("section_uuid");

            const image = document.createElement("img");
            image.src = e.image;

            const textcontent = document.createElement("p");
            textcontent.innerText = ""+e.textcontent;
            textcontent.classList.add("section_textcontent");

            const collist = document.createElement("div");
            collist.classList.add("collist");

            const burnbutton = document.createElement("div");
            burnbutton.classList.add("tilebutton");
            burnbutton.classList.add("section_button");
            burnbutton.innerText = "BURN";
            burnbutton.addEventListener('click', async function (){
                let myTokenID = e.tokenid;
                console.log("burn", myTokenID);
                d.querySelector(".tokendatabox .loader").style.visibility = "visible";
                d.querySelector(".functionbox .loader").style.visibility = "visible";
                let tx = await contract.methods.burn( myTokenID ).send({ from: accountAddress });
                console.log(tx);
                if (tx) 
                {
                    await initContract();
                    await rebuildUI();
                }
            });

            const lockbutton = document.createElement("div");
            lockbutton.classList.add("tilebutton");
            lockbutton.classList.add("section_button");
            if (e.locked)
            {
                lockbutton.innerText = "UNLOCK";
                const lockednote = document.createElement("p");
                lockednote.innerText = "THIS NFT IS LOCKED";
                textcontent.appendChild(lockednote);
                lockbutton.addEventListener('click', async function ()
                {
                    let myTokenID = e.tokenid;
                    console.log("unlock", myTokenID);

                    d.querySelector(".tokendatabox .loader").style.visibility = "visible";
                    d.querySelector(".functionbox .loader").style.visibility = "visible";
                    let tx = await contract.methods.setLocked( myTokenID, false ).send({ from: accountAddress });
                    console.log(tx);
                    if (tx) 
                    {
                        await initContract();
                        await rebuildUI();
                    }

                });
            }
            else
            {
                lockbutton.innerText = "LOCK";
                lockbutton.addEventListener('click', async function ()
                {
                    let myTokenID = e.tokenid;
                    console.log("lock", myTokenID);

                    d.querySelector(".tokendatabox .loader").style.visibility = "visible";
                    d.querySelector(".functionbox .loader").style.visibility = "visible";
                    let tx = await contract.methods.setLocked( myTokenID, true ).send({ from: accountAddress });
                    console.log(tx);
                    if (tx) 
                    {
                        await initContract();
                        await rebuildUI();
                    }
                });
            }

            const transferp = document.createElement("p");
            transferp.style.display = "flex";
            transferp.style.flexDirection = "row";
            const transferToAddressField = document.createElement("input");
            transferToAddressField.placeholder = "To Address 0x...";
            const transferButton = document.createElement("div");
            transferButton.classList.add("tilebutton");
            transferButton.classList.add("section_button");
            transferButton.innerText = "Transfer";
            transferButton.addEventListener('click', async function ()
            {
                let toAddr = transferToAddressField.value;
                if (!validAddress(toAddr))
                {
                    console.log("Invalid address");
                    return;
                }

                console.log("transfer to", toAddr);
                d.querySelector(".functionbox .loader").style.visibility = "visible";
                d.querySelector(".tokendatabox .loader").style.visibility = "visible";
                let tx = await contract.methods.safeTransferFrom( accountAddress, toAddr, e.tokenid ).send({ from: accountAddress });
                console.log(tx);
                if (tx) 
                {
                    await initContract();
                    await rebuildUI();
                }
            });
            transferp.appendChild(transferToAddressField);
            transferp.appendChild(transferButton);
                
            collist.appendChild(burnbutton);
            collist.appendChild(lockbutton);

            allcontent.appendChild(uuid);
            allcontent.appendChild(image);
            allcontent.appendChild(textcontent);
            allcontent.appendChild(collist);
            allcontent.appendChild(transferp);

            section.appendChild(title);
            section.appendChild(allcontent);

            nftEntriesListDiv.appendChild(section);
        }
    }
    
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
    d.querySelector(".networkbox .walletaddress").innerHTML = "" + accountAddress;
    d.querySelector(".networkbox .walletaddress").title = "" + accountAddress;

    if (networkID != DEPLOYED_NETWORK)
    {
        wrongNetwork(networkID);
        return;
    }

    d.querySelector(".networkbox .error").style.visibility = "hidden";
    d.querySelector(".networkbox .networkchanger").style.display = "none";
    d.querySelector(".networkbox .networkbox-id").innerText = networkIDToString(networkID);
    d.querySelector(".networkbox .networkbox-name").innerText = contractName;
    d.querySelector(".networkbox .networkbox-nexttokenid").innerText = contractNextID;
    
    // d.querySelector(".networkbox .networkbox-totalsupply").innerText = web3.utils.fromWei(totalSupply);
    d.querySelector(".networkbox .networkbox-paused").innerHTML = (contractPaused ? "<span class='warning'>PAUSED</span>" : "<span class='statusok'>ACTIVE</span>");

    if (contract != null)
    {
        // d.querySelector(".stakingbox .loader").style.visibility = "hidden";
        d.querySelector(".functionbox .loader").style.visibility = "hidden";
        d.querySelector(".tokendatabox .loader").style.visibility = "hidden";
    }

    if (!contractPaused)
    {
        // document.querySelector(".walletbox .balanceamount").innerHTML = web3.utils.fromWei(accountBalance)+" "+contractSymbol;
        // document.querySelector(".walletbox .staking_balance").innerHTML = web3.utils.fromWei(stakingBalance)+" "+contractSymbol;
        // document.querySelector(".walletbox .approvedamount").innerHTML = web3.utils.fromWei(allowanceBalance)+" "+contractSymbol;
    }
    else
    {
        document.querySelector(".walletbox .balanceamount").innerHTML = "<span class='warning'>CONTRACT PAUSED</span>";
        document.querySelector(".walletbox .staking_balance").innerHTML = "<span class='warning'>CONTRACT PAUSED</span>";;
        document.querySelector(".walletbox .approvedamount").innerHTML = "<span class='warning'>CONTRACT PAUSED</span>";;
    }

    d.querySelector(".tokendatabox .loader").style.visibility = "hidden";
    
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
        await rebuildUI();
    }
    catch (error)
    {
        console.error(error);
        return;
    }
    
}
