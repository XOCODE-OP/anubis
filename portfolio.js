'use strict';
'esversion: 8';
// jshint esversion: 8
// jshint node: true
// jshint trailingcomma: false
// jshint undef:true
// jshint unused:false
// jshint varstmt:true
// jshint browser: true 

//coingecko uniswap list https://tokens.coingecko.com/uniswap/all.json

const rpcURLmainnet = "https://mainnet.infura.io/v3/daa5a2696b2a47a4b969df8e11931282";
//const addr = "0x187f899fcBd0cb2C23Fc68d6339f766814D9dDeb";
//let coingecko_markets; //https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false
let coingecko_ids; //https://api.coingecko.com/api/v3/coins/list?include_platform=false
//let uniswapTokenList = [];
//let relevantContractAddresses = [];
let addressBlacklist = ["0xc92e74b131d7b1d46e60e07f3fae5d8877dd03f0", "0x426ca1ea2406c07d75db9585f22781c096e3d0e0"]; // MINEREUM

const erc20ABI = abi();
const STORAGE_KEY = "coineyedata";
let web3 = new Web3(rpcURLmainnet);
const regexETH = new RegExp('^0x[a-fA-F0-9]{40}$');
let metamaskweb3 = null;
let baseTokenElement;
let uiCache = {};
let current_chain = "eth";
const ETHERSCAN_APIKEY = "7AQ3713SDIIEK2TMI5ZS9W4IB6YFBFF1QZ";
const DISABLE_METAMASK = true;

const ANUBIS_VERSION_NUM = "0.0.164";

