const TelegramBot = require('node-telegram-bot-api');
const translate = require('google-translate-api');
const axios = require('axios');

const TELEGRAM_TOKEN = '6368978582:AAFTRwvDxCMeZ4FRiqbx7ic80N50a7tkRGc';
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

const CHOOSE_WORD = 0;
const TRANSLATE_SEND = 1;
const CONFIRM_ADDITION = 2;
let userStates = {};
let userData = {};

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    userStates[chatId] = CHOOSE_WORD;
    userData[chatId] = {};
    bot.sendMessage(chatId, "Please send me the Arabic sentence.");
});

bot.on('message', (msg) => {
    if (msg.text && msg.text.startsWith('/')) return;

    const chatId = msg.chat.id;
    switch (userStates[chatId]) {
        case CHOOSE_WORD:
            handleChooseWord(chatId, msg.text);
            break;
        case TRANSLATE_SEND:
            handleTranslateSend(chatId, msg.text);
            break;
        case CONFIRM_ADDITION:
            handleConfirmAddition(chatId, msg.text);
            break;
    }
});

function handleChooseWord(chatId, sentence) {
    userStates[chatId] = TRANSLATE_SEND;
    userData[chatId] = { sentence };
    bot.sendMessage(chatId, `Received: ${sentence}\n\nPlease choose a word to hide.`);
}

async function handleTranslateSend(chatId, word) {
    userStates[chatId] = CONFIRM_ADDITION;
    let sentence = userData[chatId].sentence;

    try {
        let translatedSentence = await translateSentence(sentence, 'ar', 'en');
        const { coveredSentence, markedWord } = coverWord(sentence, word);
        const { coveredSentence: coveredTranslation, markedWord: markedTranslation } = coverWord(translatedSentence, word);

        let front = `${coveredSentence}<br><br>${coveredTranslation}`;
        let back = `${markedWord}<br><br>${markedTranslation}`;

        userData[chatId] = { ...userData[chatId], front, back, word };

        bot.sendMessage(chatId, `Here's how the card will look:\n\nFront:\n${coveredSentence}\n\nBack:\n${markedWord}\n\nDo you want to add this to Anki? (yes/no)`, { parse_mode: 'HTML' });
    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, "There was an error processing your request.");
    }
}

function handleConfirmAddition(chatId, userReply) {
    if (userReply.toLowerCase() === 'yes') {
        let { front, back } = userData[chatId];
        addToAnki(chatId, front, back);
    } else {
        bot.sendMessage(chatId, "Card not added. Send /start to try again.");
    }
    userStates[chatId] = null;
}

// async function translateSentence(text, srcLang, destLang) {
//     try {
//         let res = await translate(text, { from: srcLang, to: destLang });
//         return res.text;
//     } catch (error) {
//         console.error(error);
//         return "";
//     }
// }
async function translateSentence(text, fromLanguage, toLanguage) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLanguage}|${toLanguage}`;

    try {
        const response = await axios.get(url);
        return response.data.responseData.translatedText;
    } catch (error) {
        console.error("Translation error:", error);
        return "";
    }
}

function coverWord(sentence, word, placeholder = "_____") {
    const coveredSentence = sentence.replace(word, `<b>${placeholder}</b>`);
    const markedWord = sentence.replace(word, `<b>${word}</b>`);
    return { coveredSentence, markedWord };
}


async function addToAnki(chatId, front, back, deckName = "anki bot") {
    const data = {
        action: "addNote",
        version: 6,
        params: {
            note: {
                deckName: deckName,
                modelName: "Basic",
                fields: {
                    Front: front,
                    Back: back
                },
                options: {
                    allowDuplicate: false
                },
                tags: []
            }
        }
    };
    
    try {
        const response = await axios.post('http://127.0.0.1:8765', data);
        bot.sendMessage(chatId, response.data.error ? "Failed to add card to Anki." : "Card added to Anki!");
    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, "Failed to connect to Anki.");
    }
}


bot.on('polling_error', (error) => console.log(error));
console.log("hello");