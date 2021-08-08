console.log("hi");
const rpcURLmainnet = "https://mainnet.infura.io/v3/daa5a2696b2a47a4b969df8e11931282";
let web3 = new Web3(rpcURLmainnet);

async function dodo()
{
    console.log("dodo");

    let t0 = performance.now();
    let jjson;
    let _response = await fetch("https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=0x83e6f1e41cdd28eaceb20cb649155049fac3d5aa&address=0x187f899fcBd0cb2C23Fc68d6339f766814D9dDeb&tag=latest&apikey=7AQ3713SDIIEK2TMI5ZS9W4IB6YFBFF1QZ"); 
    if (_response.ok) jjson = await _response.json();
    else return null;
    console.log(`balance of etherscan took ${(performance.now() - t0).toFixed(0)} ms`);
    console.log(jjson);

    const erc20ABI = abi();
    let pols_contract = new web3.eth.Contract(erc20ABI, "0x83e6f1e41cdd28eaceb20cb649155049fac3d5aa");
    t0 = performance.now();
    let balance_raw = await pols_contract.methods.balanceOf("0x187f899fcBd0cb2C23Fc68d6339f766814D9dDeb").call();
    console.log(`balance of infura took ${(performance.now() - t0).toFixed(0)} ms`);
    console.log("Balance: " + balance_raw);
}

dodo();