document.addEventListener("DOMContentLoaded", function(event)
{
    console.log("ANUBIS VERSION " + ANUBIS_VERSION_NUM);

    uiCache.content_eth         = document.querySelector('.content_eth');
    uiCache.content_bsc         = document.querySelector('.content_bsc');
    uiCache.content_matic       = document.querySelector('.content_matic');
    uiCache.totalDivElem_eth    = uiCache.content_eth.querySelector('.totaldiv');
    uiCache.totalValElem_eth    = uiCache.content_eth.querySelector(".totaldiv-val");
    uiCache.totalDivElem_bsc    = uiCache.content_bsc.querySelector('.totaldiv');
    uiCache.totalValElem_bsc    = uiCache.content_bsc.querySelector(".totaldiv-val");
    uiCache.totalDivElem_matic  = uiCache.content_matic.querySelector('.totaldiv');
    uiCache.totalValElem_matic  = uiCache.content_matic.querySelector(".totaldiv-val");
    uiCache.totalDivElem_eth.style.display = "none";
    uiCache.totalDivElem_bsc.style.display = "none";
    uiCache.totalDivElem_matic.style.display = "none";
    uiCache.content_bsc.style.display = "none";
    uiCache.content_matic.style.display = "none";
    
    uiCache.splashscreen          = document.querySelector('.splashscreen');
    uiCache.splashscreen.style.opacity = "1.0";
    setTimeout(function()
    {
        let interval = setInterval(function ()
        {
            uiCache.splashscreen.style.opacity-=0.05;
            if (uiCache.splashscreen.style.opacity <= 0.0)
            {
                clearInterval(interval);
                uiCache.splashscreen.parentNode.removeChild(uiCache.splashscreen);
            }
        }, 20);
    }, 360); 

    uiCache.nowloadingElem           = document.querySelector(".nowloading");
    uiCache.chainswitcher_switchrow  = document.querySelector(".chainswitcher_switchrow");

    baseTokenElement    = document.querySelector('.tokenp');
    uiCache.refresherbuttonElem = document.querySelector(".refresherbutton");
    uiCache.inputArea           = document.querySelector(".inputarea");
    uiCache.inputbarElem        = document.querySelector(".inpaddress");
    uiCache.checkButton         = document.querySelector("#btn_main_check");
    uiCache.maincolumn          = document.querySelector(".maincolumn");
    uiCache.mainPlaceholderLabel= document.querySelector(".maincolumn h1");
    uiCache.divTotalBTCvalue    = document.querySelector(".tot_btcv");
    uiCache.divTotalETHvalue    = document.querySelector(".tot_ethv"); 
    uiCache.btn_metamask        = document.querySelector("#btn_metamask"); 
    uiCache.divAddress_list     = document.querySelector(".address_list"); 
    uiCache.baseAddressElement  = document.querySelectorAll(".address_div")[0]; 
    uiCache.newaddresslink      = document.querySelector(".newaddresslink");
    uiCache.contents            = document.querySelectorAll(".content"); 
    uiCache.unitLabel           = document.querySelectorAll(".input_label_unit");

    uiCache.divSamplesEth       = document.querySelector(".samples_eth");
    uiCache.divSamplesBsc       = document.querySelector(".samples_bsc");
    uiCache.divSamplesMatic     = document.querySelector(".samples_matic");

    uiCache.whichaddressElem_eth      = document.querySelector(".whichaddress_eth");
    uiCache.whichaddressElem_bsc      = document.querySelector(".whichaddress_bsc");
    uiCache.whichaddressElem_matic    = document.querySelector(".whichaddress_matic");
    uiCache.whichaddressElem_eth.style.display = "none";
    uiCache.whichaddressElem_bsc.style.display = "none";
    uiCache.whichaddressElem_matic.style.display = "none";

    uiCache.nowloadingElem.style.display = "none";
    baseTokenElement.style.display = "none";

    if (!window.ethereum || DISABLE_METAMASK) uiCache.btn_metamask.parentNode.removeChild(uiCache.btn_metamask);

    uiCache.inputbarElem.addEventListener("keyup", function(event)
    {
        if (!uiCache.checkButton.disabled && (event.key == "Enter" || event.keyCode === 13))
        {
            buildPortfolio();
            return;
        }
    });

    uiCache.checkButton.addEventListener("click", function (event)
    {
        buildPortfolio();
    });

    let sampleLinks = document.querySelectorAll(".sample_addrs a");
    for (let i = 0; i < sampleLinks.length; i++)
    {
        sampleLinks[i].addEventListener("click", function (event)
        {
            document.querySelectorAll(".address_div")[0].querySelector("input").value = sampleLinks[i].dataset.addr;
            buildPortfolio();
        });
    }

    baseTokenElement.parentNode.removeChild(baseTokenElement);

    uiCache.btn_metamask.addEventListener("click", function (event)
    {
        getMetamaskAccounts();
    });

    fillInGasPrices();

    uiCache.newaddresslink.addEventListener("click", function (event)
    {
        //add address box
        uiAddAddressBox("");
    });

    let chainSelectors = document.querySelectorAll(".chainbutton");
    for (let i = 0; i < chainSelectors.length; i++)
    {
        const e = chainSelectors[i];
        e.addEventListener("click", function (event) //CHANGING CHAIN
        {
            switchChain(e.dataset.chain);
        });
    }

    console.log("TODO: download uniswap coingecko WHILE WAITING before inputs");
    console.log("TODO: download coingecko ID list WHILE WAITING before inputs");
    //download these if 24h have passed or something

    const success = loadDataFromLocalStorage();
    if (success)
    {
        //buildPortfolio();
    }

});

