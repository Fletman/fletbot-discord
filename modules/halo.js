const autocode_lib = require('lib');
const { autocode_dev, autocode_prod } = require('../auth/credentials.json');

module.exports = class HaloHandler {
    constructor(env = 'dev', lib_ver = '@0.3.7') {
        const env_tokens = {
            dev: autocode_dev,
            prod: autocode_prod
        };
        const token = env_tokens[env];
        this.halo_lib = autocode_lib({ token }).halo.infinite[lib_ver];
    }

    /**
     * 
     * @param {string} gamertag Gamertag to fetch stats for
     * @returns {Object} object containing current and highest ranks for each queue
     */
    async get_rank(gamertag) {
        const result = await this.halo_lib.stats.csrs({ gamertag });
        const gt = result.additional.gamertag;
        const ranks = { name: gt };
        for(const data of result.data) {
            const rank = data.response;
            ranks[`${data.queue}-${data.input}`] = {
                current: this._parse_rank(rank.current),
                highest: this._parse_rank(rank.all_time)
            }            
        }
        return ranks;
    }

    _parse_rank(rank) {
        return {
            csr: rank.value,
            title: rank.tier === 'Onyx' ?
                `Onyx ${rank.value}` :
                `${rank.tier} ${Math.max(1, rank.sub_tier)}`
        }
    }
};