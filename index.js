const { Client, Intents } = require('discord.js');
const { token, client_id } = require('./auth/credentials.json');
const commands = require('./commands.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.on('error', (err) => {
  console.error(err);
});

client.on('ready', () => {
  console.log(`Successfully logged in as ${client.user.tag}`);
});

client.on('interactionCreate', (interaction) => {
  if(!interaction.isCommand()) { return; }
  const cmd_fn = commands[interaction.commandName];
  cmd_fn(interaction)
    .then((response) => {
      const resp_promise = response.ack ?
        interaction.followUp(response.msg) :
        interaction.reply(response.msg);
      console.log(response);
      resp_promise
        .catch((err) => console.error(err));
    }).catch((err) => {
      console.error(err);
    });
});

client.on('messageCreate', (message) => {
  if(message.author.id === client.user.id) { return; }
});

commands.register_commands(token, client_id)
  .then(() => client.login(token))
  .catch((err) => console.error(err));