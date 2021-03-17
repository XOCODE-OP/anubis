'use strict';
'esversion: 8';
// jshint node: true
// jshint trailingcomma: false
// jshint undef:true
// jshint unused:true
// jshint varstmt:true

const rpcURLmainnet = "https://mainnet.infura.io/v3/daa5a2696b2a47a4b969df8e11931282";
//const addr = "0x187f899fcBd0cb2C23Fc68d6339f766814D9dDeb";
//let coingecko_markets; //https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false
let coingecko_ids; //https://api.coingecko.com/api/v3/coins/list?include_platform=false
let uniswapTokenList = [];
let relevantContractAddresses = [];
let symbolBlackList = ["MNE"];
const erc20ABI = abi();
const STORAGE_KEY = "coineyedata";
let web3 = new Web3(rpcURLmainnet);
let metamaskweb3 = null;
let content_div;
let baseTokenElement, totalDivElem, totalValElem, nowloadingElem, refresherbuttonElem, btn_metamask, 
inputbarElem, inputArea, whichaddressElem, checkButton, mainPlaceholderLabel, divTotalBTCvalue, divTotalETHvalue;
const DEFAULT_SAMPLE_ADDR = "0x7eb11d64f15d1f20b833cb44c2b6c9c36ba63dc6";
const ETHERSCAN_APIKEY = "7AQ3713SDIIEK2TMI5ZS9W4IB6YFBFF1QZ";

