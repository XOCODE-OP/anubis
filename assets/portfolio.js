'use strict';
// jshint esversion: 8
// jshint node: true
// jshint trailingcomma: false
// jshint undef:true
// jshint unused:false
// jshint varstmt:true
// jshint browser: true 

//coingecko uniswap list https://tokens.coingecko.com/uniswap/all.json

//const addr = "0x187f899fcBd0cb2C23Fc68d6339f766814D9dDeb";
//let coingecko_markets; //https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false
// let coingecko_ids; //https://api.coingecko.com/api/v3/coins/list?include_platform=false
//let uniswapTokenList = [];
//let relevantContractAddresses = [];
// let addressBlacklist = ["0xc92e74b131d7b1d46e60e07f3fae5d8877dd03f0", "0x426ca1ea2406c07d75db9585f22781c096e3d0e0"]; // MINEREUM
const ETHEREUM_ICON_BASE64 = "data:image/png;base64,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";
// let erc20ABI = "";
// let allUniswapTokens;
const STORAGE_KEY = "anubis_assets";
// let web3 = new Web3(rpcURLmainnet);
const regexETH = new RegExp('^0x[a-fA-F0-9]{40}$');
let baseTokenElement;
let baseSmallTokenElement;
let ui = {};
// let current_chain = "eth";
let gasdata = null;
const DISABLE_METAMASK = false;

const ANUBIS_VERSION_NUM = "0.2.0021";

