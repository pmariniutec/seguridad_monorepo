import * as express from "express";
import Routes from "./router";
import Middleware from "./config/middleware";

export class Server {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.app.use(function (req, res, next) {
      let allowedOrigins = ["http://localhost:3001"];
      let origin: any = req.headers.origin;
      if (allowedOrigins.indexOf(origin) > -1) {
        res.setHeader("Access-Control-Allow-Origin", origin);
      }
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, Accept, Origin, X-Requested-With, Cache-Control"
      );
      return next();
    });
    Middleware.init(this);
    Routes.init(this);
  }
}

export default new Server().app;
