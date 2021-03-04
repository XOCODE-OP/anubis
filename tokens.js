'use strict';
'esversion: 8';
// jshint node: true
// jshint trailingcomma: false
// jshint undef:true
// jshint unused:true
// jshint varstmt:true

let tokenSymbolWhitelist = ["POLS" , "GRT","INDEX","FTT" ,"UBT","AAVE","PAID","MRPH" , 
"LRC","RSR","TRAC","LINK", "PRQ","ORN","BAO","BFLY" , "BAND","OM", "DEXT", "SWAP", "PHA",
"CAKE", "NU", "RING", "ALEPH", "DDIM", "COVER", "YF-DAI", "XOR", "INFI", "KSM", "CEL", "DOT",
"OCEAN", "REN", "PNK", "AKRO", "WNXM", "CHSB", "MKR", "1INCH", "API3", "XFT", "RUNE", "MPH",
"UNI", "REEF", "SNX", "RLC", "ANKR", "BMI", "TXL", "UTK", "KAVA", "STAKE", "DIA", "FSN", "CFI",
"IRIS", "TKN", "GARD", "ZEFU", "YLD"];
let myTokenList = [];

async function main()
{
    let response = await fetch("./all_tokens_feb2021.json");

    if (response.ok)
    { 
        let json = await response.json();
        console.log(json.tokens.length);
        console.log(json.tokens[33]);

        let _newcontent = "";

        for (let i = 0; i < json.tokens.length; i++)
        {
            const t = json.tokens[i];
            // const addr = t.address;
            // const name = t.name;
            // const symbol = t.symbol;
            // const decimals = t.decimals;
            // const logouri = t.logoURI;

            for (let w = 0; w < tokenSymbolWhitelist.length; w++)
            {
                if (tokenSymbolWhitelist[w] == t.symbol)
                {
                    myTokenList.push(t);
                }
            }
        }

        for (let i = 0; i < myTokenList.length; i++)
        {
            const e = myTokenList[i];

            _newcontent = `${_newcontent} 
              <p>${e.name} (${e.symbol}): ${e.address}</p>`;
        }

        document.getElementById("content").innerHTML = _newcontent;

        // let obj = JSON.parse(json);
        // console.log(obj);
    }
    else
    {
      console.log("HTTP-Error: " + response.status);
    }
}
main();
