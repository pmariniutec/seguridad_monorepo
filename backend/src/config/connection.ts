import * as mongoose from "mongoose";
import { default as config } from "../env/index";

interface IConnectOptions {
  autoReconnect: boolean;
  reconnectTries: number;
  reconnectInterval: number;
  loggerLevel?: string;
  useNewUrlParser: true;
  useUnifiedTopology: true;
}
const connectOptions: IConnectOptions = {
  autoReconnect: true,
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 1000,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const MONGO_URI: string = `${config.envConfig.database.MONGODB_URI}${config.envConfig.database.MONGODB_DB_MAIN}`;

export const db: mongoose.Connection = mongoose.createConnection(
  MONGO_URI,
  connectOptions
);

db.on("connecting", () => {
  console.log("\x1b[32m", "MongoDB :: connecting");
});

db.on("error", (error) => {
  console.log("\x1b[31m", `MongoDB :: connection ${error}`);
  mongoose.disconnect();
});

db.on("connected", () => {
  console.log("\x1b[32m", "MongoDB :: connected");
});

db.once("open", () => {
  console.log("\x1b[32m", "MongoDB :: connection opened");
});

db.on("reconnected", () => {});

db.on("reconnectFailed", () => {
  console.log("\x1b[31m", "MongoDB :: reconnectFailed");
});

db.on("disconnected", () => {
  console.log("\x1b[31m", "MongoDB :: disconnected");
});

db.on("fullsetup", () => {
  console.log('\x1b[33m"', "MongoDB :: reconnecting... %d");
});
