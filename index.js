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
    const HTML_OPENED_TAG_REGEX = /((<)\w+(>))/g;
    const HTML_CLOSED_TAG_REGEX = /((<\/)\w+(>))/g;

    const bodyData = getBodyData(data);
    let preparedData = clearData(bodyData);
    //console.log(preparedData)
}

const clearData = (data) => {
    let cleanData = data.replace(/(\r\n|\n|\r)/gm, "");
    cleanData = cleanData.replace(/(\t)/gm, "");
    cleanData = cleanData.replace(/>\s+|\s+</g, (m) => {
        return m.trim();
    })
    cleanData = clearScriptTagContent(cleanData);
    // cleanData = cleanData.replace(/\s/g, "");
    console.log(cleanData);
    return cleanData;
}

const clearScriptTagContent = (data) => {
    const HTML_SCRIPT_TAG = /<script[\s\S]*?>[\s\S]*?<\/script>/ig;
    const HTML_SCRIPT_OPENED_TAG = /<script[\s\S]*?>/ig;
    const HTML_SCRIPT_CLOSED_TAG = /<\/script>/ig;

    const allScriptTags = data.match(HTML_SCRIPT_TAG);
    let newData = data.replace(HTML_SCRIPT_TAG, "");

    for (let scriptTag of allScriptTags) {
        const openTagStr = scriptTag.match(HTML_SCRIPT_OPENED_TAG);
        const closeTagStr = "</script>";
        const openTagParts = scriptTag.split(openTagStr);
        const closeTagParts = openTagParts[1].split(HTML_SCRIPT_CLOSED_TAG);
        const content = closeTagParts[0].replace(/\s/g, "").trim();
        newData = newData + openTagStr + content + closeTagStr;
    }
    return newData;
}


const run = async () => {
    try {
        const firstHTMLData = await getHTML(firstUrl);
        //const secondHTMLData = await getHTML(secondUrl);
        dataPreparation(firstHTMLData);
    } catch (error) {
        console.error(error);
    }
}


run().catch(error => console.error(error));