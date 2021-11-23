const dc = require("discord.js");
const axios = require("axios").default;
const client = new dc.Client({intents: ["GUILDS"]});
const fs = require("fs");

client.login(JSON.parse(fs.readFileSync("token.json").toString())["token"]);

function readJson(path){
	return JSON.parse(fs.readFileSync(path).toString());
}

function writeJson(path, content){
	fs.writeFileSync(path, JSON.stringify(content));
}

function getUserCount(){
	var memCount = 0;
	client.guilds.cache.forEach(guild => {
		memCount += guild.memberCount;
	});
	return memCount;
}

var int;
function startLoop(){
	try {
		clearInterval(int);
		int = setInterval(()=>{
			client.user.setActivity("over " + getUserCount() + " people", {type: "WATCHING"});
		},5000);
	} catch(e){console.log(e)}
}

function stopLoop(){
	try { 
		clearInterval(int);
	} catch(e){}
}

client.on("ready", () => {
	startLoop();
	console.log("I'm alive");
	var obj = client.application.commands;
	if(process.argv[2]) obj = client.guilds.cache.get("879081086817288264").commands; 
	obj.set([
		{
			name: "ping",
			description: "Am alive???"
		},
		{
			name: "activity",
			description: "Sets funny activity",
			options: [
				{
					name: "type",
					description: "The type, for example playing or watching or listening or streaming or competing.",
					type: 3,
					required: true
				},
				{
					name: "activity",
					description: "What you want it to say",
					type: 3,
					required: false
				}
			]
		},
		{
			name: "eval",
			description: "Evaluation of JS",
			options: [
				{
					name: "code",
					description: "Code to exec",
					type: 3
				}
			]
		},
		{
			name: "kick",
			description: "Kick members.",
			options: [
				{
					name: "user",
					description: "User to kick",
					type: 6,
					required: true
				},
				{
					name: "reason",
					description: "Reason to kick them",
					type: 3,
					required: false
				}
			]
		},
		{
			name: "bonk",
			description: "Bonks someone",
			options: [
				{
					name: "user",
					description: "Whomst to bonk",
					type: 6,
					required: true
				}
			]
		},
		{
			name: "cat",
			description: "Meow"
		},
		{
			name: "apis",
			description: "Shows all APIs"
		}
	]).then(cmds => {
		console.log("Finished loading all commands");
	});
});

client.on("interactionCreate", (int) => {
	if(int.isCommand()){
		if(int.commandName == "ping"){
			int.reply(`Yup, I'm alive (${client.ws.ping} ms)`);
		} else if(int.commandName == "activity"){
			var devs = readJson("devs.json");
			if(!devs.devlist.includes(int.user.id)) return int.reply("You shall not pass");
			if(int.options.getString("activity") !== null){
				stopLoop();
				client.user.setActivity(int.options.getString("activity"), {type: int.options.getString("type")});
				int.reply("Stopped activity loop, and switched to custom set status.");
			} else {
				startLoop();
				int.reply("Resat activity, and started activity loop.");
			}
		} else if(int.commandName == "eval"){
			var devs = readJson("devs.json");
			if(!devs.devlist.includes(int.user.id)) return int.reply("You shall not pass");
			try{
				int.reply(new String(eval(int.options.getString("code"))).valueOf()).catch(e => {});
			} catch(e){
				int.reply(e.stack).catch(e => {});
			};
		} else if(int.commandName == "kick"){
			if(!int.guild) return int.reply("This command cannot be used outside a guild.");
			var mem = int.guild.members.cache.get(int.user.id);
			if(!mem.permissions.has("KICK_MEMBERS")) return int.reply("You tried kicking without perms? You're sus");
			var mem2 = int.guild.members.cache.get(int.options.getUser("user").id);
			mem2.kick(int.options.getString("reason"));
		} else if(int.commandName == "bonk"){
			int.reply(`*${int.user.username} bonked ${int.options.getUser("user").username}* <a:getbonked:912473583488499743>`);
		} else if(int.commandName == "cat"){
			axios("https://api.thecatapi.com/v1/images/search").then((res) => {
				int.reply({embeds: [{title: "Meow", image: {url: res.data[0].url}, color: "#ec76fd"}]});
			});
		} else if(int.commandName == "apis"){
			var apis = {
				"Cat API": "https://api.thecatapi.com/v1/images/search"
			};
			var apiArray = [];
			Object.keys(apis).forEach(key => {
				apiArray.push(key + ": " + apis[key]);
			});
			int.reply("Here are all the APIs used in the bot: \n" + apiArray.join("\n"));
		}
	}
});
