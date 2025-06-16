require('dotenv').config();
const createServer = require('./Infrastructures/http/createServer');
const container = require('./Infrastructures/container');

(async () => {
  const server = await createServer(container);
  await server.start();
  yaaaaaaa();
  console.log(`server start at ${server.info.uri}`);
})();