function switchChain(_chain)
{
    let chainSelectors = document.querySelectorAll(".chainbutton");
    for (let g = 0; g < chainSelectors.length; g++)
    {
        chainSelectors[g].classList.remove("chosen_chain");
        if (chainSelectors[g].dataset.chain == _chain) chainSelectors[g].classList.add("chosen_chain");
    }
    
    current_chain = _chain;

    for (let d = 0; d < uiCache.contents.length; d++)
    {
        const cont = uiCache.contents[d];
        cont.style.display = "none";
        if (cont.dataset.chain == _chain)
        {
            cont.style.display = "block";
        }
    }

    if (current_chain == "eth")   
    {
        uiCache.unitLabel.forEach(function(element)
        {
            element.innerText = "Ethereum";
        });
        document.querySelector(".eth_gas_box").style.display = "block";
        if (window.ethereum) uiCache.btn_metamask.style.display = "inline-block";
        //change sample addresses
        uiCache.divSamplesEth.style.display = "block";
        uiCache.divSamplesBsc.style.display = "none";
        uiCache.divSamplesMatic.style.display = "none";

        uiCache.maincolumn.classList.add("eth_gradient");
        uiCache.maincolumn.classList.remove("bsc_gradient");
        uiCache.maincolumn.classList.remove("matic_gradient");
    }
    if (current_chain == "bsc")   
    {
        uiCache.unitLabel.forEach(function(element)
        {
            element.innerText = "Binance Smart Chain";
        });
        document.querySelector(".eth_gas_box").style.display = "none";
        uiCache.btn_metamask.style.display = "none";
        //change sample addresses
        uiCache.divSamplesEth.style.display = "none";
        uiCache.divSamplesBsc.style.display = "block";
        uiCache.divSamplesMatic.style.display = "none";

        uiCache.maincolumn.classList.remove("eth_gradient");
        uiCache.maincolumn.classList.add("bsc_gradient");
        uiCache.maincolumn.classList.remove("matic_gradient");
    }
    if (current_chain == "matic")
    {
        uiCache.unitLabel.forEach(function(element)
        {
            element.innerText = "Polygon Matic";
        });
        document.querySelector(".eth_gas_box").style.display = "none";
        uiCache.btn_metamask.style.display = "none";
        //change sample addresses
        uiCache.divSamplesEth.style.display = "none";
        uiCache.divSamplesBsc.style.display = "none";
        uiCache.divSamplesMatic.style.display = "block";

        uiCache.maincolumn.classList.remove("eth_gradient");
        uiCache.maincolumn.classList.remove("bsc_gradient");
        uiCache.maincolumn.classList.add("matic_gradient");
    }
    saveDataToLocalStorage();
}

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
        //buildPortfolio([accounts[0]], ""+current_chain);
        //fille first input with account addr
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
                console.log('MetaMask user rejection');
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

function loadDataFromLocalStorage()// returns whether it had to default
{
    let savedData = JSON.parse(localStorage.getItem(STORAGE_KEY));
    //console.log(savedData);
    if (!savedData && savedData == null || !savedData.lastAddrs)
    {
        let defaultData = {};
        defaultData.lastAddrs = [];
        defaultData.chain = "eth";
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
        savedData = JSON.parse(localStorage.getItem(STORAGE_KEY));    
        // console.log("loaded:");
        // console.log(savedData);
        return false;
    }
    else
    {
        // console.log("savestate:");
        // console.log(savedData);

        //build address boxes
        for (let i = 0; i < savedData.lastAddrs.length; i++)
        {
            if (i == 0)     uiCache.inputbarElem.value = savedData.lastAddrs[0];
            else            uiAddAddressBox(""+savedData.lastAddrs[i]);
        }
        switchChain(savedData.chain);
        return true;
    }

}

function saveDataToLocalStorage()
{
    let addrs = getAllInputAddresses();
    let storeData = {};
    storeData.lastAddrs = addrs;
    storeData.chain = ""+current_chain;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storeData));
}

function decimalsToFraction(raw, decimalAmount)
{
    console.log(`${raw} / ${decimalAmount} ${Math.pow(10, decimalAmount)}`);
    return (raw / Math.pow(10, decimalAmount));
}

