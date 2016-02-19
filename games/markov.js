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

	if ( channel.name.match(/roulette|blackjack/i) || message.text.match(/http:\/\//i) ) {
		// Don't track peoples' messages in other game channels, or messages with full URLs
		return;
	}

	var markovCheck = message.text.match(/^markov (.*)/);

	if ( markovCheck && data[markovCheck[1]] ) {
		// TODO: Need brackets?
		return ['"' + generate(userData, "\t") + '" -' + args.user.name];
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

	return newText.join(" ");
}

function getWord(wordList, word) {
	var potentialNext = [];

	Object.keys(wordList[word]).forEach(function (nextWord) {
		for ( var i = 0; i < wordList[word][nextWord]; i++ ) {
			potentialNext.push(nextWord);
		}
	});

	var index = Math.floor(Math.random() * potentialNext.length);

	return potentialNext[index];
}

function getUser(user) {
	var userData = data.users[user.name] = data.users[user.name] || {};

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
	var words = text.toLowerCase().split(/\s*\b\s*/);

	// All whitespace is stripped, so use whitespace for control
	// tabs are start of message
	words.unshift("\t");
	// newlines are end of message
	words.push("\n");

	words.forEach(addWord.bind(null, userData));
}
