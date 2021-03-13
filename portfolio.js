'use strict';
'esversion: 8';
// jshint node: true
// jshint trailingcomma: false
// jshint undef:true
// jshint unused:true
// jshint varstmt:true

Object.prototype.originalValueOf = Object.prototype.valueOf;

Object.prototype.valueOf = function() {
  if (typeof this !== 'number') {
    throw new Error('Object is not a Number');
  }

  return this.originalValueOf();
}

const rpcURLmainnet = "https://mainnet.infura.io/v3/daa5a2696b2a47a4b969df8e11931282";
//const addr = "0x187f899fcBd0cb2C23Fc68d6339f766814D9dDeb";
//let coingecko_markets; //https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false
let coingecko_ids; //https://api.coingecko.com/api/v3/coins/list?include_platform=false
let uniswapTokenList = [];
let relevantContractAddresses = [];
let symbolBlackList = ["MNE"];
//let 
const erc20ABI = abi();
let web3 = new Web3(rpcURLmainnet);
let content_div;
let baseTokenElement, totalDivElem, totalValElem, nowloadingElem, refresherbuttonElem,
inputbarElem, inputArea, whichaddressElem, checkButton;
const defaultAddr = "0x7eb11d64f15d1f20b833cb44c2b6c9c36ba63dc6";
const ETHERSCAN_APIKEY = "7AQ3713SDIIEK2TMI5ZS9W4IB6YFBFF1QZ";


document.addEventListener("DOMContentLoaded", function(event)
{
    content_div = document.getElementById("content");
    baseTokenElement = document.querySelector('.tokenp');
    totalDivElem = document.querySelector('.totaldiv');
    totalDivElem.style.display = "none";
    baseTokenElement.style.display = "none";
    totalValElem = document.querySelector(".totaldiv-val");
    nowloadingElem = document.querySelector(".nowloading");
    nowloadingElem.style.display = "none";
    refresherbuttonElem = document.querySelector(".refresherbutton");
    inputArea = document.querySelector(".inputarea");
    inputbarElem = document.querySelector(".inpaddress");
    inputbarElem.value = defaultAddr;
    whichaddressElem = document.querySelector(".whichaddress");
    whichaddressElem.innerText = defaultAddr;
    whichaddressElem.style.display = "none";
    checkButton = document.querySelector("#btn_main_check");

    inputbarElem.addEventListener("keyup", function(event)
    {
        if (!checkButton.disabled && (event.key == "Enter" || event.keyCode === 13))
        {
            refreshPortfolio();
            return;
        }
    });

    baseTokenElement.parentNode.removeChild(baseTokenElement);

    //elem.parentNode.removeChild(elem);
    
    //main();
});

async function refreshPortfolio()
{
    let pollThesePrices = [];
    let listofdivs = document.querySelectorAll('.tokenp');
    for (let i = 0; i < listofdivs.length; i++)
    {
        listofdivs[i].parentNode.removeChild(listofdivs[i]);
    }

    let addr = inputbarElem.value;
    checkButton.disabled = true;
    checkButton.innerText = "please wait";
    whichaddressElem.style.display = "block";
    whichaddressElem.innerText = addr;
    nowloadingElem.style.display = "block";

    relevantContractAddresses = [];
    relevantContractAddresses = await getRelevantContractAddresses(addr);

    //coingecko_markets = await fetchJson("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false");
    coingecko_ids = await fetchJson("https://api.coingecko.com/api/v3/coins/list?include_platform=false");

    uniswapTokenList = await fetchUniswapTokenList();
    //uniswapTokenList is filtered by relevant contract addresses
    //content_div.innerHTML = "";

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

    let query_coins_part = "https://api.coingecko.com/api/v3/simple/price?ids=";
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
        if (!token.coingecko_id || !coingeckoPrices[token.coingecko_id] || !coingeckoPrices[token.coingecko_id].usd)
        {
            token.injected_current_price = 0;
            console.log(`Error: Symbol ${token.symbol} is not supported.`);
        }
        else
            token.injected_current_price = coingeckoPrices[token.coingecko_id];
            //token.injected_current_price = coingeckoPrices[token.coingecko_id].usd;
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
                }
                token.tokenprice_usd = parseFloat(token.injected_current_price.usd);
                token.tokenprice_eth = parseFloat(token.injected_current_price.eth);
                token.tokenprice_btc = parseFloat(token.injected_current_price.btc);
                token.total_usd = parseFloat(parseFloat(token.tokenprice_usd) * parseFloat(token.balance)); 
                div_elem.querySelector('.usd_value').innerText  = "$" + token.total_usd.toFixed(2);
                div_elem.querySelector('.tokendetails').innerText  = `${token.symbol} - $${token.tokenprice_usd.toFixed(2)}`;
                div_elem.querySelector('.usd_value').dataset.val = token.total_usd;
            }
        });

        //token.balance = web3.utils.fromWei(balance_raw, 'ether');
    }

    let eth_raw_balance = await web3.eth.getBalance(addr); //string
    let eth_decimal_balance = web3.utils.fromWei(eth_raw_balance, 'ether'); //string
    let ethprice_raw = await getCoinPriceInUSD("ethereum");
    let ethprice = ethprice_raw["ethereum"].usd;
    let ethDiv = ui_addTokenDiv("Ethereum", "ETH", eth_decimal_balance, "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880");
    let eth_total_usd = (ethprice*parseFloat(eth_decimal_balance));
    ethDiv.querySelector('.usd_value').innerText  = "$" + eth_total_usd.toFixed(2);
    ethDiv.querySelector('.tokendetails').innerText  = `ETH - $${ethprice.toFixed(2)}`;
    ethDiv.querySelector('.usd_value').dataset.val = eth_total_usd;

    let listUsdValues = document.querySelectorAll('.usd_value');
    let total_usd = 0;
    for (let i = 0; i < listUsdValues.length; i++)
    {
        let elem = listUsdValues[i];
        let num = parseFloat(elem.dataset.val);
        total_usd = total_usd + num;
    }
    totalValElem.innerText = `$${total_usd.toFixed(2)}`;
    totalDivElem.style.display = "flex";
    nowloadingElem.style.display = "none";

    //checkButton.style.display = "inline-block";
    checkButton.disabled = false;
    checkButton.innerText = "Check";
    
}

