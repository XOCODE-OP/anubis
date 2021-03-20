'use strict';
'esversion: 8';
// jshint node: true
// jshint trailingcomma: false
// jshint undef:true
// jshint unused:true
// jshint varstmt:true
// jshint browser: true 

//coingecko uniswap list https://tokens.coingecko.com/uniswap/all.json

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
let baseTokenElement, nowloadingElem, refresherbuttonElem, 
btn_metamask, inputbarElem, inputArea, checkButton, mainPlaceholderLabel, 
divTotalBTCvalue, divTotalETHvalue, divAddress_list, baseAddressElement, newaddresslink,
contents, chainswitcher_switchrow, unitLabel, pageLoader;
let totalDivElem_eth, totalValElem_eth, totalDivElem_bsc, totalValElem_bsc, totalDivElem_matic, totalValElem_matic;
let content_eth, content_bsc, content_matic;
let whichaddressElem_eth, whichaddressElem_bsc, whichaddressElem_matic;
let divSamplesEth, divSamplesBsc, divSamplesMatic;
let current_chain = "eth";
const DEFAULT_SAMPLE_ADDR = "0x7eb11d64f15d1f20b833cb44c2b6c9c36ba63dc6";
const ETHERSCAN_APIKEY = "7AQ3713SDIIEK2TMI5ZS9W4IB6YFBFF1QZ";

const ANUBIS_VERSION_NUM = "0.0.122";

