"use strict";

var Slack = require("slack-client");
var config = require("./config");

var token = config.botToken;
console.log(token);

var slack = new Slack(token, true, true);

var RR = require ("./games/russian-roulette");
RR.init(slack);

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
	RR.run(message);
});

slack.login();