function ui_addTokenDiv(_name, _symbol, _token_total, _icon)
{
    let clone = baseTokenElement.cloneNode(true);
    clone.style.display = "flex";
    //clone.id = 'elem2';
    clone.className += " cloned "+_symbol;

    _token_total = parseFloat(_token_total);
    clone.querySelector('.token_total').innerText  = _token_total.toFixed(2) + " " + _symbol;
    clone.querySelector('.tokenname').innerText  = _name;
    
    clone.querySelector('img').src = _icon;
    clone.style.display = "flex";
    whichaddressElem.after(clone);
    //console.log(`adding ${_symbol}`);

    return clone;
}

// async function getCoingeckoIDs()
// {
//     let _response = await fetch("./coingecko_markets.json"); 
//     if (_response.ok) return await _response.json();
//     else return null;
// }

async function getRelevantContractAddresses(in_addr)
{
    let tokens = await getTokenEventsFromEtherscan(in_addr);
    let llist = [];
    for (let i = 0; i < tokens.result.length; i++)
    {
        llist.push(tokens.result[i].contractAddress);
    }
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

// web3.eth.getBalance(addr, function(err, wei)
// {
//     let balance = web3.utils.fromWei(wei, 'ether');
//     console.log(balance + " ETH");
// });

//let token_pols = web3.eth.contract(_abi).at(contractAddr_POLS);

// let tokenContractPols = new web3.eth.Contract(erc20ABI, contractAddr_POLS);


// tokenContractPols.methods.name().call(function(err, name)
// {
//   if(err) { console.log(err); }
//   if(name) { console.log('The token name is: ' + name); }
// });

//filter helper
function onlyUnique(value, index, self) { return self.indexOf(value) === index; }

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

async function getCoinPriceInUSD(_coingecko_token_id)
{
    let _query = `https://api.coingecko.com/api/v3/simple/price?ids=${_coingecko_token_id}&vs_currencies=usd`;
    let _response = await fetch(_query); 
    if (_response.ok) return await _response.json();
    else return null;
}




// tokenContractPols.methods.symbol().call(function(err, symbol)
// {
//   if(err) { console.log(err); }
//   if(symbol) { console.log('The token symbol is: ' + symbol); }
// });

// tokenContractPols.methods.symbol().call(function(err, decimals)
// {
//   if(err) { console.log(err); }
//   if(decimals) { console.log('The token decimals are: ' + decimals); }
// });

// tokenContractPols.methods.balanceOf(addr).call(function(err, balance)
// {
//     if(err) { console.log(err); }
//   //console.log('The balance is: ' + balance.toString(10));
//   let bal = web3.utils.fromWei(balance, 'ether');
//   console.log('The balance is: ' + bal + " POLS");
// });








//web3.eth.getGasPrice([callback])


// async function main()
// {
//     let wei_total = await web3.eth.getBalance(addr);
//     let eth_total = web3.utils.fromWei(wei_total, 'ether');
//     console.log( "Balance of " + addr + ":" );
//     console.log(wei_total + " wei");
//     console.log(eth_total + " ETH");
// }
// main();



