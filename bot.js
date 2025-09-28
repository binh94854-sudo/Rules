const express = require("express");
const { verifyKey } = require("discord-interactions");
require("dotenv").config();

const app = express();

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.post("/interactions", (req, res) => {
  const signature = req.get("X-Signature-Ed25519");
  const timestamp = req.get("X-Signature-Timestamp");

  const isValid = verifyKey(
    req.rawBody,
    signature,
    timestamp,
    process.env.PUBLIC_KEY
  );

  if (!isValid) return res.status(401).send("Bad request signature");

  const interaction = req.body;

  // Ping check
  if (interaction.type === 1) {
    return res.json({ type: 1 });
  }

  // Select menu
  if (interaction.type === 3 && interaction.data.custom_id === "rules_menu") {
    let embed;

    switch (interaction.data.values[0]) {
      case "opt1":
        embed = {
          title: "1 Warning Rules",
          description: "Flooding/Spamming...\nExcessive Begging...\nXP Farming...",
          color: 0xffffcc,
        };
        break;
      case "opt2":
        embed = {
          title: "Channel Misuses",
          description: "Chatting Channel Misuse...\nMacro Channel Misuse...",
          color: 0x7fe390,
        };
        break;
      case "opt3":
        embed = {
          title: "2 Warning Rules",
          description: "Mod Bait...\nAccusation w/o Evidence...",
          color: 0xf0954b,
        };
        break;
      case "opt4":
        embed = {
          title: "3 Warning Rules",
          description: "DM Harassment...\nDiscrimination...",
          color: 0xf4363f,
        };
        break;
      case "opt5":
        embed = {
          title: "Instant Ban Rules",
          description: "NSFW...\nHate Speech...\nChild Endangerment...",
          color: 0xf13bfe,
        };
        break;
    }

    return res.json({
      type: 4,
      data: {
        embeds: [embed],
        flags: 64, // ephemeral
      },
    });
  }

  res.sendStatus(400);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("🌐 Web server running (Render)");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("🌐 Web server running (Render)");
});