document.addEventListener("DOMContentLoaded", function(event)
{
    content_div         = document.getElementById("content");
    baseTokenElement    = document.querySelector('.tokenp');
    totalDivElem        = document.querySelector('.totaldiv');
    totalValElem        = document.querySelector(".totaldiv-val");
    nowloadingElem      = document.querySelector(".nowloading");
    refresherbuttonElem = document.querySelector(".refresherbutton");
    inputArea           = document.querySelector(".inputarea");
    inputbarElem        = document.querySelector(".inpaddress");
    whichaddressElem    = document.querySelector(".whichaddress");
    checkButton         = document.querySelector("#btn_main_check");
    mainPlaceholderLabel= document.querySelector(".maincolumn h1");
    divTotalBTCvalue    = document.querySelector(".tot_btcv");
    divTotalETHvalue    = document.querySelector(".tot_ethv"); 
    btn_metamask        = document.querySelector("#btn_metamask"); 

    if (!window.ethereum) btn_metamask.parentNode.removeChild(btn_metamask);

    nowloadingElem.style.display = "none";
    whichaddressElem.style.display = "none";
    totalDivElem.style.display = "none";
    baseTokenElement.style.display = "none";

    let savedData = JSON.parse(localStorage.getItem(STORAGE_KEY));
    //console.log(savedData);
    if (!savedData && savedData == null || !savedData.lastAddr)
    {
        console.log("defaulting save state");
        let defaultData = {};
        defaultData.lastAddr = DEFAULT_SAMPLE_ADDR;
        console.log("writing to storage:");
        console.log(defaultData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
        savedData = JSON.parse(localStorage.getItem(STORAGE_KEY));    
        console.log("loaded:");
        console.log(savedData);
    }
    inputbarElem.value = savedData.lastAddr;
    whichaddressElem.innerText = savedData.lastAddr;

    inputbarElem.addEventListener("keyup", function(event)
    {
        if (!checkButton.disabled && (event.key == "Enter" || event.keyCode === 13))
        {
            refreshPortfolio(inputbarElem.value);
            return;
        }
    });

    checkButton.addEventListener("click", function (event)
    {
        refreshPortfolio(inputbarElem.value);
    });

    let sampleLinks = document.querySelectorAll(".sample_addrs a");
    for (let i = 0; i < sampleLinks.length; i++)
    {
        let _addr = sampleLinks[i].dataset.addr;
        sampleLinks[i].addEventListener("click", function (event)
        {
            refreshPortfolio(_addr);
        });
    }

    baseTokenElement.parentNode.removeChild(baseTokenElement);

    btn_metamask.addEventListener("click", function (event)
    {
        getMetamaskAccounts();
    });

    fillInGasPrices();

});

async function fillInGasPrices()
{
    let gasdata = await fetchJson("https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=7AQ3713SDIIEK2TMI5ZS9W4IB6YFBFF1QZ");
    document.querySelector(".cheapgas .gas").innerHTML = ""+gasdata.result.SafeGasPrice;
    document.querySelector(".modgas .gas").innerHTML = ""+gasdata.result.ProposeGasPrice;
    document.querySelector(".fastgas .gas").innerHTML = ""+gasdata.result.FastGasPrice;
}

function handleAccountsChanged(accounts)
{
    if (accounts.length === 0)
    {
        // MetaMask is locked or the user has not connected any accounts
        console.log('Please connect to MetaMask.');
    }
    else
    {
        refreshPortfolio(accounts[0]);
    }
}

async function getMetamaskAccounts()
{
    if (window.ethereum)
    {
        //metamaskweb3 = new Web3(window.ethereum);
        // const rpc_response = await window.ethereum.send('eth_requestAccounts');
        // const accounts = rpc_response.result;
        // refreshPortfolio(accounts[0]);
        window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then(handleAccountsChanged)
        .catch(function(err)
        {
            if (err.code === 4001)
            {
                // EIP-1193 userRejectedRequest error
                // If this happens, the user rejected the connection request.
                console.log('Please connect to MetaMask.');
            } else {
                console.error(err);
            }
        });

        window.ethereum.on('accountsChanged', function(accounts)
        {
            console.log("ACCOUNTS CHANGED");
            handleAccountsChanged(accounts);
        });
        window.ethereum.on('chainChanged', function(_chainId)
        {
            window.location.reload();
        });
    }
    else
    {
        console.log("no metamask");
    }
}

async function refreshPortfolio(addr)
{
    let storeData = {};
    storeData.lastAddr = addr;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storeData));

    totalDivElem.style.display = "none";
    nowloadingElem.style.display = "block";
    mainPlaceholderLabel.style.display = "none";
    
    let listofdivs = document.querySelectorAll('.tokenp');
    for (let i = 0; i < listofdivs.length; i++)
    {
        listofdivs[i].parentNode.removeChild(listofdivs[i]);
    }

    inputbarElem.value = addr;
    checkButton.disabled = true;
    checkButton.innerText = "please wait";
    whichaddressElem.style.display = "block";
    whichaddressElem.innerText = addr;
    nowloadingElem.style.display = "block";

    relevantContractAddresses = [];
    relevantContractAddresses = await getRelevantContractAddresses(addr);

    coingecko_ids = await fetchJson("https://api.coingecko.com/api/v3/coins/list?include_platform=false");

    uniswapTokenList = await fetchUniswapTokenList();
    //uniswapTokenList is filtered by relevant contract addresses

    for (let i = 0; i < uniswapTokenList.length; i++)
    {
        const token = uniswapTokenList[i];
        
        for (let cin = 0; cin < coingecko_ids.length; cin++) //takes 1-2ms
        {
            const cide = coingecko_ids[cin];
            if (cide.symbol.toUpperCase() == token.symbol)
            {
                token.coingecko_id = cide.id;
            }
        }
    }

    let query_coins_part = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum%2C";
    for (let i = 0; i < uniswapTokenList.length; i++)
    {
        const token = uniswapTokenList[i];
        query_coins_part = query_coins_part + token.coingecko_id;
        if (i < uniswapTokenList.length - 1) query_coins_part = query_coins_part + "%2C";
    }
    query_coins_part = query_coins_part + "&vs_currencies=usd,eth,btc"; //added eth and btc prices
    let coingeckoPrices = await fetchJson(query_coins_part);

    for (let i = 0; i < uniswapTokenList.length; i++)
    {
        const token = uniswapTokenList[i];
        let notsupported = false;
        if (!token.coingecko_id || !coingeckoPrices[token.coingecko_id] || !coingeckoPrices[token.coingecko_id].usd)
        {
            token.injected_current_price = {};
            token.injected_current_price.usd = 0;
            token.injected_current_price.eth = 0;
            token.injected_current_price.btc = 0;
            console.log(`Error: Symbol ${token.symbol} is not supported.`);
            notsupported = true;
        }
        else
            token.injected_current_price = coingeckoPrices[token.coingecko_id];
            
        token.contract = new web3.eth.Contract(erc20ABI, token.address);
        
        await token.contract.methods.balanceOf(addr).call().then(function (bal)
        {
            let balance_raw = bal;
            token.balance = balance_raw / Math.pow(10, token.decimals);
            let div_elem;

            if (token.balance > 0)
            {
                div_elem = ui_addTokenDiv(token.name, token.symbol, token.balance, token.logoURI);
                if (!token.tokenprice) token.tokenprice = {};
                if (!token.injected_current_price)
                {
                    token.tokenprice.usd = 0;
                    token.tokenprice.eth = 0;
                    token.tokenprice.btc = 0;
                    console.log("There was no injected price for " + token.symbol);
                }
                token.tokenprice_usd = parseFloat(token.injected_current_price.usd);
                token.tokenprice_eth = parseFloat(token.injected_current_price.eth);
                token.tokenprice_btc = parseFloat(token.injected_current_price.btc);
                token.total_usd = parseFloat(parseFloat(token.tokenprice_usd) * parseFloat(token.balance)); 
                token.total_eth = parseFloat(parseFloat(token.tokenprice_eth) * parseFloat(token.balance)); 
                token.total_btc = parseFloat(parseFloat(token.tokenprice_btc) * parseFloat(token.balance)); 
                div_elem.querySelector('.eth_value').innerText  = `ETH ${numberWithCommas(token.total_eth.toFixed(2))}`;
                div_elem.querySelector('.eth_value').dataset.val = token.total_eth;
                div_elem.querySelector('.btc_value').innerText  = `BTC ${numberWithCommas(token.total_btc.toFixed(2))}`;
                div_elem.querySelector('.btc_value').dataset.val = token.total_btc;
                div_elem.querySelector('.usd_value').innerText  = "$" + numberWithCommas(token.total_usd.toFixed(2));
                div_elem.querySelector('.tokendetails').innerText  = `${token.symbol} - $${numberWithCommas(token.tokenprice_usd.toFixed(2))}`;
                div_elem.querySelector('.usd_value').dataset.val = token.total_usd;
                if (notsupported)
                {
                    div_elem.classList.add("notsupported");
                    div_elem.querySelector('.eth_value').classList.add("notsupported");
                    div_elem.querySelector('.btc_value').classList.add("notsupported");
                    div_elem.querySelector('.usd_value').classList.add("notsupported");
                    div_elem.querySelector('.tokendetails').classList.add("notsupported");
                    div_elem.querySelector('.token_total').classList.add("notsupported");
                    div_elem.querySelector('.tokenname').classList.add("notsupported");
                    div_elem.querySelector('.tokenname').innerHTML += "<br />[NOT SUPPORTED]";
                }
            }
        });
    }

    let eth_raw_balance = await web3.eth.getBalance(addr); //string
    let eth_decimal_balance = parseFloat(web3.utils.fromWei(eth_raw_balance, 'ether'));
    let ethprice = coingeckoPrices["ethereum"];
    let ethDiv = ui_addTokenDiv("Ethereum", "ETH", eth_decimal_balance, "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880");
    let eth_total_usd = (ethprice.usd*eth_decimal_balance);
    let eth_total_btc = (ethprice.btc*eth_decimal_balance);
    
    ethDiv.querySelector('.eth_value').innerText  = `ETH ${numberWithCommas(eth_decimal_balance.toFixed(2))}`;
    ethDiv.querySelector('.eth_value').dataset.val = eth_decimal_balance;
    ethDiv.querySelector('.btc_value').innerText  = `BTC ${numberWithCommas(eth_total_btc.toFixed(2))}`;
    ethDiv.querySelector('.btc_value').dataset.val = eth_total_btc;
    ethDiv.querySelector('.usd_value').innerText  = "$" + numberWithCommas(eth_total_usd.toFixed(2));
    ethDiv.querySelector('.usd_value').dataset.val = eth_total_usd;
    ethDiv.querySelector('.tokendetails').innerText  = `ETH - $${numberWithCommas(parseFloat(ethprice.usd).toFixed(2))}`;

    let listUsdValues = document.querySelectorAll('.usd_value');
    let ethValues = document.querySelectorAll('.eth_value');
    let btcValues = document.querySelectorAll('.btc_value');
    let total_usd = 0;
    let total_eth = 0;
    let total_btc = 0;
    for (let i = 0; i < listUsdValues.length; i++)
    {
        let elem = listUsdValues[i];
        let part_usd = parseFloat(elem.dataset.val);
        total_usd = total_usd + part_usd;
    }
    for (let i = 0; i < ethValues.length; i++)
    {
        let elem = ethValues[i];
        let part_eth = parseFloat(elem.dataset.val);
        total_eth = total_eth + part_eth;
    }
    for (let i = 0; i < btcValues.length; i++)
    {
        let elem = btcValues[i];
        let part_btc = parseFloat(elem.dataset.val);
        total_btc = total_btc + part_btc;
    }
    totalValElem.innerText = `$${numberWithCommas(total_usd.toFixed(2))}`;
    totalValElem.dataset.val = total_usd;
    totalDivElem.style.display = "flex";
    nowloadingElem.style.display = "none";
    
    divTotalETHvalue.dataset.val = total_eth;
    divTotalETHvalue.innerText = `ETH ${numberWithCommas(total_eth.toFixed(2))}`;
    divTotalBTCvalue.dataset.val = total_btc;
    divTotalBTCvalue.innerText = `BTC ${numberWithCommas(total_btc.toFixed(2))}`;

    checkButton.disabled = false;
    btn_metamask.disabled = false;
    checkButton.innerText = "Check";
    
    ui_sortTokenDivs();
}

