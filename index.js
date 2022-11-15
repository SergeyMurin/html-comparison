const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const firstUrl = "https://www.marketwatch.com/tools/markets/funds/a-z/A";
const secondUrl = "https://www.marketwatch.com/tools/markets/funds/a-z/A/2";


const getHTML = async (url) => {
    return await axios.get(url).then(({data}) => {
        return data;
    }).catch(error => console.error(error));
}

const getDataInHTML = (data, htmlTag) => {
    const OPENED_TAG_REGEX = new RegExp(`<${htmlTag}[\\s\\S]*?>`, "ig");
    const CLOSED_TAG_REGEX = new RegExp(`<\/${htmlTag}>`, "ig");

    const openedTag = data.match(OPENED_TAG_REGEX)[0];
    const closedTag = data.match(CLOSED_TAG_REGEX)[0];

    const $ = cheerio.load(data);
    let allData = $(htmlTag).html();

    const dividedData = divideScriptTags(allData);
    let dataWithoutScriptTags = dividedData[0];
    dataWithoutScriptTags = clearData(dataWithoutScriptTags);
    const scriptTags = dividedData[1];

    allData = openedTag + dataWithoutScriptTags + scriptTags + closedTag;

    return allData;
}

const getDoctypeTags = (data) => {
    const HTML_DOCTYPE_TAG_REGEX = /<!doctype[\s\S]*?>/ig;
    const HTML_HTML_OPENED_TAG_REGEX = /<html[\s\S]*?>/ig;
    const HTML_HTML_CLOSED_TAG_REGEX = /<\/html>/ig;

    const doctypeTag = data.match(HTML_DOCTYPE_TAG_REGEX)[0];
    const htmlOpenedTag = data.match(HTML_HTML_OPENED_TAG_REGEX)[0];
    const htmlClosedTag = data.match(HTML_HTML_CLOSED_TAG_REGEX)[0];

    return [doctypeTag + htmlOpenedTag, htmlClosedTag];


}

const divideScriptTags = (data) => {
    const HTML_SCRIPT_TAG_REGEX = /<script[\s\S]*?>[\s\S]*?<\/script>/ig;

    let scriptTags = data.match(HTML_SCRIPT_TAG_REGEX);
    let withoutScriptTags = data.replace(HTML_SCRIPT_TAG_REGEX, "");

    let scriptTagsStr = "";
    for (let scriptTag of scriptTags) {
        scriptTagsStr += scriptTag;
    }

    return [withoutScriptTags, scriptTagsStr];
}

const dataPreparation = (data) => {
    const HTML_OPENED_TAG_REGEX = /((<)\w+(>))/g;
    const HTML_CLOSED_TAG_REGEX = /((<\/)\w+(>))/g;

    const doctypeTags = getDoctypeTags(data);
    let headData = getDataInHTML(data, "head");
    let bodyData = getDataInHTML(data, "body");

    return doctypeTags[0] + headData + bodyData + doctypeTags[1];
}

const clearData = (data) => {
    let cleanData = data.replace(/(\r\n|\n|\r)/gm, "");
    cleanData = cleanData.replace(/(\t)/gm, "");
    cleanData = cleanData.replace(/>\s+|\s+</g, (m) => {
        return m.trim();
    });

    return cleanData;
}


const run = async () => {
    try {
        const firstHTMLData = await getHTML(firstUrl);
        //const secondHTMLData = await getHTML(secondUrl);
        let firstData = dataPreparation(firstHTMLData);
        fs.writeFileSync("test.html", firstData, "ascii");
    } catch (error) {
        console.error(error);
    }
}


run().catch(error => console.error(error));