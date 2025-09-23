const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  ActionRowBuilder, 
  StringSelectMenuBuilder, 
  Partials 
} = require("discord.js");
require("dotenv").config();

// Khởi tạo client
const client = new Client({ 
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages], 
  partials: [Partials.Channel], 
});

// Khi bot sẵn sàng
client.once("clientReady", async () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);

  // Fetch channel từ .env
  if (!process.env.CHANNEL_ID) return console.log("❌ CHANNEL_ID is not set!");
  const channel = await client.channels.fetch(process.env.CHANNEL_ID);
  if (!channel) return console.log("❌ Channel not found");

  // Embed chính
  const mainEmbed = new EmbedBuilder()
    .setTitle("📜 **Welcome to the Sol's RNG Communication Rules!**")
    .setDescription(
      "**This channel lists all rules enforced on our Discord server.**\n" +
      "Please read and follow them to ensure a pleasant experience for everyone.\n\n" +
      "**⚠️ Warning Points & Punishments:**\n" +
      "• 1 Warning = Reminder\n" +
      "• 2 Warnings = 1h Mute\n" +
      "• 3 Warnings = 12h Mute\n" +
      "• 4 Warnings = 1d Mute\n" +
      "• 5 Warnings = Ban\n" +
      "Warning Points expire after 30 days."
    )
    .setImage("https://media.discordapp.net/attachments/1411987904980586576/1412916875163209901/SOLS_RNG_COUMUNICATION.png")
    .setColor("#6e6e6e");

  // Menu chọn lựa
  const menu = new StringSelectMenuBuilder()
    .setCustomId("rules_menu")
    .setPlaceholder("Select rules you want to see")
    .addOptions([
      { label: "1 Warning Rules", value: "opt1", description: "Violations getting 1 warning", emoji: "<:x1Warn:1416316742384357396>" },
      { label: "Channel Misuses", value: "opt2", description: "Channel misuse rules", emoji: "<:channelmisuse:1416316766312857610>" },
      { label: "2 Warning Rules", value: "opt3", description: "Violations getting 2 warnings", emoji: "<:x2Warn:1416316781060161556>" },
      { label: "3 Warning Rules", value: "opt4", description: "Violations getting 3 warnings", emoji: "<:x3Warn:1416316796029374464>" },
      { label: "Instant Ban Rules", value: "opt5", description: "Violations leading to ban", emoji: "<:instantban:1416316818297192510>" },
    ]);

  const row = new ActionRowBuilder().addComponents(menu);

  await channel.send({ embeds: [mainEmbed], components: [row] });
});

// Xử lý interaction menu
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId !== "rules_menu") return;

  // defer để tránh Unknown interaction
  await interaction.deferReply({ ephemeral: true });

  let embed;

  switch (interaction.values[0]) {
    case "opt1":
      embed = new EmbedBuilder()
        .setTitle("**1 Warning Rules**")
        .setDescription(
          `*Flooding/Spamming*\nDescription: Messages occupying large screen space or irrelevant content.\n*Exceptions:* Informative messages\n(1h Mute)\n\n` +
          `*Excessive Begging*\nDescription: Repeatedly asking for favors, items, roles, privileges annoyingly.\n*Exceptions:* Jokingly asking\n\n` +
          `*XP Farming*\nDescription: Sending messages solely to gain XP unfairly.\n1st Offense = Reminder\n2nd = Reduce XP\n3rd = Level Reset`
        )
        .setImage("https://cdn.discordapp.com/attachments/1358092861303947485/1358860213138096199/IMG_2287.png")
        .setColor("#ffffcc");
      break;

    case "opt2":
      embed = new EmbedBuilder()
        .setTitle("**Channel Misuses**")
        .setDescription(
          `*Chat Channel Misuse*\nUsing channels for wrong purposes. E.g., bot commands outside Bots channel.\n\n` +
          `*Macro Channel Misuse*\nUsing macro channels incorrectly. 1x Warn: Reminder, 2x: 1 day blacklist, 3x: 1 week blacklist\n\n` +
          `*Community Channel Misuse*\nInappropriate purposes. 1x Warn: Reminder, 2x: 1 day blacklist, 3x: 1 week blacklist\n\n` +
          `*Voice Channel Misuse*\nImproper voice channel usage (1h Mute)`
        )
        .setImage("https://cdn.discordapp.com/attachments/1358092861303947485/1359923248946483382/Channel_Misuse.png")
        .setColor("#7fe390");
      break;

    case "opt3":
      embed = new EmbedBuilder()
        .setTitle("**2 Warning Rules**")
        .setDescription(
          `*Mod Bait*\nProvoking reactions without rule violation.\n\n` +
          `*Accusation w/o Evidence*\nMaking claims without proof, may lead to ban.\n\n` +
          `*DM Harassment*\nHarassing via DM.\n\n` +
          `*Discrimination*\nStereotyping based on race, gender, sexuality, religion.\n\n` +
          `*Inappropriate/Suggestive Language*\nOffensive or sexual references.\n\n` +
          `*Toxicity*\nDisruptive behavior.\n\n` +
          `*Advertising/Self Promotion*\nPromoting for self gain without permission.`
        )
        .setImage("https://cdn.discordapp.com/attachments/1358092861303947485/1358860209686057240/IMG_2288.png")
        .setColor("#f0954b");
      break;

    case "opt4":
      embed = new EmbedBuilder()
        .setTitle("**3 Warning Rules**")
        .setDescription(
          `*Mod Bait*\nProvoking reactions.\n\n` +
          `*Accusation w/o Evidence*\nMaking claims without proof.\n\n` +
          `*DM Harassment*\nHarassing via DM.\n\n` +
          `*Discrimination*\nExtreme stereotyping or hate speech.`
        )
        .setImage("https://cdn.discordapp.com/attachments/1358092861303947485/1358860210349019246/IMG_2289.png")
        .setColor("#f4363f");
      break;

    case "opt5":
      embed = new EmbedBuilder()
        .setTitle("**Instant Ban Rules**")
        .setDescription(
          `*Punishment Evading*\nAvoiding punishment.\n\n` +
          `*NSFW*\nInappropriate content.\n\n` +
          `*Hate Speech/Racism*\nPromoting discrimination.\n\n` +
          `*Child Endangerment*\nExposing minors to harm.\n\n` +
          `*Cybercrimes*\nIllegal online activity.\n\n` +
          `*Inappropriate Profile*\nOffensive display names, avatars, usernames.`
        )
        .setImage("https://cdn.discordapp.com/attachments/1358092861303947485/1358860210986287224/IMG_2290.png")
        .setColor("#f13bfe");
      break;
  }

  await interaction.editReply({ embeds: [embed] });
});

// Login bot
client.login(process.env.TOKEN);

// Express server cho uptime
const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => res.send("✅ Bot is running!"));
app.listen(port, () => console.log(`🌐 Web server running on port ${port}`));
