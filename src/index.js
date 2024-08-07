import dotenv from "dotenv";
dotenv.config();

import { Client, IntentsBitField } from "discord.js";
import { publicIpv4 } from "public-ip";
import { initWatcher } from "./watcher.js";
import {
  getStatusServer,
  startServer,
  stopServer,
  fazFicarDeDia,
  sendCommandToServer,
} from "./comandosServer.js";

let canalGeral = null;
const COMANDOS = {
  status: async () => await getStatusServer(true),
  start: async () => await startServer(),
  stop: async () => await stopServer(),
  dia: async () => await fazFicarDeDia(),
  mc: async (command) => await sendCommandToServer(command),
};

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

const callbackWatcher = async () => {
  const isServerOnline = await getStatusServer();

  if (isServerOnline) {
    const ipPublico = await publicIpv4();

    if (canalGeral !== null) {
      canalGeral.send("Servidor online no IP: " + ipPublico + ":25585");
    }
  }
};

const apagarMensagensComMaisDe24Horas = async (canal) => {
  await canal.messages.fetch({ limit: 100 }).then((msgs) => {
    const agora = Date.now(),
      vinteQuatroHoras = 24 * 60 * 60 * 1000;

    const mensagensFiltradas = msgs.filter((mensagem) => {
      return (
        agora - mensagem.createdTimestamp >= vinteQuatroHoras &&
        mensagem.author.bot
      );
    });

    canal.bulkDelete(mensagensFiltradas);
  });
};

client.on("ready", async (c) => {
  canalGeral = c.channels.cache.get(process.env.CANAL_GERAL);

  apagarMensagensComMaisDe24Horas(canalGeral);

  initWatcher(callbackWatcher);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.commandName;
  const args = interaction.options.getString("command");

  if (command in COMANDOS) {
    if (command === "mc") {
      interaction.reply(await COMANDOS[command](args));
    } else {
      interaction.reply(await COMANDOS[command]());
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
