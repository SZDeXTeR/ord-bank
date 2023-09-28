const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Convert The Probot redits To Ord Coins'),

  async execute(interaction) {
    const buyId = ["1111724591853875220", "1111724458491789382"];
  if (buyId.includes(interaction.channelId)) {
    return interaction.reply({ content: '**This is not the right room to buy ❌**', ephemeral: true });
  }

  const probotid = '634852094485987329';


  const buys = new EmbedBuilder()
    .setTimestamp()
    .addFields({ name: `**Converting Credits To Ord:**`,
      value: `
        > **You have only 2 minutes to transfer**
        > **Please make sure to send in the time** ⚠️

        **To make the convert, please send to the id below:**
        \`\`\`
<@1034605437435248662> / DeXTeR
        \`\`\`
      ` })

  await interaction.reply({ embeds: [buys] });

  const filter = (msg) => {
    return msg.content.includes(`${interaction.user.username}, has transferred `) &&
      msg.content.includes(`1034605437435248662`) &&
      msg.author.id === probotid;
  };

  try {
    const collected = await interaction.channel.awaitMessageComponent({
      filter,
      max: 1,
      time: 120000,
      errors: ['time']
    });

    const msg = collected.first();

    const coinsRegex = /has transferred (\d+)/;
    const coinsMatch = msg.content.match(coinsRegex);
    const coins = coinsMatch ? parseInt(coinsMatch[1]) : 0;

    interaction.user.send({
      embeds: [new EmbedBuilder()
        .setTimestamp()
        .setDescription(`> **Hi ${interaction.user.tag}, you have converted your credits successfully!**
> **Total Coins Received: \`${coins}\`**
`)
      ]
    });

    let embed = new EmbedBuilder()
      .setTitle('**🟢 | Done Converting**')

    interaction.channel.send({ embeds: [embed] });

  } catch (error) {
    console.log(error);
    interaction.editReply({ content: '**Time is over, operation canceled ❌**', ephemeral: true });
  }
}
  }

