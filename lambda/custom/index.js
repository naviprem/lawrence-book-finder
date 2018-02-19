


// "use strict";
const Alexa = require("alexa-sdk");
const finder = require("./book-finder");

//open lawrence book finder

// const APP_ID = undefined;

const data=[
    {
        "title": "Harry Potter and the Sorcerers Stone",
        "author": "J.K.Rowling",
        "keyword": "wizards"

    },
    {
        "title": "Dolphins at Daybreak",
        "author": "Mary Pope Osborn",
        "keyword": "Magic Tree House"

    },
    {
        "title": "Rise of the Evening Star",
        "author": "Brandon Mull",
        "keyword": "Mythical Creatures"

    },
    {
        "title": "Pick Me Up",
        "author": "Adam J. Kurts",
        "keyword": "Facts"

    }
];

const skillName = "Book Finder";

const WELCOME_MESSAGE = "Welcome to " + skillName + ". You can ask me if a book is available in the Lawrence Library. For example, " + getGenericHelpMessage(data);

const HELP_MESSAGE = "I can help you see if a book is available in Lawrence Library. ";

const NEW_SEARCH_MESSAGE = getGenericHelpMessage(data);

const SEARCH_STATE_HELP_MESSAGE = getGenericHelpMessage(data);

const SHUTDOWN_MESSAGE = "Ok. Good Bye!";

const EXIT_SKILL_MESSAGE = "Ok. Good Bye!";

const states = {
    SEARCHMODE: "_SEARCHMODE",
};

const newSessionHandlers = {
    "LaunchRequest": function() {
        this.handler.state = states.SEARCHMODE;
        this.response.speak(WELCOME_MESSAGE).listen(getGenericHelpMessage(data));
        this.emit(':responseReady');
    },
    "SearchByNameIntent": function() {
        console.log("SEARCH INTENT");
        this.handler.state = states.SEARCHMODE;
        this.emitWithState("SearchByNameIntent");
    },
    "TellMeMoreIntent": function() {
        this.handler.state = states.SEARCHMODE;
        this.response.speak(WELCOME_MESSAGE).listen(getGenericHelpMessage(data));
        this.emit(':responseReady');
    },
    "TellMeThisIntent": function() {
        this.handler.state = states.SEARCHMODE;
        this.emitWithState("SearchByNameIntent");
    },
    "SearchByKeywordIntent": function() {
        this.handler.state = states.SEARCHMODE;
        this.emitWithState("SearchByKeywordIntent");
    },
    "AMAZON.YesIntent": function() {
        this.response.speak(getGenericHelpMessage(data)).listen(getGenericHelpMessage(data));
        this.emit(':responseReady');
    },
    "AMAZON.NoIntent": function() {
        this.response.speak(SHUTDOWN_MESSAGE);
        this.emit(':responseReady');
    },
    "AMAZON.StopIntent": function() {
        this.response.speak(EXIT_SKILL_MESSAGE);
        this.emit(':responseReady');
    },
    "AMAZON.CancelIntent": function() {
        this.response.speak(EXIT_SKILL_MESSAGE);
        this.emit(':responseReady');
    },
    "AMAZON.StartOverIntent": function() {
        this.handler.state = states.SEARCHMODE;
        let output = "Ok, starting over." + getGenericHelpMessage(data);
        this.response.speak(output).listen(output);
        this.emit(':responseReady');
    },
    "AMAZON.HelpIntent": function() {
        this.response.speak(HELP_MESSAGE + getGenericHelpMessage(data)).listen(getGenericHelpMessage(data));
        this.emit(':responseReady');
    },
    "SessionEndedRequest": function() {
        this.emit("AMAZON.StopIntent");
    },
    "Unhandled": function() {
        this.handler.state = states.SEARCHMODE;
        this.emitWithState("SearchByNameIntent");
    }
};
let startSearchHandlers = Alexa.CreateStateHandler(states.SEARCHMODE, {
    "AMAZON.YesIntent": function() {
        this.response.speak(NEW_SEARCH_MESSAGE).listen(NEW_SEARCH_MESSAGE);
        this.emit(':responseReady');
    },
    "AMAZON.NoIntent": function() {
        this.response.speak(SHUTDOWN_MESSAGE);
        this.emit(':responseReady');
    },
    "SearchByKeywordIntent": function() {
        SearchByKeywordIntentHandler.call(this);
    },
    "AMAZON.HelpIntent": function() {
        this.response.speak(getGenericHelpMessage(data)).listen(getGenericHelpMessage(data));
        this.emit(':responseReady');
    },
    "AMAZON.StopIntent": function() {
        this.response.speak(EXIT_SKILL_MESSAGE);
        this.emit(':responseReady');
    },
    "AMAZON.CancelIntent": function() {
        this.response.speak(EXIT_SKILL_MESSAGE);
        this.emit(':responseReady');
    },
    "AMAZON.StartOverIntent": function() {
        this.handler.state = states.SEARCHMODE;
        let output = "Ok, starting over." + getGenericHelpMessage(data);
        this.response.speak(output).listen(output);
        this.emit(':responseReady');
    },
    "SessionEndedRequest": function() {
        this.emit("AMAZON.StopIntent");
    },
    "Unhandled": function() {
        console.log("Unhandled intent in startSearchHandlers");
        this.response.speak(SEARCH_STATE_HELP_MESSAGE).listen(SEARCH_STATE_HELP_MESSAGE);
        this.emit(':responseReady');
    }
});

