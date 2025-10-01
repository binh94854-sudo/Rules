// ====== Discord Bot ======
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  Partials,
} = require("discord.js");
require("dotenv").config();
const express = require("express");
const rules = require("./rules"); // import rules object

// ==== CONFIG ====
const TOKEN = process.env.TOKEN;
const CATEGORY_ID = process.env.CATEGORY_ID.trim(); // chắc chắn là string
const RULES_CHANNEL_ID = process.env.RULES_CHANNEL_ID;
const ROLE_ID = process.env.ROLE_ID;
const PORT = process.env.PORT || 3000;

// ==== CLIENT ====
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel],
});

// ==== Rename channel ====
async function renameChannel(channel) {
  if (channel.parentId !== CATEGORY_ID) return;
  if (!channel.name.endsWith("-webhook")) return;

  const username = channel.name.replace("-webhook", "");
  const newName = `🛠★】${username}-macro`;

  if (channel.name !== newName) {
    try {
      await channel.setName(newName);
      console.log(`✅ Đã đổi tên: ${channel.name} → ${newName}`);
    } catch (err) {
      console.error(`❌ Lỗi đổi tên ${channel.id}:`, err);
    }
  }
}

// ==== Ready ====
client.once("ready", async () => {
  console.log(`✅ Bot đã đăng nhập: ${client.user.tag}`);

  // Quét toàn bộ channel trong category khi bot bật
  client.channels.cache
    .filter((ch) => ch.parentId === CATEGORY_ID)
    .forEach((ch) => renameChannel(ch));

  // Gửi menu rules nếu chưa có
  const channel = await client.channels.fetch(RULES_CHANNEL_ID);
  if (!channel) return console.log("❌ Không tìm thấy kênh rules");

  const messages = await channel.messages.fetch({ limit: 50 });
  const alreadySent = messages.find(
    (m) =>
      m.author.id === client.user.id &&
      m.components.length > 0 &&
      m.components[0].components[0].customId === "rules_menu"
  );

  if (!alreadySent) {
    const menu = new StringSelectMenuBuilder()
      .setCustomId("rules_menu")
      .setPlaceholder("Select rules you would like to see")
      .addOptions([
        { label: "1 Warning Rules", value: "opt1", description: "Rule violations that will get you 1 warn.", emoji: "<:x1Warn:1416316742384357396>" },
        { label: "Channel Misuses", value: "opt2", description: "Channel Misuse rules that will get you 1 warn.", emoji: "<:channelmisuse:1416316766312857610>" },
        { label: "2 Warning Rules", value: "opt3", description: "Rule violations that will get you 2 warns.", emoji: "<:x2Warn:1416316781060161556>" },
        { label: "3 Warning Rules", value: "opt4", description: "Rule violations that will get you 3 warns.", emoji: "<:x3Warn:1416316796029374464>" },
        { label: "Instant Ban Rules", value: "opt5", description: "Rule violations that will get you a ban.", emoji: "<:instantban:1416316818297192510>" },
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await channel.send({
      content: "📜 **Server Rules are pinned here:**\n<https://discord.com/channels/1410980858583715970/1410980859028308074/1420064482427801640>",
      components: [row],
    });

    console.log("✅ Đã gửi menu rules mới.");
  }
});

// ==== Channel Create + Auto Add Role ====
client.on("channelCreate", async (channel) => {
  if (channel.parentId !== CATEGORY_ID) return;

  await renameChannel(channel);

  // Kiểm tra topic
  if (!channel.topic) {
    console.log(`❌ Channel ${channel.name} không có topic, không thể add role.`);
    return;
  }

  // Lấy userId là số cuối cùng trong topic
  const match = channel.topic.match(/(\d{17,19})$/);
  if (!match) {
    console.log(`❌ Không tìm thấy User ID trong topic của channel ${channel.name}: "${channel.topic}"`);
    return;
  }

  const userId = match[1];

  try {
    const member = await channel.guild.members.fetch(userId);
    if (!member) {
      console.log(`❌ Không tìm thấy member với ID: ${userId} trong server.`);
      return;
    }

    // Check role hierarchy
    const botMember = await channel.guild.members.fetch(client.user.id);
    const botRolePosition = botMember.roles.highest.position;
    const targetRole = channel.guild.roles.cache.get(ROLE_ID);

    if (!targetRole) {
      console.log(`❌ Role ID ${ROLE_ID} không tồn tại.`);
      return;
    }

    if (botRolePosition <= targetRole.position) {
      console.log(`❌ Bot role thấp hơn hoặc bằng role cần add. Không thể add role ${targetRole.name} cho ${member.user.tag}`);
      return;
    }

    await member.roles.add(targetRole);
    console.log(`✅ Đã add role ${targetRole.name} cho ${member.user.tag} từ channel ${channel.name}`);

  } catch (err) {
    console.error(`❌ Lỗi khi add role cho userId ${userId}:`, err);
  }
});

// ==== Interaction chọn menu ====
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId !== "rules_menu") return;

  const data = rules[interaction.values[0]];
  if (!data) return;

  const embed = new EmbedBuilder()
    .setTitle(data.title)
    .setDescription(data.desc)
    .setColor(data.color)
    .setImage(data.image);

  await interaction.reply({ embeds: [embed], ephemeral: true });
});

// ==== Express server (keep alive) ====
const app = express();
app.get("/", (req, res) => res.send("✅ Bot is running!"));
app.listen(PORT, () => console.log(`🌐 Web server online at port ${PORT}`));

// ==== LOGIN ====
client.login(TOKEN);
