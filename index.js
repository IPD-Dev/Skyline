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
			client.user.setActivity(getUserCount() + " people", {type: "STREAMING", name: "funny", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"});
		},5000);
	} catch(e){console.log(e)}
}

function stopLoop(){
	try { 
		clearInterval(int);
	} catch(e){}
}

var Eco = client.users.cache.random();
client.users.fetch("831598877320413244").then(usr => {
	Eco = usr;
});

var Helixu = client.users.cache.random();
client.users.fetch("287885666941927424").then(usr => {
	Helixu = usr;
});

client.on("ready", () => {
	startLoop();
	console.log("I'm alive");
	var obj = client.application.commands;
	if(process.argv[2]) obj = client.guilds.cache.get(process.argv[2]).commands; 
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
			name: "ban",
			description: "Ban members.",
			options: [
				{
					name: "user",
					description: "User to ban",
					type: 6,
					required: true
				},
				{
					name: "reason",
					description: "Reason to ban them",
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
			name: "unbonk",
			description: "bonk'nt someone",
			options: [
				{
					name: "user",
					description: "Whomst to unbonk",
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
			name: "fox",
			description: "What does it say?"
		},
		{
			name: "apis",
			description: "Shows all APIs"
		},
		{
			name: "invite",
			description: "Provides an invite link for the bot"
		},
		{
			name: "unban",
			description: "Unbans a banned member.",
			options: [
				{
					name: "user",
					description: "User to unban, can be username, tag or id.",
					type: 3,
					required: true
				}
			]
		},
		{
			name: "restart",
			description: "Restarts the bot."
		}
	]).then(cmds => {
		console.log("Finished loading all commands");
	});
});

function getType(userMention){
	var type = "";
	if(userMention.toString().includes("#")){
	  // Suspect that the user mention is a tag
	  if(userMention.match(/#/g).length > 1) return type = "Invalid";
	  var parts = userMention.split("#");
	  var username = parts[0];
	  var discriminator = parts[1];
	  var numFree = discriminator.toString().replace(/[0-9]/g, "");
	  if(numFree !== "") return type = "Invalid";
	  if(discriminator.toString().length > 4 || discriminator.toString().length < 4) return type = "Invalid";
	  type = "Tag";
	} else if(userMention.toString().replace(/[0-9]/g, "") == ""){
	  var date = new Date(parseInt(userMention)/4194304+1420070400000);
	  if(date == "Invalid Date") return type = "Invalid";
	  type = "ID";
	} else if(typeof(userMention) == "string"){
	  type = "Username";
	} else{
	  type = "Invalid";
	}
	return type;
}

client.on("interactionCreate", (int) => {
	if(int.isCommand()){
		if(int.commandName == "ping"){
			int.reply(`Yup, I'm alive (${client.ws.ping} ms)`);
		} else if(int.commandName == "activity"){
			var devs = readJson("worthy.json");
			if(!devs.devlist.includes(int.user.id)) return int.reply(":x: Access denied");
			if(int.options.getString("activity") !== null){
				stopLoop();
				client.user.setActivity(int.options.getString("activity"), {type: int.options.getString("type")});
				int.reply("Stopped activity loop, and switched to custom set status.");
			} else {
				startLoop();
				int.reply("Resat activity, and started activity loop.");
			}
		} else if(int.commandName == "eval"){
			var devs = readJson("worthy.json");
			if(!devs.devlist.includes(int.user.id)) return int.reply(":x: Access denied");
			try{
				int.reply(new String(eval(int.options.getString("code"))).valueOf()).catch(e => {});
			} catch(e){
				int.reply(e.stack).catch(e => {});
			};
		} else if(int.commandName == "kick"){
			if(!int.guild) return int.reply(":x: This command cannot be used outside a guild.");
			var mem = int.guild.members.cache.get(int.user.id);
			if(!mem.permissions.has("KICK_MEMBERS")) return int.reply(":x: You do not have permissions to kick users.");
			var mem2 = int.guild.members.cache.get(int.options.getUser("user").id);
			if(mem == mem2) return int.reply(":x: You cannot kick yourself!");
			mem2.kick(int.options.getString("reason")).then(() => {
				var reason = "No reason specified.";
				if(int.options.getString("reason") !== null) reason = int.options.getString("reason");
				int.reply("Successfully kicked <@!" + int.options.getUser("user").id + "> with reason `" + reason + "`.");
			}).catch(e => {
				//int.reply("An error occured with my code, please report this to " + Eco.tag + " or " + Helixu.tag + ": ```js\n" + e.stack + "```");
				int.reply(":x: I cannot kick this user!");
			});
		} else if(int.commandName == "ban"){
			if(!int.guild) return int.reply(":x: This command cannot be used outside a guild.");
			var mem = int.guild.members.cache.get(int.user.id);
			if(!mem.permissions.has("BAN_MEMBERS")) return int.reply(":x: You do not have the permissions to ban users.");
			var mem2 = int.guild.members.cache.get(int.options.getUser("user").id);
			var reason = "No reason specified.";
			if(mem == mem2) return int.reply(":x: You cannot ban yourself!");
			if(int.options.getString("reason") !== null) reason = int.options.getString("reason");
			mem2.ban({reason}).then(() => {
				int.reply("Successfully banned <@!" + int.options.getUser("user").id + "> with reason `" + reason + "`.");
			}).catch(e => {
				//int.reply("An error occured with my code, please report this to " + Eco.tag + " or " + Helixu.tag + ": ```js\n" + e.stack + "```");
				int.reply(":x: I cannot ban this user!");
			});
		} else if(int.commandName == "bonk"){
			int.reply(`*${int.user.username} bonked ${int.options.getUser("user").username}* <a:getbonked:912473583488499743>`);
		} else if(int.commandName == "unbonk"){
			int.reply(`*${int.user.username} unbonked ${int.options.getUser("user").username}*`);
		} else if(int.commandName == "cat"){
			const row = new dc.MessageActionRow();
			const btn = new dc.MessageButton();
			btn.setCustomId("cat-" + Math.round(Math.random()*99999));
			btn.setLabel("New Image");
			btn.setStyle("PRIMARY");
			row.addComponents(btn);
			axios("https://api.thecatapi.com/v1/images/search").then((res) => {
				int.reply({embeds: [{title: "Meow", image: {url: res.data[0].url}, color: "#ec76fd"}], components: [row]});
			});
		} else if(int.commandName == "fox"){
			const row = new dc.MessageActionRow();
			const btn = new dc.MessageButton();
			btn.setCustomId("fox-" + Math.round(Math.random()*99999));
			btn.setLabel("New Image");
			btn.setStyle("PRIMARY");
			row.addComponents(btn);
			axios("https://randomfox.ca/floof/").then(res => {
				int.reply({embeds: [{title: "uwu", image: {url: res.data.image}, color: "#ffa500"}], components: [row]});
			});
		} else if(int.commandName == "apis"){
			var apis = {
				"Cat API": "https://api.thecatapi.com/v1/images/search",
				"Fox API": "https://randomfox.ca/floof/"
			};
			var apiArray = [];
			Object.keys(apis).forEach(key => {
				apiArray.push(key + ": " + apis[key]);
			});
			int.reply("Here are all the APIs used in the bot: \n" + apiArray.join("\n"));
		} else if(int.commandName == "invite"){
			var invite = "https://discord.com/api/oauth2/authorize?client_id=679066447942516760&permissions=397434776774&scope=bot%20applications.commands";
			int.reply("To invite me to your own server, click [here](" + invite + ").");
		} else if(int.commandName == "unban"){
			if(!int.guild) return int.reply(":x: This command cannot be used outside a guild.");
			if(!int.member.permissions.has(dc.Permissions.FLAGS.BAN_MEMBERS)) return int.reply(":x: You don't have the required permissions to use this command.");
			if(!int.guild.members.cache.get(client.user.id).permissions.has(dc.Permissions.FLAGS.BAN_MEMBERS)) return int.reply(":x: I don't have the permissions to unban members.");
			var userString = int.options.getString("user");
			var type = getType(userString);
			if(type == "Invalid") return int.reply(":x: The user specified is invalid.");
			var banObj = null;
			int.guild.bans.fetch().then(bans => {
				bans.forEach(ban => {
					if(type == "Tag" && ban.user.tag == userString) banObj = ban;
					if(type == "ID" && ban.user.id.toString() == userString) banObj = ban;
					if(type == "Username" && ban.user.username == userString) banObj = ban;
				});
				if(!banObj) return int.reply(":x: The user was not found, maybe someone already unbanned them?");
				int.guild.members.unban(banObj.user.id).then(user => {
					int.reply(`Successfully unbanned **${user.tag}**.`);
				}).catch(e => {
					console.log(e);
					int.reply("An unexpected error has occured: ```js\n" + e.stack + "```");
				});
			});
		} else if(int.commandName == "restart"){
			var devs = readJson("worthy.json");
			if(!devs.devlist.includes(int.user.id)) return int.reply(":x: Access denied");
			int.reply("Restarting...").then(msg => {
				process.exit(69420);
			});
		}
	} else if(int.isButton()){
		if(int.customId.startsWith("cat")){
			int.update(int);
			const row = new dc.MessageActionRow();
			const btn = new dc.MessageButton();
			btn.setCustomId("cat-" + Math.round(Math.random()*99999));
			btn.setLabel("New Image");
			btn.setStyle("PRIMARY");
			row.addComponents(btn);
			axios("https://api.thecatapi.com/v1/images/search").then((res) => {
				int.message.edit({embeds: [{title: "Meow", image: {url: res.data[0].url}, color: "#ec76fd"}], components: [row]});
			});
		} else if(int.customId.startsWith("fox")){
			int.update(int);
			const row = new dc.MessageActionRow();
			const btn = new dc.MessageButton();
			btn.setCustomId("fox-" + Math.round(Math.random()*99999));
			btn.setLabel("New Image");
			btn.setStyle("PRIMARY");
			row.addComponents(btn);
			axios("https://randomfox.ca/floof/").then(res => {
				int.message.edit({embeds: [{title: "uwu", image: {url: res.data.image}, color: "#ffa500"}], components: [row]});
			});
		}
	}
});


process.on("exit", (code) => {
	console.log("Exiting with code", code);
	client.destroy();
});
