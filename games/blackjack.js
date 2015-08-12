"use strict";

var ranks = "2,3,4,5,6,7,8,9,10,J,Q,K,A".split(",");
var cardValues = { 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, J: 10, Q: 10, K: 10, A: 11 };
var suits = "SHDC".split("");
var suitEmoji = { S: ":spades:", H: ":hearts:", D: ":diamonds:", C: ":clubs:" };

var storage = require("node-persist");

storage.initSync();

var data = storage.getItem("BJ") || {};
data.dealerHand = data.dealerHand || [];
data.deck = data.deck || generateFreshDeck();
data.playersIn = data.playersIn || 0;
data.state = data.state || "waiting";
data.users = {};

var BJ = {};
module.exports = BJ;

BJ.run = function (args) {
	var message = args.message;
	var channel = args.channel;

	if ( channel.name !== "blackjack" ) {
		console.log("Not in blackjack");
		return;
	}

	var userData = getUser(args.user);
	var messagesOut = [];

	args.userData = userData;
	args.messagesOut = messagesOut;

	stateMachine[data.state](args);

	storage.setItem("BJ", data);
	return messagesOut;
};

var stateMachine = {
	waiting: function (args) {
		if ( args.message.text.match(/\bante\b/i) ) {
			args.messagesOut.push(args.userData.name + " is in. Say `deal` to start, or `drop` to drop out.");
			args.userData.status = "in";
		} else if ( args.message.text.match(/\bdrop\b/i) ) {
			args.messagesOut.push(args.userData.name + " is out.");
			args.userData.status = "out";
		} else if ( args.message.text.match(/\bdeal\b/i) ) {
			deal(args);
		}
	},
	dealt: function (args) {
		args.messagesOut.push("Resetting");
		reset();
	},
	resolving: function (args) {},
};

function calculateHand(hand) {
	var result = {
		value: 0,
	};
	var cardNames = [];
	var aces = 0;

	hand.forEach(function (card) {
		cardNames.push(getCardText(card));
		result.value += cardValues[card.rank];
		if ( card.rank === "A" ) {
			aces++;
		}
	});

	while ( result.value > 21 && aces ) {
		result.value -= 10;
		aces--;
	}

	result.string = cardNames.join(", ");
	return result;
}

function deal(args) {
	data.playersIn = 0;

	Object.keys(data.users).forEach(function (key) {
		var userData = getUser(data.users[key]);

		if ( userData.status !== "in" ) {
			return;
		}

		var messages = [];

		while ( userData.hand.length < 2 ) {
			userData.hand.push(draw(args));
		}

		var handResult = calculateHand(userData.hand);

		messages.push(userData.name + " was dealt: " + handResult.string + " .");

		if ( handResult.value === 21 ) {
			messages.push("Blackjack! You win $15!");
			userData.score += 15;
			userData.blackjacks++;
			userData.wins++;
		} else {
			messages.push("Total: " + handResult.value + " .");
			data.playersIn++;
		}

		args.channel.send(messages.join(" "));
	});

	if ( !data.playersIn ) {
		args.messagesOut.push("No users in game, resetting");
		reset();
		return;
	}

	while ( data.dealerHand.length < 2 ) {
		data.dealerHand.push(draw(args));
	}

	args.messagesOut.push("Dealer is showing: " + getCardText(data.dealerHand[0]) + ".");
	args.messagesOut.push("Say `hit` or `stand` to continue.");

	data.state = "dealt";
}

function draw(args) {
	var card = data.deck.pop();

	if ( !card ) {
		data.deck = generateFreshDeck();
		args.channel.send("Shuffling a fresh deck...");
		return draw(args);
	}

	return card;
}

function drop(userData) {
	userData.hand.length = 0;
	userData.status = "out";
}

function dropAll() {
	Object.keys(data.users).forEach(function (key) {
		var userData = getUser(data.users[key]);
		drop(userData);
	});
	data.playersIn = 0;
}

function generateFreshDeck() {
	var deck = [null];
	ranks.forEach(function (rank) {
		suits.forEach(function (suit) {
			deck.push({ rank: rank, suit: suit });
		});
	});

	return shuffle(deck);
}

function getCardText(card) {
	return card.rank + suitEmoji[card.suit];
}

function getUser(user) {
	var userData = data.users[user.id] = data.users[user.id] || {};
	userData.wins = userData.wins || 0;
	userData.losses = userData.losses || 0;
	userData.busts = userData.busts || 0;
	userData.blackjacks = userData.blackjacks || 0;
	userData.score = userData.score || 0;
	userData.hand = userData.hand || [];
	userData.name = userData.name || user.name;
	userData.id = userData.id || user.id;
	userData.status = userData.status || "out";

	return userData;
}

function reset() {
	dropAll();
	data.state = "waiting";
	data.dealerHand.length = 0;
	data.playersIn = 0;
}

// Fisher-Yates via http://bost.ocks.org/mike/shuffle/
function shuffle(array) {
  var m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}
