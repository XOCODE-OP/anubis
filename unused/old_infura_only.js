'use strict';
'esversion: 8';
// jshint node: true
// jshint trailingcomma: false
// jshint undef:true
// jshint unused:true
// jshint varstmt:true

const rpcURLmainnet = "https://mainnet.infura.io/v3/daa5a2696b2a47a4b969df8e11931282";
//const addr = "0x187f899fcBd0cb2C23Fc68d6339f766814D9dDeb";
let coingecko_ids;
let myTokenList = [];
let tokenSymbolWhitelist = ["POLS" , "GRT","INDEX","FTT" ,"UBT","AAVE","PAID","MRPH" , 
"LRC","RSR","TRAC","LINK", "PRQ","ORN","BAO","BFLY" , "BAND","OM", "DEXT", "SWAP", "PHA",
"CAKE", "NU", "RING", "ALEPH", "DDIM", "COVER", "YF-DAI", "XOR", "INFI", "KSM", "CEL", "DOT",
"OCEAN", "REN", "PNK", "AKRO", "WNXM", "CHSB", "MKR", "1INCH", "API3", "XFT", "RUNE", "MPH",
"UNI", "REEF", "SNX", "RLC", "ANKR", "BMI", "TXL", "UTK", "KAVA", "STAKE", "DIA", "FSN", "CFI",
"IRIS", "TKN", "GARD", "ZEFU", "YLD"];
const erc20ABI = abi();
let web3 = new Web3(rpcURLmainnet);
let content_div;
let baseTokenElement, totalDivElem, totalValElem, nowloadingElem, refresherbuttonElem,
inputbarElem, inputArea, whichaddressElem;
const defaultAddr = "0x7eb11d64f15d1f20b833cb44c2b6c9c36ba63dc6";


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

    baseTokenElement.parentNode.removeChild(baseTokenElement);

    //elem.parentNode.removeChild(elem);
    
    //main();
});

function ui_addTokenDiv(_name, _symbol, _usd_per_each, _total_usd, _token_total, _icon)
{
    let clone = baseTokenElement.cloneNode(true);
    clone.style.display = "flex";
    //clone.id = 'elem2';
    clone.className += " cloned";

    _usd_per_each = parseFloat(_usd_per_each);
    _total_usd = parseFloat(_total_usd);
    _token_total = parseFloat(_token_total);

    clone.querySelector('.usd_value').innerText  = "$" + _total_usd.toFixed(2);
    clone.querySelector('.token_total').innerText  = _token_total.toFixed(2) + " " + _symbol;
    clone.querySelector('.tokenname').innerText  = _name;
    clone.querySelector('.tokendetails').innerText  = `${_symbol} - $${_usd_per_each.toFixed(2)}`;
    clone.querySelector('.usd_value').dataset.val = _total_usd;
    clone.querySelector('img').src = _icon;
    clone.style.display = "flex";
    whichaddressElem.after(clone);
    console.log(`adding ${_symbol}`);
}

async function getCoingeckoIDs()
{
    let _response = await fetch("./coingecko_ids.json"); 
    if (_response.ok) return await _response.json();
    else return null;
}

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



async function getMyTokenList()
{
    let list = [];
    let response = await fetch("./all_tokens_feb2021.json");
    // https://tokens.coingecko.com/uniswap/all.json

    if (response.ok)
    { 
        let json = await response.json();

        for (let i = 0; i < json.tokens.length; i++)
        {
            const t = json.tokens[i];
            for (let w = 0; w < tokenSymbolWhitelist.length; w++)
            {
                if (tokenSymbolWhitelist[w] == t.symbol)
                {
                    list.push(t);
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
    let _response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids="+_coingecko_token_id+"&vs_currencies=usd"); 
    if (_response.ok) return await _response.json();
    else return null;
}

async function refreshPortfolio()
{
    let addr = inputbarElem.value;
    inputArea.style.display = "none";
    whichaddressElem.style.display = "block";
    whichaddressElem.innerText = addr;
    nowloadingElem.style.display = "block";

    coingecko_ids = await getCoingeckoIDs();

    myTokenList = await getMyTokenList();
    //content_div.innerHTML = "";

    for (let i = 0; i < myTokenList.length; i++)
    {
        for (let g = 0; g < coingecko_ids.length; g++)
        {
            const c = coingecko_ids[g];
            if (c.symbol.toUpperCase() == myTokenList[i].symbol)
            {
                myTokenList[i].coingecko_id = c.id;
            }
        }

        myTokenList[i].contract = new web3.eth.Contract(erc20ABI, myTokenList[i].address);

        let t0 = performance.now();
        let balance_raw = await myTokenList[i].contract.methods.balanceOf(addr).call();
        console.log(`balance of ${myTokenList[i].symbol} took ${(performance.now() - t0).toFixed(0)} ms`);

        //myTokenList[i].balance = web3.utils.fromWei(balance_raw, 'ether');
        myTokenList[i].balance = balance_raw / Math.pow(10, myTokenList[i].decimals);
        //myTokenList[i].balance = balance_raw ;

        t0 = performance.now();
        let tokprjs = await getCoinPriceInUSD(myTokenList[i].coingecko_id);
        console.log(`coingecko price of ${myTokenList[i].symbol} took ${(performance.now() - t0).toFixed(0)} ms`);
        t0 = performance.now();

        //myTokenList[i].tokenprice = tokprjs[myTokenList[i].coingecko_id].usd;
        myTokenList[i].tokenprice = 0.0;
        myTokenList[i].total_usd  = myTokenList[i].tokenprice * myTokenList[i].balance;

        const tok = myTokenList[i];
        if (tok.balance > 0)
        {
            ui_addTokenDiv(tok.name, tok.symbol, tok.tokenprice, tok.total_usd, tok.balance, tok.logoURI);
        }
    }

    let eth_raw_balance = await web3.eth.getBalance(addr); //string
    let eth_decimal_balance = web3.utils.fromWei(eth_raw_balance, 'ether'); //string
    let ethprice_raw = await getCoinPriceInUSD("ethereum");
    let ethprice = ethprice_raw["ethereum"].usd;
    ui_addTokenDiv("Ethereum", "ETH", ethprice, (ethprice*parseFloat(eth_decimal_balance)), eth_decimal_balance, 
        "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880");

    let listUsdValues = document.querySelectorAll('.usd_value');
    let total_usd = 0;
    for (let i = 0; i < listUsdValues.length; i++)
    {
        let elem = listUsdValues[i];
        let num = parseFloat(elem.dataset.val);
        total_usd = total_usd + num;
    }
    console.log(`total_usd: ${total_usd}`);
    totalValElem.innerText = `$${total_usd.toFixed(2)}`;
    totalDivElem.style.display = "flex";
    nowloadingElem.style.display = "none";

    inputArea.style.display = "block";
    


    //content_div.innerHTML = "TOTAL VAL<br><br>" + content_div.innerHTML;

    // for (let i = 0; i < myTokenList.length; i++)
    // {
    //     const e = myTokenList[i];
    //     let balance_raw = await tokenContractPols.methods.balanceOf(addr).call();
    //     let balance =  web3.utils.fromWei(balance_raw, 'ether');

    //     _newcontent = `${_newcontent} 
    //         <p>${e.name} (${e.symbol}): ${e.address}</p>`;
    // }
    // document.getElementById("content").innerHTML = _newcontent;
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