document.addEventListener("DOMContentLoaded", function(event)
{
    console.log("ANUBIS VERSION " + ANUBIS_VERSION_NUM);

    ui.checkButton         = document.querySelector("#btn_main_check");
    ui.checkButton.disabled = true;
    ui.checkButton.innerText = "Check";
    ui.checkButton.disabled = false;
    ui.content_eth         = document.querySelector('.content_eth');
    ui.content_bsc         = document.querySelector('.content_bsc');
    ui.content_polygon       = document.querySelector('.content_polygon');
    ui.totalDivElem_eth    = ui.content_eth.querySelector('.totaldiv');
    ui.totalValElem_eth    = ui.content_eth.querySelector(".totaldiv-val");
    ui.totalDivElem_bsc    = ui.content_bsc.querySelector('.smalltotaldiv');
    ui.totalDivElem_polygon  = ui.content_polygon.querySelector('.smalltotaldiv');
    ui.totalDivElem_eth.style.display = "none";
    ui.totalDivElem_bsc.style.visibility = "hidden";
    ui.totalDivElem_polygon.style.visibility = "hidden";
    document.querySelector(".content_eth .loader").style.display = "none";
    document.querySelector(".content_bsc .loader").style.display = "none";
    document.querySelector(".content_polygon .loader").style.display = "none";
    
    ui.splashscreen          = document.querySelector('.splashscreen');
    ui.splashscreen.style.opacity = "1.0";
    setTimeout(function()
    {
        let interval = setInterval(function ()
        {
            ui.splashscreen.style.opacity-=0.05;
            if (ui.splashscreen.style.opacity <= 0.0)
            {
                clearInterval(interval);
                //uiCache.splashscreen.parent
                //uiCache.splashscreen.parentElement.removeChild(uiCache.splashscreen);
                ui.splashscreen.remove();
                // uiCache.splashscreen.style.display = "hidden";
            }
        }, 20);
    }, 360); 

    ui.nowloadingElem           = document.querySelector(".nowloading");
    // uiCache.chainswitcher_switchrow  = document.querySelector(".chainswitcher_switchrow");

    ui.refresherbuttonElem = document.querySelector(".refresherbutton");
    ui.inputArea           = document.querySelector(".inputarea");
    ui.inputbarElem        = document.querySelector(".inpaddress");
    ui.maincolumn          = document.querySelector(".maincolumn");
    ui.mainPlaceholderLabel= document.querySelector(".maincolumn h1");
    ui.divTotalBTCvalue    = document.querySelector(".tot_btcv");
    ui.divTotalETHvalue    = document.querySelector(".tot_ethv"); 
    ui.btn_metamask        = document.querySelector(".btn_metamask"); 
    ui.divAddress_list     = document.querySelector(".address_list"); 
    ui.baseAddressElement  = document.querySelectorAll(".address_div")[0]; 
    ui.newaddresslink      = document.querySelector(".newaddresslink");
    ui.contents            = document.querySelectorAll(".content"); 
    ui.unitLabel           = document.querySelectorAll(".input_label_unit");

    ui.divSamples          = document.querySelector(".samples");

    ui.chainbuttonETH      = document.querySelector(".chainbutton_eth");
    ui.chainbuttonBSC      = document.querySelector(".chainbutton_bsc");
    ui.chainbuttonPOLYGON    = document.querySelector(".chainbutton_polygon");

    ui.whichaddressElem    = document.querySelector(".whichaddress");

    ui.nowloadingElem.style.display = "none";

    let removerBaseToken   = document.querySelector('.tokenp');
    baseTokenElement       = removerBaseToken.cloneNode(true);
    removerBaseToken.remove();

    let removerBaseSmallToken   = document.querySelector('.smalltoken');
    baseSmallTokenElement       = removerBaseSmallToken.cloneNode(true);
    removerBaseSmallToken.remove();

    if (!window.ethereum || DISABLE_METAMASK) ui.btn_metamask.remove(ui.btn_metamask);

    ui.inputbarElem.addEventListener("keyup", function(event)
    {
        if (!ui.checkButton.disabled && (event.key == "Enter" || event.keyCode === 13))
        {
            buildPortfolio();
            return;
        }
    });

    ui.checkButton.addEventListener("click", function (event)
    {
        buildPortfolio();
    });

    let sampleLinks = document.querySelectorAll(".sample_addrs a");
    for (let i = 0; i < sampleLinks.length; i++)
    {
        sampleLinks[i].addEventListener("click", function (event)
        {
            let allAddrDivs = ui.divAddress_list.querySelectorAll(".address_div");
            for (let i = 1; i < allAddrDivs.length; i++)//skip first
            {
                allAddrDivs[i].parentNode.removeChild(allAddrDivs[i]);
            }
            ui.baseAddressElement.querySelector("input").value = sampleLinks[i].dataset.addr;
            buildPortfolio();
        });
    }

    ui.btn_metamask.addEventListener("click", function (event)
    {
        getMetamaskAccounts();
    });

    fillInGasPrices();

    ui.newaddresslink.addEventListener("click", function (event)
    {
        //add address box
        uiAddAddressBox("");
    });

    // let chainSelectors = document.querySelectorAll(".chainbutton");
    // for (let i = 0; i < chainSelectors.length; i++)
    // {
    //     const e = chainSelectors[i];
    //     e.addEventListener("click", function (event) //CHANGING CHAIN
    //     {
    //         switchChain(e.dataset.chain);
    //     });
    // }

    //download these if 24h have passed or something

    const success = loadDataFromLocalStorage();
    if (success)
    {
        //buildPortfolio();
    }

});

async function fillInGasPrices()
{
    gasdata = await fetchJson(`https://templeosiris.herokuapp.com/gas`);
    if (gasdata != null)
    {
        document.querySelector(".cheapgas .gas").innerHTML = ""+gasdata.SafeGasPrice;
        document.querySelector(".modgas .gas").innerHTML = ""+gasdata.ProposeGasPrice;
        document.querySelector(".fastgas .gas").innerHTML = ""+gasdata.FastGasPrice;
        document.querySelector(".uniswapcost .gas").innerHTML = ""+gasdata.uniswapCostInUSD;
    }
    else
    {
        document.querySelector(".cheapgas .gas").innerHTML = "?";
        document.querySelector(".modgas .gas").innerHTML = "?";
        document.querySelector(".fastgas .gas").innerHTML = "?";
        document.querySelector(".uniswapcost .gas").innerHTML = "?";
    }
    document.querySelector(".eth_gas_box .loader").style.visibility = "hidden";
    
    //console.log(gasdata);
    //gasdata.suggestBaseFee  gas fee
}

