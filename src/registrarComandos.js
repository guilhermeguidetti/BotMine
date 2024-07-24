import "dotenv/config";
import { REST, Routes } from "discord.js";

const comandos = [
  {
    name: "status",
    description: "Responde com o estado atual do servidor",
  },
  {
    name: "start",
    description: "Inicia o servidor",
  },
  {
    name: "stop",
    description: "Para o servidor",
  },
  {
    name: "dia",
    description: "Faz ficar dia no servidor",
  },
  {
    name: "mc",
    description: "Envia um comando personalizado para o servidor Minecraft",
    options: [
      {
        name: "command",
        type: 3, // STRING type
        description: "O comando Minecraft a ser enviado",
        required: true,
      },
    ],
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("Registrando comandos...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      {
        body: comandos,
      }
    );

    console.log("Comandos registrados com sucesso!");
  } catch (error) {
    console.log("Erro ao registrar comandos: " + error);
  }
})();
