const fs = require('fs');
const path = require('path');
const { ChatInputCommandInteraction, EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const creditsFilePath = path.join(__dirname, '../../JSON/credits.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('credits')
    .setDescription('View or transfer your credits')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user you want to view or transfer credits')
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('The amount of credits you want to transfer')
        .setRequired(false)
    ),

    /**
     * @param {ChatInputCommandInteraction} interaction 
     * @returns 
     */
  async execute(interaction) {
    const senderId = interaction.user.id;
    const recipient = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    const credits = JSON.parse(fs.readFileSync(creditsFilePath, 'utf-8'));

    if (!recipient && !amount) {
      const userCredits = credits[senderId] || 0;

      const userEmbed = new EmbedBuilder()
        .setDescription(`> **Your Balance is: **\n\n> **:coin: ${userCredits}**ㅤ`)
        .setColor('Gold')
        .setAuthor({ name: `${interaction.user.username}`, iconURL: `${interaction.user.displayAvatarURL({ dynamic: true })}` })

      
      return interaction.reply({ embeds: [userEmbed] });
    }

    if (!recipient && amount) {
      return interaction.reply({ content: `**🎃 huh? | What are you doing ?**`, ephemeral: true });
    }

    if (!amount) {
      const userCredits = credits[recipient.id] || 0;

       const userEmbed2 = new EmbedBuilder()
        .setDescription(`> **${recipient.username}'s Balance is: **\n\n> **:coin: ${userCredits}**ㅤ`)
        .setColor('Gold')
        .setAuthor({ name: `${recipient.username}`, iconURL: `${recipient.displayAvatarURL({ dynamic: true })}` })
      
      return interaction.reply({ embeds: [userEmbed2] });
    }

    if (senderId === recipient.id) {
      return interaction.reply({ content: '** :thinking: | You cannot transfer credits to yourself!**', ephemeral: true });
    }

    const senderCredits = credits[senderId] || 0;
    
    let recipientCredits = credits[recipient.id];
    if (!recipientCredits) recipientCredits = 0; // If recipient does not have an existing balance, set it to 0.
    if (senderCredits < amount) {
      return interaction.reply({ content: `** :thinking: | ${interaction.user.username}, Your balance is not enough for that!**`, ephemeral: true });
    }
    const transferAmount = amount;
    credits[senderId] -= amount;
    credits[recipient.id] = recipientCredits + transferAmount; // Add transfer amount to recipient's balance.
    fs.writeFileSync(creditsFilePath, JSON.stringify(credits, null, 2));

     const transEmbed = new EmbedBuilder()
        .setDescription(`> **💸 Ord Coin Transfer :**\n\n> **📤 From: <@${interaction.user.id}>**\n\n> **📥 To: <@${recipient.id}>**\n\n> **💰 Amount: :coin: ${transferAmount}**`).setColor('Random')
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));

    return interaction.reply({ embeds: [transEmbed] });
  },
};