document.addEventListener("DOMContentLoaded", function(event)
{
    console.log("ANUBIS VERSION " + ANUBIS_VERSION_NUM);

    content_eth         = document.querySelector('.content_eth');
    content_bsc         = document.querySelector('.content_bsc');
    content_matic       = document.querySelector('.content_matic');
    totalDivElem_eth    = content_eth.querySelector('.totaldiv');
    totalValElem_eth    = content_eth.querySelector(".totaldiv-val");
    totalDivElem_bsc    = content_bsc.querySelector('.totaldiv');
    totalValElem_bsc    = content_bsc.querySelector(".totaldiv-val");
    totalDivElem_matic  = content_matic.querySelector('.totaldiv');
    totalValElem_matic  = content_matic.querySelector(".totaldiv-val");
    totalDivElem_eth.style.display = "none";
    totalDivElem_bsc.style.display = "none";
    totalDivElem_matic.style.display = "none";
    content_bsc.style.display = "none";
    content_matic.style.display = "none";
    pageLoader          = document.querySelector('.pageloader');
    pageLoader.style.opacity = "1.0";
    setTimeout(function()
    {
        let interval = setInterval(function ()
        {
            pageLoader.style.opacity-=0.05;
            if (pageLoader.style.opacity <= 0.0)
            {
                clearInterval(interval);
                pageLoader.parentNode.removeChild(pageLoader);
            }
        }, 20);

    }, 360); 


    baseTokenElement    = document.querySelector('.tokenp');
    nowloadingElem      = document.querySelector(".nowloading");
    refresherbuttonElem = document.querySelector(".refresherbutton");
    inputArea           = document.querySelector(".inputarea");
    inputbarElem        = document.querySelector(".inpaddress");
    checkButton         = document.querySelector("#btn_main_check");
    mainPlaceholderLabel= document.querySelector(".maincolumn h1");
    divTotalBTCvalue    = document.querySelector(".tot_btcv");
    divTotalETHvalue    = document.querySelector(".tot_ethv"); 
    btn_metamask        = document.querySelector("#btn_metamask"); 
    divAddress_list     = document.querySelector(".address_list"); 
    baseAddressElement  = document.querySelectorAll(".address_div")[0]; 
    newaddresslink      = document.querySelector(".newaddresslink");
    contents            = document.querySelectorAll(".content"); 
    unitLabel           = document.querySelectorAll(".input_label_unit");
    chainswitcher_switchrow = document.querySelector(".chainswitcher_switchrow");

    divSamplesEth       = document.querySelector(".samples_eth");
    divSamplesBsc       = document.querySelector(".samples_bsc");
    divSamplesMatic     = document.querySelector(".samples_matic");

    whichaddressElem_eth      = document.querySelector(".whichaddress_eth");
    whichaddressElem_bsc      = document.querySelector(".whichaddress_bsc");
    whichaddressElem_matic    = document.querySelector(".whichaddress_matic");
    whichaddressElem_eth.style.display = "none";
    whichaddressElem_bsc.style.display = "none";
    whichaddressElem_matic.style.display = "none";

    nowloadingElem.style.display = "none";
    baseTokenElement.style.display = "none";

    if (!window.ethereum) btn_metamask.parentNode.removeChild(btn_metamask);

    let savedData = JSON.parse(localStorage.getItem(STORAGE_KEY));
    //console.log(savedData);
    if (!savedData && savedData == null || !savedData.lastAddrs)
    {
        console.log("defaulting save state");
        let defaultData = {};
        defaultData.lastAddrs = [];
        defaultData.lastAddrs.push(DEFAULT_SAMPLE_ADDR);
        console.log("writing to storage:");
        console.log(defaultData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
        savedData = JSON.parse(localStorage.getItem(STORAGE_KEY));    
        console.log("loaded:");
        console.log(savedData);
    }
    inputbarElem.value = savedData.lastAddrs[0];
    whichaddressElem_eth.innerText = savedData.lastAddrs[0];

    inputbarElem.addEventListener("keyup", function(event)
    {
        if (!checkButton.disabled && (event.key == "Enter" || event.keyCode === 13))
        {
            refreshPortfolio([inputbarElem.value], ""+current_chain);
            return;
        }
    });

    checkButton.addEventListener("click", function (event)
    {
        refreshPortfolio([inputbarElem.value], ""+current_chain);
    });

    let sampleLinks = document.querySelectorAll(".sample_addrs a");
    for (let i = 0; i < sampleLinks.length; i++)
    {
        let _addr = sampleLinks[i].dataset.addr;
        sampleLinks[i].addEventListener("click", function (event)
        {
            refreshPortfolio([_addr], ""+current_chain);
        });
    }

    baseTokenElement.parentNode.removeChild(baseTokenElement);

    btn_metamask.addEventListener("click", function (event)
    {
        getMetamaskAccounts();
    });

    fillInGasPrices();

    newaddresslink.addEventListener("click", function (event)
    {
        //add address box
        let _clone = baseAddressElement.cloneNode(true);
        _clone.querySelector(".minus_address_icon").style.visibility = "visible";
        _clone.className += " cloned";

        newaddresslink.before(_clone);
    });

    let chainSelectors = document.querySelectorAll(".chainbutton");
    for (let i = 0; i < chainSelectors.length; i++)
    {
        const e = chainSelectors[i];
        e.addEventListener("click", function (event) //CHANGING CHAIN
        {
            for (let g = 0; g < chainSelectors.length; g++)
            {
                chainSelectors[g].classList.remove("chosen_chain");
            }
            e.classList.add("chosen_chain");
            current_chain = e.dataset.chain;

            for (let d = 0; d < contents.length; d++)
            {
                const cont = contents[d];
                cont.style.display = "none";
                if (cont.dataset.chain == e.dataset.chain)
                {
                    cont.style.display = "block";
                }
            }

            // TODO:
            // change
            if (current_chain == "eth")   
            {
                unitLabel.forEach(element => {
                    element.innerText = "Ethereum";
                });
                document.querySelector(".eth_gas_box").style.display = "block";
                if (window.ethereum) btn_metamask.style.display = "inline-block";
                //change sample addresses
                divSamplesEth.style.display = "block";
                divSamplesBsc.style.display = "none";
                divSamplesMatic.style.display = "none";
            }
            if (current_chain == "bsc")   
            {
                unitLabel.forEach(element => {
                    element.innerText = "Binance Smart Chain";
                });
                document.querySelector(".eth_gas_box").style.display = "none";
                btn_metamask.style.display = "none";
                //change sample addresses
                divSamplesEth.style.display = "none";
                divSamplesBsc.style.display = "block";
                divSamplesMatic.style.display = "none";
            }
            if (current_chain == "matic")
            {
                unitLabel.forEach(element => {
                    element.innerText = "Polygon Matic";
                });
                document.querySelector(".eth_gas_box").style.display = "none";
                btn_metamask.style.display = "none";
                //change sample addresses
                divSamplesEth.style.display = "none";
                divSamplesBsc.style.display = "none";
                divSamplesMatic.style.display = "block";
            }
            

        });
    }

    console.log("LETS DOWNLOAD THE UNISWAP JSON WHILE WAITING FOR USER INPUT. AND OVERRIDE THE LOCAL ONE");
    console.log("download uniswap coingecko");
    console.log("download coingecko ID list");
    //download these if 24h have passed or something

});

async function fillInGasPrices()
{
    let gasdata = await fetchJson(`https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${ETHERSCAN_APIKEY}`);
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
        refreshPortfolio([accounts[0]], ""+current_chain);
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

async function refreshPortfolio(addrs, chain) //addr is now an array
{
    let storeData = {};
    storeData.lastAddrs = addrs;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storeData));

    let addr = addrs[0];

    chainswitcher_switchrow.style.display = "none";

    //current_chain

    if (current_chain == "eth") totalDivElem_eth.style.display = "none";
    if (current_chain == "bsc") totalDivElem_bsc.style.display = "none";
    if (current_chain == "matic") totalDivElem_matic.style.display = "none";
    
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
    if (current_chain == "eth") 
    {
        whichaddressElem_eth.style.display = "block";
        whichaddressElem_eth.innerText = addr;
    }
    if (current_chain == "bsc") 
    {
        whichaddressElem_bsc.style.display = "block";
        whichaddressElem_bsc.innerText = addr;
    }
    if (current_chain == "matic") 
    {
        whichaddressElem_matic.style.display = "block";
        whichaddressElem_matic.innerText = addr;
    }
    
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

    if (current_chain == "eth")
    {
        totalValElem_eth.innerText = `$${numberWithCommas(total_usd.toFixed(2))}`;
        totalValElem_eth.dataset.val = total_usd;
        totalDivElem_eth.style.display = "flex";
    }
    if (current_chain == "bsc")
    {
        totalValElem_bsc.innerText = `$${numberWithCommas(total_usd.toFixed(2))}`;
        totalValElem_bsc.dataset.val = total_usd;
        totalDivElem_bsc.style.display = "flex";
    }
    if (current_chain == "matic")
    {
        totalValElem_matic.innerText = `$${numberWithCommas(total_usd.toFixed(2))}`;
        totalValElem_matic.dataset.val = total_usd;
        totalDivElem_matic.style.display = "flex";
    }

    nowloadingElem.style.display = "none";
    
    divTotalETHvalue.dataset.val = total_eth;
    divTotalETHvalue.innerText = `ETH ${numberWithCommas(total_eth.toFixed(2))}`;
    divTotalBTCvalue.dataset.val = total_btc;
    divTotalBTCvalue.innerText = `BTC ${numberWithCommas(total_btc.toFixed(2))}`;

    checkButton.disabled = false;
    btn_metamask.disabled = false;
    checkButton.innerText = "Check";

    chainswitcher_switchrow.style.display = "block";
    
    ui_sortTokenDivs(chain);
}

