const fs = require('fs'),
    request = require('request'),
    cheerio = require('cheerio');



function findBook(keyPhrase, callback) {
    console.log("Hello World");
    options = {
        url: 'http://lib.lvjusd.k12.ca.us/cataloging/servlet/handlebasicsearchform.do',
        method: "post",
        form: {
            searchType:'keyword',
            redisplay:false,
            showLimiterOptions:true,
            keywordText:keyPhrase,
            includeLibrary:true,
            siteTypeID:-2
        },
        headers: {
            Accept:"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
            "Content-Type":"application/x-www-form-urlencoded",
            Cookie:"siteIDCookie=403"
        }
    };
    console.log("request sent", options);
    request(options, function(error, response, html){
        console.log("response received");
        const result = [
        ];
        let json = {};
        if(!error){
            let $ = cheerio.load(html);
            let title, author, availability;
            let books = $('#keywordTable').children().children();
            for (let i = 0, b = 0; i<=books.length; i=i+2, b++) {
                // console.log("i: ", i, ", b: ", b);
                try {
                    let titleEle = $(books[i]).find('.ColRowBold .DetailLink');
                    title = $(titleEle).text();
                    json.title = title;
                    console.log("title: ", json.title);
                } catch (e){
                    console.log("error while parsing title");
                    continue;
                }

                try {
                    let authorEle = $($($(books[i]).find('#HitListRowInfo' + b)).find('tr')[1]).find('td')[1];
                    let authorStrArray = $(authorEle).text().split("\n");
                    author = authorStrArray.filter((str) => {return str.replace(/ /g, "").length >= 1})[1];
                    json.author = author.replace(/ /g, "");
                    console.log("author: ", json.author);
                } catch (e){
                    console.log("error while parsing author");
                    continue;
                }

                try {
                    let availabilityEle = $(books[i]).find('.tdAlignRight > b > a.DetailLink');
                    availability = $(availabilityEle).text();
                    // if (!availability.startsWith("0")) {
                        json.availability = availability;
                        console.log("availability: ", json.availability);
                        break;
                    // } else {
                    //     console.log("availability is zero");
                    // }
                } catch (e){
                    console.log("error while parsing availability");
                }

            }

            if (json.title && json.title.length > 0 && json.availability && json.availability.length > 0) {
                console.log("Final Json: ", JSON.stringify(json));
                result.push(json);
                callback(null, result )
            } else {
                callback("Error while parsing data.")
            }
        } else {
            callback("Error while looking up lawrence catalog.")
        }
    })

}

module.exports.findBook = findBook;