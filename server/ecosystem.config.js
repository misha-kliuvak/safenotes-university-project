require("dotenv")
  .config();

const NODE_ENV = process.env.NODE_ENV;
const APP_NAME = process.env.APP_NAME;

module.exports = {
  apps: [
    {
      name: `${APP_NAME}-${NODE_ENV}`,
      script: "yarn",
      args: "start:prod"
    }
  ]
};
