const axios = require("axios");
const cheerio = require("cheerio");

const firstUrl = "https://www.marketwatch.com/tools/markets/funds/a-z/A";
const secondUrl = "https://www.marketwatch.com/tools/markets/funds/a-z/A/2";


const getHTML = async (url) => {
    return await axios.get(url).then(({data}) => {
        return data;
    }).catch(error => console.error(error));
}

const getBodyData = (htmlData) => {
    const htmlTag = "body";
    const $ = cheerio.load(htmlData);
    return $(htmlTag).html();
}

const dataPreparation = (data) => {
    const bodyData = getBodyData(data);
    const htmlRegex = /(<([^>]+)>)/ig;
    let preparedData = clearData(bodyData);
    console.log(preparedData)

}

const clearData = (data) => {
    let cleanData = data.replace(/(\r\n|\n|\r)/gm, "");
    cleanData = cleanData.replace(/(\t)/gm, "");
    cleanData = cleanData.replace(/\s/g, "");
    return cleanData;
}


const run = async () => {
    const firstHTMLData = await getHTML(firstUrl);
    const secondHTMLData = await getHTML(secondUrl);
    dataPreparation(firstHTMLData);
}



run().catch(error => console.error(error));