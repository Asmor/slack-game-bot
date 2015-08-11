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

var slack;

RR.init = function (_slack) {
	slack = _slack;
}

RR.run = function (message) {
	var user = slack.getUserByID(message.user);
	var channel = slack.getChannelGroupOrDMByID(message.channel);
	var messages = [];
	// console.log(user);

	if ( !user || user.name === "gamemaster" || !channel || !channel.name === "russian-roulette" ) {
		return;
	}

	if ( !message.text.match(/russian.roulette/i) ) {
		return;
	}

	var userInfo = RR.getUser(user);

	var hit = Math.floor(Math.random() * 6) === 0;

	if ( hit ) {
		messages.push(":skull::gun: *BANG* " + user.name + " was shot!");

		if ( userInfo.misses ) {
			messages.push("They had survived " + userInfo.misses + " time(s).");
			userInfo.misses = 0;
		}

		if ( RR.misses ) {
			messages.push("There have been " + RR.misses + " misses since the last person was shot.");
			RR.misses = 0;
		}

		RR.stats.bangs++;
		userInfo.bangs++;
		messages.push("This is the " + conjugateNumber(userInfo.bangs) + " time " + user.name + " has been shot.");
	} else {
		messages.push(":relieved::gun: _click_ " + user.name + " is safe");

		userInfo.misses++;
		userInfo.clicks++;

		RR.misses++;

		RR.stats.clicks++;
	}

	channel.send(messages.join(" "));

	storage.setItem("RR", RR);
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
