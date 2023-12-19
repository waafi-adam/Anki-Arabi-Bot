# Anki Arabi Bot

Anki Arabi Bot is a Telegram bot designed to assist users in learning Arabic by creating flashcards in Anki, a popular flashcard application, based on sentences provided by the user. It is particularly useful for Arabic language learners who wish to enhance their vocabulary and sentence comprehension through practice and repetition.

## Features

- **Arabic Sentence Input**: Users can send an Arabic sentence to the bot.
- **Word Selection for Hiding**: Users choose a specific word in the sentence to be hidden.
- **Translation**: The bot translates the Arabic sentence into English.
- **Card Creation Preview**: Users can see how the flashcard will look, with the selected word hidden.
- **Anki Integration**: The bot adds the generated flashcard (with front and back) to Anki using AnkiConnect, facilitating spaced repetition learning.

## How It Works

1. **Start the Bot**: Users initiate the conversation with the `/start` command.
2. **Send an Arabic Sentence**: The bot asks the user to send an Arabic sentence.
3. **Choose a Word to Hide**: After receiving the sentence, the bot prompts the user to specify which word in the sentence should be hidden.
4. **Translation and Card Preview**: The bot translates the sentence and shows a preview of the front and back of the flashcard.
5. **Confirmation for Adding to Anki**: If the user confirms, the bot adds the card to Anki.

## Technical Details

- **Node.js**: The bot is written in Node.js, utilizing the `node-telegram-bot-api` for Telegram interactions.
- **Translation API**: It uses the MyMemory Translation API for translating sentences from Arabic to English.
- **AnkiConnect**: The bot interacts with Anki through AnkiConnect, a plugin that allows external applications to communicate with Anki.

## Installation

1. **Clone the Repository**: Clone this repository to your local machine.
2. **Install Dependencies**: Run `npm install` to install the required Node.js packages.
3. **Set Up Anki and AnkiConnect**: Ensure Anki is installed and AnkiConnect is set up properly.
4. **Configure Telegram Token**: Place your Telegram bot token in the `TELEGRAM_TOKEN` variable.
5. **Start the Bot**: Run the bot using Node.js.

## Usage

After starting the bot and setting up Anki and AnkiConnect, users can interact with the bot through Telegram to create flashcards based on their learning needs.
