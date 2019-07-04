const pokedex = require('../DB/pokedex').BattlePokedex;
const dexEntries = require('../DB/flavorText.json');
const config = require('../config/config.json');
const fail = config.fail_emoji;
const Discord = require('discord.js');

function execute(msg) {
    var args = msg.content.substr(msg.prefix.length+4).toLowerCase();
    if (!args) {

        if (args.includes('-')) {
            args = args.split('-');
        } else {
            args = args.split(' ');
        }
    
        if (args[0] === "mega") {
            pokemonQuery = args[1] + "mega";
        } else if (args[0] === "alolan") {
            pokemonQuery = args[1] + "alola";
        } else if (args.length === 1){
            pokemonQuery = args[0];
        } else {
            pokemonQuery = args[0] + args[1];
        }
    
        var pokemonEntry = pokedex[pokemonQuery];
    
        if (pokemonEntry) {
            var embedColours = {
                Red: 16724530,
                Blue: 2456831,
                Yellow: 16773977,
                Green: 4128590,
                Black: 3289650,
                Brown: 10702874,
                Purple: 10894824,
                Gray: 9868950,
                White: 14803425,
                Pink: 16737701
            };
    
            var species = pokemonEntry.species;
            var evoLine = `**${capitalizeFirstLetter(species)}**`;
            var preEvos = "";
            console.log(pokemonEntry.prevo);
            if (pokemonEntry.prevo) {
                preEvos = preEvos + capitalizeFirstLetter(pokemonEntry.prevo) + " > ";
                var preEntry = pokedex[pokemonEntry.prevo];
                if (preEntry.prevo) {
                    preEvos = capitalizeFirstLetter(preEntry.prevo) + " > " + preEvos;
                }
                evoLine = preEvos + evoLine;
                console.log(preEvos);
            }
    
            var evos = "";
            if (pokemonEntry.evos) {
                evos = evos + " > " + pokemonEntry.evos.map(entry => capitalizeFirstLetter(entry)).join(", ");
                if (pokemonEntry.evos.length < 2) {
                    var evoEntry = pokedex[pokemonEntry.evos[0]];
                    if (evoEntry.evos) {
                        evos = evos + " > " + evoEntry.evos.map(entry => capitalizeFirstLetter(entry)).join(", ");
                    }
                }
                evoLine = evoLine + evos;
            }
    
            if (!pokemonEntry.prevo && !pokemonEntry.evos) {
                evoLine = evoLine + " (No Evolutions)";
            }
    
            var abilityString = pokemonEntry.abilities[0];
            for (var i = 1; i < Object.keys(pokemonEntry.abilities).length; i++) {
                if (Object.keys(pokemonEntry.abilities)[i] == 'H') {
                    abilityString = abilityString + ", *" + pokemonEntry.abilities.H + "*";
                } else {
                    abilityString = abilityString + ", " + pokemonEntry.abilities[i];
                }
            }
    
            var imgPokemon = species.toLowerCase();
            var imgURL = 'https://play.pokemonshowdown.com/sprites/xyani/' + imgPokemon.replace(" ", "") + ".gif";
            var pokedexEntry = dexEntries[pokemonEntry.num] ? dexEntries[pokemonEntry.num].filter((c) => { return c.langID == 9; })[0].flavourText : 'No data found.';
            let totalStats = 0;
            for (let i in pokemonEntry.baseStats) {
                totalStats += pokemonEntry.baseStats[i];
            }
    
            console.log(embedColours[pokemonEntry.color]);
    
            var embed = new Discord.RichEmbed({
                color: embedColours[pokemonEntry.color],
                fields: [
                    {
                        name: "Types",
                        value: pokemonEntry.types.join(", "),
                        inline: true
                    },
                    {
                        name: "Abilities",
                        value: abilityString,
                        inline: true
                    },
                    {
                        name: "Evolution Line",
                        value: evoLine,
                        inline: false
                    },
                    {
                        name: "Base Stats",
                        value: Object.keys(pokemonEntry.baseStats).map(i => i.toUpperCase() + ": **" + pokemonEntry.baseStats[i] + "**").join(", ") + `, TOTAL: **${totalStats}**`
                    },
                    {
                        name: "Height",
                        value: pokemonEntry.heightm + "m",
                        inline: true
                    },
                    {
                        name: "Weight",
                        value: pokemonEntry.weightkg + "kg",
                        inline: true
                    },
                    {
                        name: "Egg Groups",
                        value: pokemonEntry.eggGroups.join(", ")
                    },
                    {
                        name: "Dex Entry",
                        value: pokedexEntry
                    },
                ],
                image: {
                    url: imgURL,
                    width: 80
                }
            });
    
            msg.channel.send(embed);
        } else {
            msg.channel.send(`${fail} Sorry, that is an invalid pokemon input.`);
        }
    } else {
        msg.channel.send(`${fail} Sorry, that is an invalid pokemon input.`);
    }
}

function capitalizeFirstLetter(input) {
    return input.charAt(0).toUpperCase() + input.slice(1);
}

module.exports = {
    "name": "dex",
    "execute": execute
}