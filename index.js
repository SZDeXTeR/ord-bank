const { Events, Client, IntentsBitField, AttachmentBuilder, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { TOKEN } = require("./JSON/config.json");
const dotenv = require('dotenv');
const MONGO_URL = "mongodb+srv://zixel:zixel@zixel.n3stgnt.mongodb.net/?retryWrites=true&w=majority";
const { readdirSync } = require('fs');
const { REST } = require('@discordjs/rest');
const { Player } = require('discord-player');
const fs = require('fs')
const path = require("path");

const client = new Client({
     intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildVoiceStates
    ]
});

const process = require('node:process');

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});


const app = require('./server');

const http = require('http');
const server = http.createServer(app);


client.on("messageCreate", (msg) => {
    if (msg.content === `<@${client.user.id}>`) {
      let embed = new EmbedBuilder()
        .setAuthor({ name: msg.author.tag, iconURL: msg.author.displayAvatarURL() })
        .setDescription(`
        **Zixel makes things easier for you on your own private server**
                **➬  Use : /help**
                **➬ My Links :  **`)
        .setColor("#FF0000")
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
        .setLabel(`Invite Me`)
        .setStyle(ButtonStyle.Link)
        .setURL(`https://discord.com/api/oauth2/authorize?client_id=1074083057650372789&permissions=8&scope=bot%20applications.commands`),
        new ButtonBuilder()
        .setLabel(`Support Server`)
        .setStyle(ButtonStyle.Link)
        .setURL(`https://discord.gg/HJUYcxGBwN`),
  );
      msg.reply({ embeds: [embed], components: [row] });
    }
})


client.on('messageCreate', (message) => { 
  if (message.content.includes('خط')) {
    message.channel.send({ content: 'https://media.discordapp.net/attachments/1013419778255360041/1061743228786843739/Line.gif' })
    message.delete()
  }
});


client.on('messageCreate', (message) => {
  if (message.content.startsWith('c')) {
    const args = message.content.split(' ').slice(1).join(" ");

    message.reply(args[2].toString())
  }
});

readdirSync('./handlers').forEach(handler => {
    require(`./handlers/${handler}`)(client);
});


module.exports = client;

client.login(TOKEN);
