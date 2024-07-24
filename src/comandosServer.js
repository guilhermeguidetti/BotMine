import { Client, GatewayIntentBits } from "discord.js";
import { exec, spawn } from "child_process";
import "dotenv/config";
import { promisify } from "util";
const executaComando = promisify(exec);

let USOU_START = false;
const UM_MINUTO = 1 * 60 * 1000;
let ULTIMO_START = Date.now();
let TIMESTAMP_ALVO = ULTIMO_START + UM_MINUTO;
let processoServer = null;

export const getStatusServer = async (isComando) => {
  const retornoComando = await executaComando("jps", {
    windowsHide: false,
  });

  const jarsRodandoObj = retornoComando.stdout
    .trim()
    .split("\n")
    .reduce((acc, linha) => {
      const [pid, ...nomes] = linha.split(" "),
        nome = nomes.join(" ");

      acc[pid] = nome.trim();

      return acc;
    }, {});

  const nomesJarsRodando = Object.values(jarsRodandoObj),
    status = nomesJarsRodando.includes("fabric-server-launch.jar");

  if (isComando) {
    if (status) {
      return "O servidor está online!";
    } else {
      return "O servidor está offline!";
    }
  } else {
    return status;
  }
};

export const stopServer = async () => {
  if (!(await getStatusServer(false))) {
    return "Servidor já está offline!";
  }

  if (processoServer !== null) {
    processoServer.stdin.write("stop\r");
    processoServer = null;
  }

  await executaComando("%USERPROFILE%\\Documents\\Power Plan\\Low.bat");
  return "Parando o servidor...";
};

export const sendCommandToServer = async (mcCommand) => {
  if (!(await getStatusServer(false))) {
    return "Servidor está offline!";
  }

  if (processoServer !== null) {
    processoServer.stdin.write(`${mcCommand}\r`);
    return `Comando "${mcCommand}" enviado ao servidor!`;
  } else {
    return "Não foi possível enviar o comando ao servidor!";
  }
};

export const startServer = async () => {
  const AGORA = Date.now();

  if (await getStatusServer(false)) {
    return "Servidor já está online!";
  }

  // Primeiro start do dia
  if (!USOU_START) {
    USOU_START = true;

    executaComandoStartServer();

    return "Iniciando servidor...";
  } else {
    if (AGORA >= TIMESTAMP_ALVO) {
      ULTIMO_START = AGORA;
      TIMESTAMP_ALVO = ULTIMO_START + UM_MINUTO;

      executaComandoStartServer();

      return "Iniciando servidor... Não flooda, daqui a pouco aparece on";
    } else {
      return "O comando já foi usado nos último minuto. Não sobrecarregue o PC do Lacto!";
    }
  }
};

const executaComandoStartServer = async () => {
  processoServer = spawn(
    "javaw",
    ["-jar", "-Xms4G", "fabric-server-launch.jar", "--nogui"],
    {
      cwd: process.env.PASTA_SERVER,
    }
  );
  await executaComando("%USERPROFILE%\\Documents\\Power Plan\\High.bat");
};

export const fazFicarDeDia = async () => {
  if (!(await getStatusServer(false))) {
    return "Servidor está offline!";
  }

  if (processoServer !== null) {
    processoServer.stdin.write("time set 0\r");
  }

  return 'Deus disse: "Faça-se a luz!" E a luz foi feita.';
};
