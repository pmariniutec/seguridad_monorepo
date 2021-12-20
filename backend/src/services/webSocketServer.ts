import * as http from "http";
import { v4 as uuid } from "uuid";

export default class WebSockets {
  public static wss: any;
  public static connections = [];

  static init(server: http.Server): void {
    const WebSocketServer = require("websocket").server;

    this.wss = new WebSocketServer({
      httpServer: server,
    });

    this.wss.on("request", (request) => {
      let connection = request.accept(null, request.origin);
      WebSockets.connections.push(connection);
      let senderid = request.httpRequest.url.split("/")[2];
      connection.userID = senderid;

      connection.on("open", () => {
        console.log("Server socket Connection opened.");
      });
      connection.on("close", () => {
        console.log("Server socket Connection closed.");
      });

      connection.on("message", function (message: { utf8Data: string }) {
        let msgData = JSON.parse(message.utf8Data);
        if (msgData.chatId === undefined) {
          msgData.chatId = uuid();
        }
        msgData.messageId = uuid();
        WebSockets.connections.map((conn) => {
          if (
            conn.userID == msgData.receiverid ||
            conn.userID == msgData.senderid
          ) {
            conn.send(JSON.stringify(msgData));
          }
        });
      });
    });
  }
}
