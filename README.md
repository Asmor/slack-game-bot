# slack-game-bot
Game bot for Slack

# Installation

Check out and run

`npm install`

After that, copy `config.sample.js` to `config.js`, and insert your bot's API token in the appropriate spot in that file.

# Usage

`npm start`

This will start the bot.

# Games

The bot currently supports two games; Russian Roulette and Blackjack.

## Russian Roulette

Russian Roulette must be played in a channel (or private group) named `russian-roulette`. To play, just say `roulette`. Or, if you're feeling whimsical, `cat roulette`. Say `chat roulette` only at your own peril.

## Blackjack

Russian Roulette must be played in a channel (or private group) named `blackjack`. To begin play, say `ante`. Once all players have anted, any player can start the game by saying `deal`. From there, each player can `hit` or `stand`. The game will automatically continue once all players have stood or busted out. If you need to force the game to continue, any player who has stood can say `continue`.

Each game of Blackjack is played for $10, and a running score is kept. If you get blackjack, you'll win $15 instead of $10.
