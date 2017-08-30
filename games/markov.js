"use strict";

var storage = require("node-persist");

storage.initSync();

var data = storage.getItem("Markov") || {
};

var Markov = {};
module.exports = Markov;

Markov.run = function (args) {
	var message = args.message;
	var channel = args.channel;
	var userData = getUser(args.user);

	if ( channel.name.match(/roulette|blackjack/i) || message.text.match(/https?:\/\//i) ) {
		// Don't track peoples' messages in other game channels, or messages with full URLs
		return;
	}

	var markovCheck = message.text.match(/^markov (.*)/);
	var target;

	if ( markovCheck && data[markovCheck[1]] ) {
		target = markovCheck[1];
		return ['"' + generate(data[target], "\t") + '" -' + target];
	} else {
		seedMarkov(message.text, userData);
		storage.setItem("Markov", data);
	}
};

function generate(wordList, seed) {
	seed = seed || "\t";

	var currentWord = seed;

	if ( currentWord === "\t" ) {
		currentWord = getWord(wordList, "\t");
	}

	var newText = [];
	var i = 0;

	while ( currentWord !== "\n" && i < 1000 ) {
		i++;
		newText.push(currentWord);
		currentWord = getWord(wordList, currentWord);
	}

	var message = "";

	var word;
	var first = true;

	while ( word = newText.shift() ) {
		if ( word.match(/\w/) && !first ) {
			// Don't put spaces before punctuation or first word
			message += " ";
		}

		first = false;

		message += word;
	}

	return message;
}

function getWord(wordList, word) {
	var potentialNext = [];

	if ( !wordList || !word || !wordList[word] ) {
		return '';
	}

	Object.keys(wordList[word]).forEach(function (nextWord) {
		for ( var i = 0; i < wordList[word][nextWord]; i++ ) {
			potentialNext.push(nextWord);
		}
	});

	var index = Math.floor(Math.random() * potentialNext.length);

	var word = potentialNext[index];

	return potentialNext[index];
}

function getUser(user) {
	var userData = data[user.name] = data[user.name] || {};

	return userData;
}

function addWord(wordList, word, index, context) {
	var data = wordList[word] = wordList[word] || {};

	var nextWord = context[index + 1];

	if ( nextWord ) {
		data[nextWord] = data[nextWord] || 0;
		data[nextWord]++;
	}
}

function seedMarkov(text, userData) {
	var words = text
		.toLowerCase()
		.split(/(?=[.,\s])\s*/);

	// All whitespace is stripped, so use whitespace for control
	// tabs are start of message
	words.unshift("\t");
	// newlines are end of message
	words.push("\n");

	words.forEach(addWord.bind(null, userData));
}
