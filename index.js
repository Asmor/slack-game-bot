"use strict";

var Slack = require("slack-client");
var config = require("./config");

var token = config.botToken;
console.log(token);

var slack = new Slack(token, true, true);

var RR = require ("./games/russian-roulette");
var BJ = require ("./games/blackjack");
var Markov = require ("./games/markov");

slack.on("open", function (){
	console.log('Welcome to Slack. You are ' + slack.self.name + ' of ' + slack.team.name);
	// var channels = Object.keys(slack.channels).map(function (key) {
	// 	return slack.channels[key];
	// }).forEach(function(channel) {
	// 	console.log(channel.name);
	// });
	// console.log(channels);
});

slack.on("message", function(message) {
	var user = slack.getUserByID(message.user);
	var channel = slack.getChannelGroupOrDMByID(message.channel);
	var payload = {
		message: message,
		user: user,
		channel: channel,
	};

	if ( !user || !channel || user.name === "gamemaster") {
		return;
	}

	var messages = [];

	[
		RR.run(payload),
		BJ.run(payload),
		Markov.run(payload),
	].forEach(function (newMessages) {
		if ( newMessages && newMessages.length ) {
			messages = messages.concat(newMessages);
		}
	});
	
	if ( messages.length ) {
		channel.send(messages.join(" "));
	}
});

slack.login();