function searchDatabase(dataset, context, searchQuery, searchType, callback) {
    finder.findBook(sanitizeSearchQuery(searchQuery), (error, searchResults) => {
        if (!error) {
            callback(null, searchQuery, {
                count: searchResults.length,
                results: searchResults
            });
        }
        else {
            console.log("no match was found using " + searchType);
            callback(error);
        }
    });
}

function SearchByKeywordIntentHandler(){
    let slots = this.event.request.intent.slots;
    let validKeyword = isSlotValid(this.event.request, "keyword");

    if (validKeyword){
        let searchBy = "keyword";
        console.log("searchBy is set to = " + searchBy);
        let searchQuery = slots[searchBy].value;
        searchDatabase(data, this, searchQuery, searchBy, (error, searchQuery, searchResults) => {

            let output;
            // this.attributes.lastSearch.lastIntent = "SearchByKeywordIntent";
            if (!error) {
                console.log("alteast one match was found");
                output = generateSearchResultsMessage(searchQuery,searchResults.results);
                // this.attributes.lastSearch.lastSpeech = output;
                this.response.speak(output).listen(output);
                this.emit(':responseReady');
            } else {
                console.log("no match found");
                output = generateSearchResultsMessage(searchQuery, []);
                // this.attributes.lastSearch.lastSpeech = output;
                this.response.speak(output).listen(output);
                this.emit(':responseReady');
            }
        });
    }
    else {
        console.log("no searchable slot was provided");
        console.log("searchQuery was  = " + null);
        console.log("searchResults.results was  = " + null);
        this.response.speak(generateSearchResultsMessage(null,false)).listen(generateSearchResultsMessage(null,false));
        this.emit(':responseReady');
    }
}

function generateNextPromptMessage(){
    let prompt;
        prompt = " Do you want to find another book? ";// + getGenericHelpMessage(data);
    return prompt;
}

function generateSearchResultsMessage(searchQuery,results){
    let sentence;
    let details;
    let prompt;

    if (results){
        let book;
        switch (true) {
            case (results.length === 0):
                sentence = "Hmm. I couldn't find a match. Do you want to search for another book?";
                break;
            case (results.length >= 1):
                sentence = "I found a book for you! ";
                book = results[0];
                if(book.author) {
                    details = book.title + ": written by " + book.author + " - " + book.availability + " at Lawrence Elementary School Library right now.";
                } else {
                    details = book.title + " - " + book.availability + " at Lawrence Elementary School Library right now.";
                }
                prompt = generateNextPromptMessage(book,"current");
                sentence += details + prompt;
                console.log(sentence);
                break;
        }
    } else {
        sentence = "Sorry, I didn't quite get that. " + getGenericHelpMessage(data);
    }
    return sentence;
}

function getGenericHelpMessage(data){
    let sentences = [
        "say - Find me the book " + getRandomTitle(data),
        "say - I want to read about " + getRandomKeyword(data),
        "say - I want to read a book by the author " + getRandomAuthor(data)
    ];
    return "You can " + sentences[getRandom(0,sentences.length-1)];
}

exports.handler = function(event, context, callback) {
    let alexa = Alexa.handler(event, context);
    // alexa.appId = APP_ID;
    alexa.registerHandlers(newSessionHandlers, startSearchHandlers);
    alexa.execute();
};

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomTitle(arrayOfStrings) {
    return arrayOfStrings[getRandom(0, data.length - 1)].title;
}

function getRandomAuthor(arrayOfStrings) {
    return arrayOfStrings[getRandom(0, data.length - 1)].author;
}

function getRandomKeyword(arrayOfStrings) {
    return arrayOfStrings[getRandom(0, data.length - 1)].keyword;
}

function sanitizeSearchQuery(searchQuery){
    searchQuery = searchQuery.replace(/’s/g, "").toLowerCase();
    searchQuery = searchQuery.replace(/'s/g, "").toLowerCase();
    return searchQuery;
}

function isSlotValid(request, slotName){
    let slot = request.intent.slots[slotName];
    let slotValue;
    if (slot && slot.value) {
        slotValue = slot.value.toLowerCase();
        return slotValue;
    } else {
        return false;
    }
}
