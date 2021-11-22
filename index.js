const dc = require("discord.js");
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
	return 69420;
}

var int;
function startLoop(){
	try {
		clearInterval(int);
		int = setInterval(()=>{
			//console.log("Ayup");
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
	client.guilds.cache.get("879081086817288264").commands.set([
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
		}
	}
});