async function initMetamask()
{
    if (window.ethereum) 
    {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
    }
    else if (window.web3) 
    {
        window.web3 = new Web3(window.web3.currentProvider);
    }
    else
    {
        console.log("ERROR: no web3 provider");
    }
}

async function getMetamaskAccounts()
{
    console.log("getMetamaskAccounts");
    // if (window.ethereum)
    // {
    //     //metamaskweb3 = new Web3(window.ethereum);
    //     // const rpc_response = await window.ethereum.send('eth_requestAccounts');
    //     // const accounts = rpc_response.result;
    //     // refreshPortfolio(accounts[0]);
    //     window.ethereum
    //     .request({ method: 'eth_requestAccounts' })
    //     .then(handleAccountsChanged)
    //     .catch(function(err)
    //     {
    //         if (err.code === 4001)
    //         {
    //             // EIP-1193 userRejectedRequest error
    //             // If this happens, the user rejected the connection request.
    //             console.log('MetaMask user rejection');
    //         } else {
    //             console.error(err);
    //         }
    //     });

    //     window.ethereum.on('accountsChanged', function(accounts)
    //     {
    //         console.log("ACCOUNTS CHANGED");
    //         handleAccountsChanged(accounts);
    //     });
    //     window.ethereum.on('chainChanged', function(_chainId)
    //     {
    //         window.location.reload();
    //     });
    // }
    // else
    // {
    //     console.log("no metamask");
    // }

    initMetamask();

    
    let accounts = await window.web3.eth.getAccounts();
    // handleAccountsChanged(accounts);
    // accountAddress = accounts[0];

    let ele = document.querySelectorAll(".address_div.cloned");
    for (let i = 0; i < ele.length; i++)
    {
        ele[i].remove();
        //ele[i].parentElement.removeChild(ele[i]);
    }

    ui.inputbarElem.value = ""+accounts[0];

    if (accounts.length > 1)
    {
        for (let i = 1; i < accounts.length; i++)
        {
            console.log(`acc ${i}:`, accounts[i]);
            uiAddAddressBox(accounts[i]);
        }
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
            if (i == 0)     ui.inputbarElem.value = savedData.lastAddrs[0];
            else            uiAddAddressBox(""+savedData.lastAddrs[i]);
        }
        return true;
    }

}

function saveDataToLocalStorage(addrs)
{
    let storeData = {};
    storeData.lastAddrs = addrs;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storeData));
}

function decimalsToFraction(raw, decimalAmount)
{
    // console.log(`${raw} / ${decimalAmount} ${Math.pow(10, decimalAmount)}`);
    return (raw / Math.pow(10, decimalAmount));
}

