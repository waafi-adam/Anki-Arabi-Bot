const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const Reverso = require('reverso-api')
const reverso = new Reverso()

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
        const coveredSentence = coverWord(sentence, word);
        const markedSentence = await markWord(sentence, word);
        const translatedSentence = await translate(sentence, 'ar', 'en');
        const translatedWord = await translate(word, 'ar', 'en');
        let markedTranslatedSentence = translatedSentence;
        let synonyms = [translatedWord];
        await reverso.getSynonyms(translatedWord, 'english', (err, response) => {
            if (err) throw new Error(err.message);
            else {
                for (const item of response.synonyms){
                    synonyms.push(item.synonym);
                }
            }
        })
        let isFindingWord = true;
        while (isFindingWord){
            currWord = synonyms.pop();
            markedTranslatedSentence = await markWord(translatedSentence, currWord);
            if (translatedSentence != markedTranslatedSentence || synonyms.length == 0){
                isFindingWord = false
            }
        }
        let conjugation = [];
        resp = await reverso.getConjugation(word, 'arabic');
        for (const form of resp.verbForms){
            if (form.conjugation == 'Active Past')
                conjugation[0] = { type: `Active Past (ماضي)`, verb: form.verbs[3] };
            if (form.conjugation == 'Active Present')
                conjugation[1] = { type: `Active Present (مضارع)`, verb: form.verbs[3] };
            if (form.conjugation == 'Imperative')
                conjugation[2] = { type: `Imperative (أمر)`, verb: form.verbs[0] };
            if (form.conjugation == 'Verbal noun')
                conjugation[3] = { type: `Verbal noun (مصدر)`, verb: form.verbs[0] };
            if (form.conjugation == 'Participles Active')
                conjugation[4] = { type: `Participles Active (فاعل)`, verb: form.verbs[0] };
            if (form.conjugation == 'Participles Passive')
                conjugation[5] = { type: `Participles Passive (مفعول)`, verb: form.verbs[0] };
        }
        // Constructing the conjugation string
        let conjugationString = conjugation.reduce((acc, item) => {
            return acc + `${item.verb} | ${item.type}\n`;
        }, "").trim();

        let front = `${coveredSentence}<br><br>${markedTranslatedSentence}`;
        let back = `${markedSentence}<br><br>${conjugationString.replace(/\n/g, "<br>")}`;

        userData[chatId] = { ...userData[chatId], front, back, word };

        let message = `Here's how the card will look:\n\n` +
                      `<strong>Front:</strong>\n${coveredSentence}\n${markedTranslatedSentence}\n\n` +
                      `<strong>Back:</strong>\n${markedSentence}\n${conjugationString}\n\n` +
                      `Do you want to add this to Anki? (yes/no)`;

        bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
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

async function translate(text, fromLanguage, toLanguage) {
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
    return coveredSentence;
}
function markWord(sentence, word) {
    const markedSentence = sentence.replace(word, `<b>${word}</b>`);
    return markedSentence;
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
console.log("bot start");