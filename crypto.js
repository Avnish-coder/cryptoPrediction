const cheerio = require("cheerio");
const request = require("request");
const fs = require("fs");

let cr = `https://coinranking.com`;
let lcw = `https://www.livecoinwatch.com`;

let linksArr = [];
let linkArr2 = [];
let cryptoData = [];
let idc = 0;

// sracpping of livecoinWatch's startingPoint

request(lcw, cb2);

function cb2(err, response, html) {
    if (err) {
        console.log(err);
    } else {
        livecoinwatch(html);
    }
}

function livecoinwatch(html) {
    let extracter = cheerio.load(html);
    let rows = extracter(".lcw-table-container.main-table tbody tr a");
    for (let i = 0; i < 30; i++) {
        let links = extracter(rows[i]).attr(`href`);
        if (links != undefined) {
            linksArr.push(`https://www.livecoinwatch.com` + links);
        }
    }
    for (let i = 0; i < linksArr.length; i++) {
        request(linksArr[i], cb3);

    }
}

function cb3(err, response, html) {
    if (err) {
        console.log(err);
    } else {
        getCoin(html);
    }
}

function getCoin(html) {
    let obj = {};
    let extracter = cheerio.load(html);
    let otherData = extracter(".price.no-grow");
    let hr24 = extracter(`.cion-item.col-md-4.col-xl-3.px-1.py-1.py-md-0 span`);

    obj.name = extracter(".coin-name").text();
    obj.price = extracter(".cion-item.coin-price-large").text().split(" ")[0];
    obj.marketCap = extracter(otherData[7]).text();
    obj.volume = extracter(otherData[8]).text();
    obj.totalCap = extracter(otherData[9]).text();
    obj.allTimeHigh4 = extracter(otherData[6]).text();
    obj.range24 = extracter(hr24[0]).text();
    obj.low24 = extracter(hr24[1]).text();
    obj.high24 = extracter(hr24[2]).text();
    let year = extracter(`.d-none.d-xl-block.col-2.px-0.py-0 .percent.d-none.d-lg-block`);
    if (extracter(year[1]).text() != "") {
        obj.YearPer = "+" + extracter(year[1]).text();
    } else {
        obj.YearPer = "+0%";
    }

    cryptoData.push(obj)
    idc++

    if (idc == 30) {
        // if(fs.existsSync)

        fs.writeFileSync("lcwCrypto.json", JSON.stringify(cryptoData));
        // console.log(cryptoData)
        predictingFn();
    }
}

// sracpping of livecoinWatch's endingPoint


// cmc StartingPoint
request(cr, cb1);

function cb1(err, response, html) {
    if (err) {
        console.log(err);
    } else {
        coinranking(html);
    }
}


function coinranking(html) {

    let extracter = cheerio.load(html);
    let aTag = extracter(`.profile__name a`);
    for (let i = 15; i < 30; i++) {
        let link = extracter(aTag[i]).attr(`href`);
        linkArr2.push(`https://coinranking.com` + link);
    }

    for (let i = 0; i < linkArr2.length; i++) {
        request(linkArr2[i], cb4)
    }

}

function cb4(err, res, html) {
    if (err) {
        console.log(err)
    }
    else {
        extractFromCR(html)
    }
}

function extractFromCR(html) {
    let obj = {}
    let crPage = cheerio.load(html)
    obj.name = crPage(".hero__title").text().split(" ")[6]
    obj.price = "$" + crPage(".coin-overview__price ").text().split("\n")[3].trim()
    let lastOneYearArr = crPage(".coin-price-performance__change-value")
    let lastOneYear = crPage(lastOneYearArr[11]).text().trim()
    if (lastOneYear === "--") {
        obj.YearPer = "+0%"
    }
    else {
        obj.YearPer = lastOneYear
    }
    let infoArr = crPage(`.stats__value`);
    obj.volume = "$" + crPage(infoArr[3]).text().split(" ")[36] + " M";
    obj.marketCap = "$" + crPage(infoArr[4]).text().split(" ")[36] + " B";

    cryptoData.push(obj)

    idc++
    if (idc == 30) {
        fs.writeFileSync("lcwCrypto.json", JSON.stringify(cryptoData));
        // console.log(cryptoData)
        predictingFn();
    }
}

// // cmc endingPoint



// comparing data start
function predictingFn() {
    let arr = JSON.parse(fs.readFileSync("lcwCrypto.json", "utf-8"));
    // console.log(arr);
    let bestCrypto = {};

    let maxValue = 0;
    for (let i = 0; i < arr.length; i++) {
        let lprice = getAverage(arr[i].YearPer, arr[i].price);
        // console.log(typeof lprice);
        let nPrice = getnPrice(arr[i].price, lprice);
        // console.log(nPrice);
        if (maxValue < nPrice) {

            bestCrypto = arr[i];
            maxValue = nPrice;

        }
    }
    fs.writeFileSync("futureCrypto.json",JSON.stringify(bestCrypto))
    console.log(bestCrypto);
}

function getAverage(percent, price) {
    let pri = parseInt(price.slice(1));
    let per = parseInt(percent.slice(1, percent.length - 1));

    let avg = (per / 100) * pri;

    return avg;
}

function getnPrice(price, lyprice) {
    price = parseInt(price.slice(1))

    let nPrice = ( lyprice / price ) * 100;
    // console.log(nPrice);
    return nPrice;

}

// comparing data end




