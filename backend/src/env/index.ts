import config from "./defaults";

let localConfig: any = {};

try {
  localConfig = require(`../env/${config.env}`);
  localConfig = localConfig || {};
} catch (error) {
  localConfig = {};
  console.error("error", error);
}

export default (<any>Object).assign({}, config, localConfig);