async function buildPortfolio() //addr is now an array
{
    // switchChain("eth");
    let addrs = getAllInputAddresses();
    saveDataToLocalStorage(addrs);

    ui.whichaddressElem.innerHTML = `ADDRESS: &nbsp; ${addrs[0]}`;

    // uiCache.chainswitcher_switchrow.style.visibility = "hidden";

    ui.totalDivElem_eth.style.display = "none";
    ui.totalDivElem_bsc.style.visibility = "hidden";
    ui.totalDivElem_polygon.style.visibility = "hidden";
    document.querySelector(".content_eth .loader").style.display = "flex";
    document.querySelector(".content_bsc .loader").style.display = "flex";
    document.querySelector(".content_polygon .loader").style.display = "flex";
    
    ui.mainPlaceholderLabel.style.display = "none";
    
    let listofdivs = document.querySelectorAll('.tokenp, .token_o, .smalltoken');
    for (let i = 0; i < listofdivs.length; i++)
    {
        listofdivs[i].parentNode.removeChild(listofdivs[i]);
    }

    ui.checkButton.disabled = true;
    ui.checkButton.innerText = "please wait";
    
    ui.nowloadingElem.style.display = "block";

    // let eth_balance_fullcoins = 0.0;

    //keys are the eth input address, values are token contract addrs

    let resp = await fetchJson(`https://templeosiris.herokuapp.com/tokens?chain=ETH&addr=${addrs[0]}`);

    if (!resp || resp == null || !resp.items || !resp.items.length)
    {
        console.error(`Error: Problem with ETH chain poll`, resp);
        ui.content_eth.innerHTML = "Address problem, try again.";
        
    }
    else 
    {
        let coins = resp;
        // let strhtml = "";
        let prevElement = ui.totalDivElem_eth;
        let iconPollList = [];
        for (let i = 0; i < coins.items.length; i++)
        {
            if (coins.items[i] == null) continue;
            const token = coins.items[i];
            //if (token.contract_address == "0xee") eth_balance_fullcoins
            let div_elem;
            if (token.balance <= 0) continue;

            // console.log(`${token.contract_ticker_symbol}  adding ${parseFloat(token.eth_value_total)}  ${token.eth_value_total}`)

            div_elem = addUITokenETH(i, token.contract_address, token.contract_name, token.contract_ticker_symbol, token.balance_fullcoins, token.anubisicon); //token.anubislogo

            iconPollList.push( {element: div_elem, address: token.contract_address} );

            div_elem.querySelector('.eth_value').innerText  = `ETH ${numberWithCommas(parseFloat(token.eth_value_total).toFixed(2))}`;
            div_elem.querySelector('.eth_value').dataset.val = token.total_eth;
            div_elem.querySelector('.btc_value').innerText  = `BTC ${numberWithCommas(parseFloat(token.btc_value_total).toFixed(2))}`;
            div_elem.querySelector('.btc_value').dataset.val = token.total_btc;
            div_elem.querySelector('.usd_value').innerText  = "$ " + numberWithCommas(parseFloat(token.usd_value_total).toFixed(2));
            div_elem.querySelector('.usd_value').dataset.val = token.usd_value_total;
            div_elem.querySelector('.tokendetails').innerText  = `${token.contract_ticker_symbol} : $ ${numberWithCommas(parseFloat(token.usd_price_per_fullcoin).toFixed(2))}`;
               
            div_elem.querySelector('.usdchange').style.display = "none";
            // let percent = Math.floor(Math.random() * 100) - 50;
            // if (percent < 0)    div_elem.querySelector('.usdchange').classList.add("losses");
            // div_elem.querySelector('.usdchange').innerText  = (percent > 0) ? ("+"+percent+"%") : (percent+"%");
            // div_elem.querySelector('.usdchange').dataset.val = percent;

            div_elem.querySelector('.token_action_but_explorer').addEventListener("click", function(event)
            {
                window.open(`https://etherscan.io/token/${token.contract_address}`, "_blank");
                    
            });
            div_elem.querySelector('.token_action_but_swap').addEventListener("click", function(event)
            {
                location.hash = "#trade"; 
                document.querySelector("#trade_iframe").src = "about:blank";
                setTimeout(async function()
                {
                    document.querySelector("#trade_iframe").src = `https://app.uniswap.org/#/swap?inputCurrency=${token.contract_address}&outputCurrency=${token.contract_address}`;     
                }, 300);
            });
            
            prevElement.after(div_elem);
            prevElement = div_elem;

        }

        ui.totalValElem_eth.innerText = `$ ${numberWithCommas(parseFloat(coins.totalusd).toFixed(2))}`;
        //uiCache.totalValElem_bsc.innerText = `$ ${numberWithCommas(total_usd.toFixed(2))}`;
        //uiCache.totalValElem_polygon.innerText = `$ ${numberWithCommas(total_usd.toFixed(2))}`;

        ui.nowloadingElem.style.display = "none";
        
        ui.divTotalETHvalue.innerText = `ETH ${numberWithCommas(parseFloat(coins.totaleth).toFixed(2))}`;
        ui.divTotalBTCvalue.innerText = `BTC ${numberWithCommas(parseFloat(coins.totalbtc).toFixed(2))}`;
    }


    ui.checkButton.disabled = false;
    ui.btn_metamask.disabled = false;
    ui.checkButton.innerText = "Check";
    ui.totalDivElem_eth.style.display = "flex";
    
    document.querySelector(".content_eth .loader").style.display = "none";

    // uiCache.chainswitcher_switchrow.style.visibility = "visible";
    // ui_sortTokenDivs(chain);

    let ethResponse = resp;

    await pollAddressTokens("BSC", addrs[0], async function(bscResp)
    {
        await pollAddressTokens("POLYGON", addrs[0], function(polygonResp)
        {
            let crossChainUSD = numberWithCommas((parseFloat(ethResponse.totalusd) + parseFloat(bscResp.totalusd) + parseFloat(polygonResp.totalusd)).toFixed(2));
            let crossChainETH = numberWithCommas((parseFloat(ethResponse.totaleth) + parseFloat(bscResp.totaleth) + parseFloat(polygonResp.totaleth)).toFixed(2));
            let crossChainBTC = numberWithCommas((parseFloat(ethResponse.totalbtc) + parseFloat(bscResp.totalbtc) + parseFloat(polygonResp.totalbtc)).toFixed(2));
        
            document.querySelector(".cross_chain_total-usd").innerText = "$ "+crossChainUSD;
            document.querySelector(".cross_chain_total-eth").innerText = "ETH "+crossChainETH;
            document.querySelector(".cross_chain_total-btc").innerText = "BTC "+crossChainBTC;

        });
    });
}