function ui_sortTokenDivs()
{
    let tokenDivEntries = document.querySelectorAll('.tokenp');
    let orderedList = [];
    for (let i = 0; i < tokenDivEntries.length; i++)
    {
        let e = tokenDivEntries[i];
        orderedList.push(e);
        e.parentNode.removeChild(e);
    }

    orderedList.sort(function(a, b)
    {
        return parseFloat(a.querySelector('.usd_value').dataset.val) - 
        parseFloat(b.querySelector('.usd_value').dataset.val);
    });

    //resinsert divs sorted
    //also calc percentages
    let totalval = parseFloat(totalValElem.dataset.val);
    for (let i = 0; i < orderedList.length; i++)
    {
        let e = orderedList[i];
        let myval = parseFloat(e.querySelector('.usd_value').dataset.val);
        //(small / total) * 100 = percent
        let perc = ((myval / totalval) * 100.0);
        let percdiv = e.querySelector('.perc');
        percdiv.dataset.val = perc;
        e.dataset.percval = perc;
        percdiv.innerText = perc.toFixed(1) + "%";

        e.classList.remove("animate__animated");
        whichaddressElem.after(e);
    }
}



function ui_addTokenDiv(_name, _symbol, _token_total, _icon)
{
    let clone = baseTokenElement.cloneNode(true);
    //clone.id = 'elem2';
    clone.className += " cloned "+_symbol;
    _token_total = parseFloat(_token_total);
    clone.querySelector('.token_total').innerText  = numberWithCommas(_token_total.toFixed(2)) + " " + _symbol;
    clone.querySelector('.tokenname').innerText  = _name;
    clone.querySelector('img').src = _icon;
    clone.style.display = "flex";
    whichaddressElem.after(clone);

    return clone;
}

