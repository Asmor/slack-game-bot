"use strict";

var storage = require("node-persist");

storage.initSync();

var RR = storage.getItem("RR") || {
	misses: 0,
	users: {},
	stats: {
		clicks: 0,
		bangs: 0,
	},
};

RR.run = function (args) {
	var message = args.message;
	var user = args.user;
	var channel = args.channel;
	var messagesOut = [];

	if ( !user || user.name === "gamemaster" || !channel || channel.name !== "russian-roulette" ) {
		return;
	}

	if ( !message.text.match(/russian.roulette/i) ) {
		return;
	}


	var userInfo = RR.getUser(user);

	var hit = Math.floor(Math.random() * 6) === 0;

	if ( hit ) {
		messagesOut.push(":skull::gun: *BANG* " + user.name + " was shot!");

		if ( userInfo.misses ) {
			messagesOut.push("They had survived " + userInfo.misses + " time(s).");
			userInfo.misses = 0;
		}

		if ( RR.misses ) {
			messagesOut.push("There have been " + RR.misses + " misses since the last person was shot.");
			RR.misses = 0;
		}

		RR.stats.bangs++;
		userInfo.bangs++;
		messagesOut.push("This is the " + conjugateNumber(userInfo.bangs) + " time " + user.name + " has been shot.");
	} else {
		messagesOut.push(":relieved::gun: _click_ " + user.name + " is safe");

		userInfo.misses++;
		userInfo.clicks++;

		RR.misses++;

		RR.stats.clicks++;
	}

	storage.setItem("RR", RR);

	return messagesOut;
};

RR.getUser = function (user) {
	var id = user.id;

	RR.users[id] = RR.users[id] || {
		misses: 0,
		bangs: 0,
		clicks: 0,
	};

	return RR.users[id];
};

function conjugateNumber(n) {
	var end = n % 100;

	if ( end === 11 || end === 12 || end === 13 ) {
		return n + "th";
	}

	end = n % 10;

	if ( n === 1 ) {
		return n + "st";
	}

	if ( n === 2 ) {
		return n + "nd";
	}

	if ( n === 3 ) {
		return n + "rd";
	}

	return n + "th";
}

module.exports = RR;