function uiAddAddressBox(_inp)
{
    let _clone = ui.baseAddressElement.cloneNode(true);
    _clone.querySelector(".minus_address_icon").style.visibility = "visible";
    _clone.querySelector(".minus_address_icon").addEventListener("click", function(event){
        _clone.parentNode.removeChild(_clone);
    });
    _clone.querySelector("input").value = _inp;
    _clone.querySelector("input").addEventListener("keyup", function(event)
    {
        if (!ui.checkButton.disabled && (event.key == "Enter" || event.keyCode === 13))
        {
            buildPortfolio();
            return;
        }
    });
    _clone.className += " cloned";
    ui.newaddresslink.before(_clone);
}

//     orderedList.sort(function(a, b)
//     {
//         return parseFloat(a.querySelector('.usd_value').dataset.val) - 
//         parseFloat(b.querySelector('.usd_value').dataset.val);
//     });

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

function addUITokenETH(_delay, _address, _name, _symbol, _token_total, _icon) //add chain to ensure multi polling
{
    let clone = baseTokenElement.cloneNode(true);
    //clone.id = 'elem2';
    clone.className += " cloned "+_symbol;
    clone.dataset.contractaddress = _address;
    _token_total = parseFloat(_token_total);
    clone.querySelector('.token_total').innerText  = numberWithCommas(_token_total.toFixed(2)) + " " + _symbol;
    clone.querySelector('.tokenname').innerText  = _name;
    if (_icon)
    {
        if (_icon != "ETHEREUM")
        {
            // console.log("Setting icon for ", _symbol, "to", _icon, clone.querySelector('.tokenicon').style.backgroundImage);
            //clone.querySelector('.tokenicon').style.backgroundImage = `url('${_icon}')`;   
            //clone.querySelector('.tokenicon').style.backgroundColor = `transparent`;   
        }
        else
        {
            clone.querySelector('.tokenicon').style.backgroundImage = `url('${ETHEREUM_ICON_BASE64}')`;   
        } 
    }
    else
    {
        clone.querySelector('.tokenicon').innerText = `${_symbol.toUpperCase().substring(0, 3)}`;   
    }
    clone.style.visibility = "visible";
    ui.chainbuttonETH.after(clone);

    let delay = 2000 * _delay;
    setTimeout(async function()
    {
        let res = await(await fetch(`https://etherscan.io/token/${_address}`)).text();
        let part = res.split("<main")[1].split("avatar")[1].split("src='")[1].split("' />")[0];
        let full = "https://etherscan.io" + part;

        console.log("full", full);

        if (part && part.length > 6)
        {
            clone.querySelector('.tokenicon').style.backgroundImage = `url('${full}')`;   
            clone.querySelector('.tokenicon').style.backgroundColor = `transparent`;   
            console.log("full being set");
        }

    }, delay);

    return clone;
}