async function getRelevantContractAddresses(in_addr)
{
    let tokens = await getTokenEventsFromEtherscan(in_addr);
    let llist = [];
    for (let i = 0; i < tokens.result.length; i++)
    {
        llist.push(tokens.result[i].contractAddress);
    }
    
    //filter helper
    function onlyUnique(value, index, self) { return self.indexOf(value) === index; }
    
    return llist.filter(onlyUnique);
}

async function fetchJson(query)
{
    let _response = await fetch(query); 
    if (_response.ok) return await _response.json();
    else return null;
}

async function getTokenEventsFromEtherscan(in_addr)
{
    let query = `https://api.etherscan.io/api?module=account&action=tokentx&address=${in_addr}&startblock=0&endblock=999999999&sort=asc&apikey=${ETHERSCAN_APIKEY}`;
    let _response = await fetch(query); 
    if (_response.ok) return await _response.json();
    else return null;
};

async function fetchUniswapTokenList()
{
    let list = [];
    let response = await fetch("./uniswap_list.json");
    // https://tokens.coingecko.com/uniswap/all.json

    if (response.ok)
    { 
        let json = await response.json();

        for (let i = 0; i < json.tokens.length; i++)
        {
            const token = json.tokens[i];
            let skip = false;
            for (let bb = 0; bb < symbolBlackList.length; bb++)
            {
                if (symbolBlackList[bb] == token.symbol)
                {
                    skip = true;
                    break;
                }
            }
            if (!skip)
            {
                for (let w = 0; w < relevantContractAddresses.length; w++)
                {
                    if (relevantContractAddresses[w] == token.address)
                    {
                        list.push(token);
                    }
                }
            }
        }
        return list;
    }
    else
    {
        console.log("HTTP-Error: " + response.status);
        return null;
    }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}