function ui_sortTokenDivs(chain)
{
    let contentBase;
    if (chain == "eth")   contentBase = content_eth;
    if (chain == "bsc")   contentBase = content_bsc;
    if (chain == "matic") contentBase = content_matic;

    let tokenDivEntries = contentBase.querySelectorAll('.tokenp');
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

    let myvalElem;
    if (chain == "eth")   myvalElem = totalValElem_eth;
    if (chain == "bsc")   myvalElem = totalValElem_bsc;
    if (chain == "matic") myvalElem = totalValElem_matic;

    //resinsert divs sorted
    //also calc percentages
    let totalval = parseFloat(myvalElem.dataset.val);
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
        
        if (chain == "eth")   whichaddressElem_eth.after(e);
        if (chain == "bsc")   whichaddressElem_bsc.after(e);
        if (chain == "matic") whichaddressElem_matic.after(e);
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

    let chainsTotalDiv;
    if (current_chain == "eth")   chainsTotalDiv = totalDivElem_eth;
    if (current_chain == "bsc")   chainsTotalDiv = totalDivElem_bsc;
    if (current_chain == "matic") chainsTotalDiv = totalDivElem_matic;

    chainsTotalDiv.after(clone);

    return clone;
}

async function testbsc(bscaddr)
{
    bscaddr = "0x6093A0b32C9FB18F61198a5Fe869d3EF9549f61a";
    let resp = await fetchJson(`http://api.covalenthq.com/v1/56/address/${bscaddr}/balances_v2/`);
    //console.log(resp.data.items);
    content_bsc.innerText = JSON.stringify(resp.data.items, null, 4);
}

async function testmatic(maticaddr)
{
    maticaddr = "0xafF33b887aE8a2Ab0079D88EFC7a36eb61632716";
    let resp = await fetchJson(`http://api.covalenthq.com/v1/137/address/${maticaddr}/balances_v2/`);
    //console.log(resp.data.items);
    content_matic.innerText = JSON.stringify(resp.data.items, null, 4);
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