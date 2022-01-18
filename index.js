const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const { token } = require('./auth/credentials.json');

client.on('error', (err) => {
  console.error(err);
});

client.on('ready', () => {
  console.log(`Successfully logged in as ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
  if(message.author.id === client.user.id) { return; }
  console.log(message);
  message.reply(message.content)
    .then((result) => console.log(result))
    .catch((err) => console.error(err));
});

client.login(token);