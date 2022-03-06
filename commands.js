const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Halo = require('./modules/halo.js');
const { Interaction } = require('discord.js');

const halo = new Halo();

module.exports = {
    sips: 0,

    async register_commands(token, client_id, version = '9') {
        const commands = [
            new SlashCommandBuilder().setName('ping').setDescription('Ping Fletbot'),
            /*new SlashCommandBuilder().setName('rank')
                .setDescription("Get a player's rank")
                .addStringOption(opt => {
                    return opt.setName('gamertag')
                        .setDescription("XBL name to search for")
                        .setRequired(true)
            }),*/
            new SlashCommandBuilder().setName('sip').setDescription('Increment sip counter'),
            new SlashCommandBuilder().setName('setsips')
                .setDescription('Set sip counter to a specified number')
                .addIntegerOption(opt => {
                    return opt.setName('sipcount')
                        .setDescription('Number to set sip count to')
                        .setRequired(true)
            }),
            new SlashCommandBuilder().setName('getsips').setDescription('Get current sip count')
        ];
        const rest = new REST({ version }).setToken(token);
        await rest.put(Routes.applicationCommands(client_id), { body: commands });
    },

    /**
     * Ping bot
     * Does not send ack message
     * @returns {Object} pong
     */
    async ping() {
        return {
            msg: "Bleep bloop",
            ack: false
        };
    },

    /**
     * Retrieve rank info for a given user
     * Sends ack message
     * @param {Interaction} interaction
     * @returns {Object} Rank info separated by queues, current/highest
     */
    async rank(interaction) {
        const gamertag = interaction.options.getString('gamertag', true);
        const req = halo.get_rank(gamertag);
        await interaction.reply(`Retrieving ranked stats for \`${gamertag}\``);
        
        try {
            const rank = await req;
            let msg = `${"```"}\nGamertag: ${rank.name}\n`;
            for(const r of Object.entries(rank)) {
                if(r[0] === 'name') { continue };
                msg += `\n${r[0]} - Current: ${r[1].current.title} (${r[1].current.csr} CSR) | Highest: ${r[1].highest.title} (${r[1].highest.csr} CSR)\n`;
            }
            msg += "```";

            return {
                msg,
                ack: true
            };
        } catch(e) {
            return {
                msg: e.message,
                ack: true
            };
        }
    },

    /**
     * Increment sip counter
     * @returns {Object} String containing sip count
     */
    async sip() {
        module.exports.sips++;
        return {
            msg: `${sip_grammar(module.exports.sips)}... So far`,
            ack: false
        };
    },

    /**
     * Set sip count to specified number
     * @param {Interaction} interaction 
     * @returns {Object} Message containing new sip count
     */
    async setsips(interaction) {
        const sips = interaction.options.getInteger('sipcount', true);
        module.exports.sips = sips;
        return {
            msg: `Sip count set to ${sip_grammar(module.exports.sips)}`,
            ack: false
        };
    },

    /**
     * Retrieve current sip count
     * @returns {Object}
     */
    async getsips() {
        return {
            msg: `Current sip count: ${sip_grammar(module.exports.sips)}`,
            ack: false
        };
    }
}

/**
 * 
 * @param {Number} sip_count
 * @returns {String}
 */
function sip_grammar(sip_count) {
    return sip_count === 1 ? `1 sip` : `${sip_count} sips`;
}