async function buildPortfolio() //addr is now an array
{
    let addrs = getAllInputAddresses();
    let chain = ""+current_chain;
    
    saveDataToLocalStorage();

    // pollBSC(addrs[0], function()
    // {
    //     pollMatic(addrs[0]);
    // });
    

    //let addr = addrs[0];

    uiCache.chainswitcher_switchrow.style.display = "none";

    if (chain == "eth")         uiCache.totalDivElem_eth.style.display = "none";
    else if (chain == "bsc")    uiCache.totalDivElem_bsc.style.display = "none";
    else if (chain == "matic")  uiCache.totalDivElem_matic.style.display = "none";
    
    uiCache.nowloadingElem.style.display = "block";
    uiCache.mainPlaceholderLabel.style.display = "none";
    
    let listofdivs = document.querySelectorAll('.tokenp');
    for (let i = 0; i < listofdivs.length; i++)
    {
        listofdivs[i].parentNode.removeChild(listofdivs[i]);
    }

    uiCache.checkButton.disabled = true;
    uiCache.checkButton.innerText = "please wait";
    
    if (chain == "eth") 
    {
        uiCache.whichaddressElem_eth.style.display = "block";
        uiCache.whichaddressElem_eth.innerHTML = addrs.join("<br />");
    }
    else if (chain == "bsc") 
    {
        uiCache.whichaddressElem_bsc.style.display = "block";
        uiCache.whichaddressElem_bsc.innerHTML = addrs.join("<br />");
    }
    else if (chain == "matic") 
    {
        uiCache.whichaddressElem_matic.style.display = "block";
        uiCache.whichaddressElem_matic.innerHTML = addrs.join("<br />");
    }
    
    uiCache.nowloadingElem.style.display = "block";

    //keys are the eth input address, values are token contract addrs
    let tokenAddressesOfAccounts = {};
    for (let i = 0; i < addrs.length; i++)
    {
        const a = addrs[i];
        tokenAddressesOfAccounts[a] = [];
    }
    
    for (let i = 0; i < addrs.length; i++)
    {
        let _list = await getTokenAddressesOfAccount(addrs[i]);
        for (let b = 0; b < _list.length; b++)
        {
            tokenAddressesOfAccounts[addrs[i]].push(_list[b]);
        }
    }

    //coingecko_ids = await fetchJson("https://api.coingecko.com/api/v3/coins/list?include_platform=false");
    coingecko_ids = await fetchJson("./coingecko_id_list.json");

    let relevantUniswapTokens = [];
    relevantUniswapTokens = await fetchRelevantUniswapTokens(tokenAddressesOfAccounts);

    for (let i = 0; i < relevantUniswapTokens.length; i++)
    {
        const token = relevantUniswapTokens[i];
        
        let match = false;
        for (let cin = 0; cin < coingecko_ids.length; cin++) //takes 1-2ms
        {
            const cide = coingecko_ids[cin];
            //if (cide.symbol.toUpperCase() == token.symbol) // breaks when tokens have the same symbol
            if (cide.name.toUpperCase() == token.name.toUpperCase()) 
            {
                token.coingecko_id = cide.id;
                match = true;
                break;
            }
        }
        if (!match) 
        {
            for (let cin = 0; cin < coingecko_ids.length; cin++) //takes 1-2ms
            {
                const cide = coingecko_ids[cin];
                if (cide.symbol.toUpperCase() == token.symbol) // breaks when tokens have the same symbol
                {
                    token.coingecko_id = cide.id;
                    match = true;
                    break;
                }
            }
        }
        //if (!match)  console.log(`no match for ${token.name}`);
    }

    let query_coins_part = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum%2C";
    for (let i = 0; i < relevantUniswapTokens.length; i++)
    {
        const token = relevantUniswapTokens[i];
        query_coins_part = query_coins_part + token.coingecko_id;
        //console.log(`adding for price query: ${token.coingecko_id}`);
        if (i < relevantUniswapTokens.length - 1) query_coins_part = query_coins_part + "%2C";
    }
    query_coins_part = query_coins_part + "&vs_currencies=usd,eth,btc&include_24hr_change=true"; //added eth and btc prices
    //console.log(query_coins_part);
    let coingeckoPrices = await fetchJson(query_coins_part);

    //prepare tokens
    for (let i = 0; i < relevantUniswapTokens.length; i++)
    {
        const token = relevantUniswapTokens[i];
        // console.log(`token:`);
        // console.log(token);
        token.tokenprice = {};
        token.tokenprice.usd = 0;
        token.tokenprice.eth = 0;
        token.tokenprice.btc = 0;
        token.injected_current_price = {};
        token.injected_current_price.usd = 0;
        token.injected_current_price.eth = 0;
        token.injected_current_price.btc = 0;
        token.injected_current_price.usd_24h_change = 0;
        token.notsupported = false;

        if (!token.coingecko_id || !coingeckoPrices[token.coingecko_id] || !coingeckoPrices[token.coingecko_id].usd)
        {
            //console.log(`Error: Symbol ${token.symbol} is not supported.`);
            token.notsupported = true;
        }
        else
        {
            token.injected_current_price = coingeckoPrices[token.coingecko_id];
        }
        token.contract = new web3.eth.Contract(erc20ABI, token.address);
    }

    for (const [ethaddr, tokenaddrs] of Object.entries(tokenAddressesOfAccounts))
    {
        //console.log(`ethaddr: ${ethaddr}`);
        //console.log(`tokenaddrs.length: ${tokenaddrs.length}`);
        for (let yy = 0; yy < tokenaddrs.length; yy++)
        {
            const tokenaddr = tokenaddrs[yy];
            //console.log(`attempting tokenaddr ${tokenaddr}`);
            let skip = false;
            for (let bb = 0; bb < addressBlacklist.length; bb++) //blacklist
            {
                if (addressBlacklist[bb] == tokenaddr)
                {
                    //console.log(`SKIPPING ${tokenaddr} IN getting balances`);
                    skip = true;
                    break; //found, break out of blacklist
                }
            }
            if (skip) continue; // next token


            let token = null;
            
            for (let n = 0; n < relevantUniswapTokens.length; n++)
            {
                if (tokenaddr == relevantUniswapTokens[n].address)
                {
                    token = relevantUniswapTokens[n];
                }
            }
            if (token == null)
            {
                //console.log(`CANNOT FIND TOKEN ${tokenaddr}`);
                continue;
            }

            //console.log(`Polling TOKEN: ${token.name} - ${token.address} FOR ADDRESS: ${ethaddr}`);
            await token.contract.methods.balanceOf(ethaddr).call().then(function (bal)
            {
                let balance_raw = bal;
                //token.balance = balance_raw / Math.pow(10, token.decimals);
                token.balance = decimalsToFraction(balance_raw, token.decimals);
                let div_elem;

                if (token.balance > 0)
                {
                    div_elem = ui_addTokenDiv(chain, token.name, token.symbol, token.balance, token.logoURI);
                    //if (!token.injected_current_price)  console.log("No price for " + token.symbol);
                    token.tokenprice_usd = parseFloat(token.injected_current_price.usd);
                    token.tokenprice_eth = parseFloat(token.injected_current_price.eth);
                    token.tokenprice_btc = parseFloat(token.injected_current_price.btc);
                    token.change24h_usd  = parseFloat(token.injected_current_price.usd_24h_change).toFixed(2);
                    token.total_usd = parseFloat(parseFloat(token.tokenprice_usd) * parseFloat(token.balance)); 
                    token.total_eth = parseFloat(parseFloat(token.tokenprice_eth) * parseFloat(token.balance)); 
                    token.total_btc = parseFloat(parseFloat(token.tokenprice_btc) * parseFloat(token.balance)); 
                    div_elem.querySelector('.eth_value').innerText  = `ETH ${numberWithCommas(token.total_eth.toFixed(2))}`;
                    div_elem.querySelector('.eth_value').dataset.val = token.total_eth;
                    div_elem.querySelector('.btc_value').innerText  = `BTC ${numberWithCommas(token.total_btc.toFixed(2))}`;
                    div_elem.querySelector('.btc_value').dataset.val = token.total_btc;
                    div_elem.querySelector('.usd_value').innerText  = "$ " + numberWithCommas(token.total_usd.toFixed(2));
                    div_elem.querySelector('.tokendetails').innerText  = `${token.symbol} : $ ${numberWithCommas(token.tokenprice_usd.toFixed(2))}`;
                    div_elem.querySelector('.usd_value').dataset.val = token.total_usd;
                    if (!token.injected_current_price.usd_24h_change)
                    {
                        div_elem.querySelector('.usdchange').style.display = "none";
                        div_elem.querySelector('.usdchange').dataset.val = 0;
                    }
                    else
                    {
                        div_elem.querySelector('.usdchange').innerText  = (token.change24h_usd > 0) ? ("+"+token.change24h_usd+"%") : (token.change24h_usd+"%");
                        if (token.change24h_usd < 0)
                        {
                            div_elem.querySelector('.usdchange').classList.add("losses");
                        }
                        div_elem.querySelector('.usdchange').dataset.val = token.change24h_usd;
                    }

                    if (token.notsupported)
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
        
    }

    //-------------------------------------------------------------

    let eth_decimal_balance = 0.0;
    for (let i = 0; i < addrs.length; i++)
    {
        const bal = await web3.eth.getBalance(addrs[i]); //string
        eth_decimal_balance = eth_decimal_balance + parseFloat(web3.utils.fromWei(bal, 'ether'));
    }
    let ethprice = coingeckoPrices["ethereum"];
    let ethChange24 = parseFloat(ethprice.usd_24h_change).toFixed(2);
    let ethDiv = ui_addTokenDiv(chain, "Ethereum", "ETH", eth_decimal_balance, "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880");
    let eth_total_usd = (ethprice.usd*eth_decimal_balance);
    let eth_total_btc = (ethprice.btc*eth_decimal_balance);
    
    ethDiv.querySelector('.eth_value').innerText  = `ETH ${numberWithCommas(eth_decimal_balance.toFixed(2))}`;
    ethDiv.querySelector('.eth_value').dataset.val = eth_decimal_balance;
    ethDiv.querySelector('.btc_value').innerText  = `BTC ${numberWithCommas(eth_total_btc.toFixed(2))}`;
    ethDiv.querySelector('.btc_value').dataset.val = eth_total_btc;
    ethDiv.querySelector('.usd_value').innerText  = "$" + numberWithCommas(eth_total_usd.toFixed(2));
    ethDiv.querySelector('.usd_value').dataset.val = eth_total_usd;
    ethDiv.querySelector('.tokendetails').innerText  = `ETH - $${numberWithCommas(parseFloat(ethprice.usd).toFixed(2))}`;

    ethDiv.querySelector('.usdchange').innerText  = (ethChange24 > 0) ? ("+"+ethChange24+"%") : (ethChange24+"%");
    if (ethChange24 < 0) ethDiv.querySelector('.usdchange').classList.add("losses");
    ethDiv.querySelector('.usdchange').dataset.val = ethChange24;

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

    if (chain == "eth")
    {
        uiCache.totalValElem_eth.innerText = `$ ${numberWithCommas(total_usd.toFixed(2))}`;
        uiCache.totalValElem_eth.dataset.val = total_usd;
        uiCache.totalDivElem_eth.style.display = "flex";
    }
    else if (chain == "bsc")
    {
        uiCache.totalValElem_bsc.innerText = `$ ${numberWithCommas(total_usd.toFixed(2))}`;
        uiCache.totalValElem_bsc.dataset.val = total_usd;
        uiCache.totalDivElem_bsc.style.display = "flex";
    }
    else if (chain == "matic")
    {
        uiCache.totalValElem_matic.innerText = `$ ${numberWithCommas(total_usd.toFixed(2))}`;
        uiCache.totalValElem_matic.dataset.val = total_usd;
        uiCache.totalDivElem_matic.style.display = "flex";
    }

    uiCache.nowloadingElem.style.display = "none";
    
    uiCache.divTotalETHvalue.dataset.val = total_eth;
    uiCache.divTotalETHvalue.innerText = `ETH ${numberWithCommas(total_eth.toFixed(2))}`;
    uiCache.divTotalBTCvalue.dataset.val = total_btc;
    uiCache.divTotalBTCvalue.innerText = `BTC ${numberWithCommas(total_btc.toFixed(2))}`;

    uiCache.checkButton.disabled = false;
    uiCache.btn_metamask.disabled = false;
    uiCache.checkButton.innerText = "Check";

    uiCache.chainswitcher_switchrow.style.display = "flex";
    
    ui_sortTokenDivs(chain);
}

function uiAddAddressBox(_inp)
{
    let _clone = uiCache.baseAddressElement.cloneNode(true);
    _clone.querySelector(".minus_address_icon").style.visibility = "visible";
    _clone.querySelector(".minus_address_icon").addEventListener("click", function(event){
        _clone.parentNode.removeChild(_clone);
    });
    _clone.querySelector("input").value = _inp;
    _clone.querySelector("input").addEventListener("keyup", function(event)
    {
        if (!uiCache.checkButton.disabled && (event.key == "Enter" || event.keyCode === 13))
        {
            buildPortfolio();
            return;
        }
    });
    _clone.className += " cloned";
    uiCache.newaddresslink.before(_clone);
}

function ui_sortTokenDivs(chain)
{
    let contentBase;
    if (chain == "eth")   contentBase = uiCache.content_eth;
    if (chain == "bsc")   contentBase = uiCache.content_bsc;
    if (chain == "matic") contentBase = uiCache.content_matic;

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
    if (chain == "eth")   myvalElem = uiCache.totalValElem_eth;
    if (chain == "bsc")   myvalElem = uiCache.totalValElem_bsc;
    if (chain == "matic") myvalElem = uiCache.totalValElem_matic;

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
        percdiv.title = `${perc.toFixed(1)}% of your portfolio's USD value`;

        e.classList.remove("animate__animated");
        
        if (chain == "eth")   uiCache.whichaddressElem_eth.after(e);
        if (chain == "bsc")   uiCache.whichaddressElem_bsc.after(e);
        if (chain == "matic") uiCache.whichaddressElem_matic.after(e);
    }
}

function getAllInputAddresses()
{
    let divs = document.querySelectorAll(".address_div");
    let all = [];
    for (let i = 0; i < divs.length; i++)
    {
        const e = divs[i];
        let val = e.querySelector("input").value;
        if (!regexETH.test(val)) e.querySelector("input").value = "WRONG FORMAT";
        else all.push(val);
    }
    all = all.filter(onlyUnique);
    return all;
}
//regexETH.test(DEFAULT_SAMPLE_ADDR)

function ui_addTokenDiv(chain, _name, _symbol, _token_total, _icon) //add chain to ensure multi polling
{
    let clone = baseTokenElement.cloneNode(true);
    //clone.id = 'elem2';
    clone.className += " cloned "+_symbol;
    _token_total = parseFloat(_token_total);
    clone.querySelector('.token_total').innerText  = numberWithCommas(_token_total.toFixed(2)) + " " + _symbol;
    clone.querySelector('.tokenname').innerText  = _name;
    clone.querySelector('img').src = _icon;
    clone.style.display = "flex";

    if (chain == "eth")   uiCache.whichaddressElem_eth.after(clone);
    if (chain == "bsc")   uiCache.whichaddressElem_bsc.after(clone);
    if (chain == "matic") uiCache.whichaddressElem_matic.after(clone);

    return clone;
}

async function testbsc()
{
    console.log(`testbsc`);
    let addrs = getAllInputAddresses();
    //await pollBSC(addrs[0], function(){});
    
    await pollBSC("0x7B6Dd7246DED32265abFc7813d76e5c5da554129", function(){});
}

async function pollBSC(bscaddr, callback)
{
    console.log(`pollBSC ${bscaddr}`);
    let resp = await fetchJson(`http://api.covalenthq.com/v1/56/address/${bscaddr}/balances_v2/`);
    //console.log(resp.data.items);

    let coins = resp.data.items;

    for (let i = 0; i < coins.length; i++)
    {
        const c = coins[i];
        if (c.type == "dust") continue;
        c.fraction_balance = decimalsToFraction(parseInt(c.balance), parseInt(c.contract_decimals));

        uiCache.content_bsc.innerHTML += "<div style='margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid grey'>";
        uiCache.content_bsc.innerHTML += `<p><img src='${c.logo_url}' width='20' height='20' /> ${c.contract_name}</p>`;
        uiCache.content_bsc.innerHTML += `<p>${c.contract_address}</p>`;
        uiCache.content_bsc.innerHTML += `<p>${c.fraction_balance.toFixed(4)} ${c.contract_ticker_symbol}</p>`;
        uiCache.content_bsc.innerHTML += "</div>";
    }

    // uiCache.content_bsc.innerText = JSON.stringify(resp.data.items, null, 2);
     uiCache.content_bsc.style.fontFamily = "monospace";
     uiCache.content_bsc.style.fontSize = "14px";
     uiCache.content_bsc.style.textAlign = "left";
     uiCache.content_bsc.style.paddingLeft = "40px";

    callback();
}

async function pollMatic(maticaddr, callback)
{
    let resp = await fetchJson(`http://api.covalenthq.com/v1/137/address/${maticaddr}/balances_v2/`);
    //console.log(resp.data.items);
    uiCache.content_matic.innerText = JSON.stringify(resp.data.items, null, 2);

    uiCache.content_matic.style.fontFamily = "monospace";
    uiCache.content_matic.style.fontSize = "10px";
    uiCache.content_matic.style.textAlign = "left";
    uiCache.content_matic.style.paddingLeft = "40px";

    callback();
}

//filter helper
function onlyUnique(value, index, self) { return self.indexOf(value) === index; }

async function getTokenAddressesOfAccount(in_addr)
{
    let tokens = await getTokenEventsFromEtherscan(in_addr);
    let llist = [];
    for (let i = 0; i < tokens.result.length; i++)
    {
        const addr = tokens.result[i].contractAddress;

        let skip = false;
        for (let bb = 0; bb < addressBlacklist.length; bb++) //blacklist
        {
            if (addressBlacklist[bb] == addr)
            {
                //console.log(`SKIPPING ${addr} IN getTokenAddressesOfAccount`);
                skip = true;
                break; //found, break out of blacklist
            }
        }
        if (!skip) llist.push(addr);
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
}

async function fetchRelevantUniswapTokens(tokenAddressesOfAccounts)
{
//     console.log("_relevantContractAddresses");
//     console.log(tokenAddressesOfAccounts);

    let relevantTokAddrs = [];
    for (const [addr, tokenaddr] of Object.entries(tokenAddressesOfAccounts))
    {
        for (let x = 0; x < tokenaddr.length; x++)
        {
            relevantTokAddrs.push(tokenaddr[x]);
        }
    }
    relevantTokAddrs = relevantTokAddrs.filter(onlyUnique);

    let list = [];
    let response = await fetch("./uniswap_list.json");
    // https://tokens.coingecko.com/uniswap/all.json

    if (response.ok)
    { 
        let json = await response.json();

        for (let i = 0; i < json.tokens.length; i++)
        {
            const uniswapJsonToken = json.tokens[i];
            let skip = false;
            for (let bb = 0; bb < addressBlacklist.length; bb++)
            {
                if (addressBlacklist[bb] == uniswapJsonToken.address)
                {
                    //console.log(`SKIPPING ${uniswapJsonToken.address} IN fetchUniswapTokenList`);
                    skip = true;
                    break;
                }
            }
            if (!skip)
            {
                for (let w = 0; w < relevantTokAddrs.length; w++)
                {
                    if (relevantTokAddrs[w] == uniswapJsonToken.address)
                    {
                        list.push(uniswapJsonToken);
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