async function pollAddressTokens(_chain, _address, callback)
{
    _chain = _chain.toUpperCase();
    let content_box;
    let totalbox;
    let swapurl = "";
    let url = `https://templeosiris.herokuapp.com/tokens?chain=${_chain}&addr=${_address}`;
    let explorer;
    if (_chain == "BSC")   
    {
        content_box = ui.content_bsc;
        totalbox =  ui.totalDivElem_bsc;
        explorer = "bscscan";
        swapurl = "https://pancakeswap.finance/swap#/swap";
    }
    else if (_chain == "POLYGON") 
    {
        content_box = ui.content_polygon;
        totalbox =  ui.totalDivElem_polygon;
        explorer = "polygonscan";
        swapurl = "https://quickswap.exchange/#/swap";
    }

    ui.mainPlaceholderLabel.style.visibility = "hidden";
    let resp = await fetchJson(url);
    // console.log(resp);

    if (!resp || resp == null || !resp.items || !resp.items.length)
    {
        console.error(`Error: Problem with ${_chain} chain poll`, resp);
        ui.content_box.innerHTML = "Network error, try again.";
    }
    else 
    {
        let coins = resp.items;
        console.log(resp);
        for (let i = 0; i < coins.length; i++)
        {
            const c = coins[i];
            if (c == null || c.type == "dust") continue;
            c.fraction_balance = decimalsToFraction(parseInt(c.balance), parseInt(c.contract_decimals));

            let clone = baseSmallTokenElement.cloneNode(true);
            clone.className += " cloned "+c.contract_ticker_symbol.toUpperCase();
            clone.dataset.contract = ``;
            clone.dataset.usdval = ``;
            clone.querySelector(".tokenicon").innerText = `${c.contract_ticker_symbol.toUpperCase().substring(0, 3)}`;
            // console.log(clone);
            clone.querySelector(".smalltoken-name").innerText = ` ${c.contract_name}`;
            clone.querySelector(".smalltoken-usd").innerText = `$${numberWithCommas(parseFloat(c.quote).toFixed(2))}`;
            clone.querySelector(".smalltoken-coins").innerText = ` [ ${numberWithCommas(c.fraction_balance.toFixed(2))}  ${c.contract_ticker_symbol.toUpperCase()}] `;
            clone.querySelector('.token_action_but_explorer').addEventListener("click", function(event)
            {
                window.open(`https://${explorer}.com/token/${c.contract_address.toLowerCase()}`, "_blank");
            });
            clone.querySelector('.token_action_but_swap').addEventListener("click", function(event)
            {
                location.hash = "#trade"; 
                document.querySelector("#trade_iframe").src = "about:blank";
                setTimeout(async function()
                {
                    document.querySelector("#trade_iframe").src = `${swapurl}?inputCurrency=${c.contract_address}&outputCurrency=${c.contract_address}`;     
                }, 300);
            });
            if (_chain == "BSC")            document.querySelector(".content_bsc .loader").before(clone);
            else if (_chain == "POLYGON")   document.querySelector(".content_polygon .loader").before(clone);
        }
        //totalbox.style.display = "flex";

        totalbox.querySelector(".smallttot_btcv").innerText = `BTC ${numberWithCommas(parseFloat(resp.totalbtc).toFixed(2))}`;
        totalbox.querySelector(".smallttot_ethv").innerText = `ETH ${numberWithCommas(parseFloat(resp.totaleth).toFixed(2))}`;
        totalbox.querySelector(".smalltotaldiv-usdtotal").innerText = `$ ${numberWithCommas(parseFloat(resp.totalusd).toFixed(2))}`;
        totalbox.style.visibility = "visible";
        
    }

    if (_chain == "BSC")             document.querySelector(".content_bsc .loader").style.display = "none";
    else if (_chain == "POLYGON")    document.querySelector(".content_polygon .loader").style.display = "none";

    callback(resp);
}

//filter helper
function onlyUnique(value, index, self) { return self.indexOf(value) === index; }

async function fetchJson(query)
{
    // let _response = await fetch(query); 
    // if (_response.ok) return await _response.json();
    // else return null;
    let res = await fetch(query);
    if (!res.ok) {
        console.log("ERROR FETCHING ", res.status);
        console.log(res);
        return null;
    }
    else
    {
        return await (res).json();
    }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}