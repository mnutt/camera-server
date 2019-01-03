const Koa = require('koa');
const Router = require('koa-router');
const logger = require('koa-logger');
const cors = require('@koa/cors');
const Camera = require('./camera');
const https = require('https');
const http = require('http');
const fs = require('fs');

const port = process.env.PORT || 3059;

(async function() {
  const camera = new Camera();

  await camera.initialize();
  console.log(`Found camera ${camera.info}`);
  await camera.configure('capturetarget', 1);

  const app = new Koa();
  const router = new Router();

  router.get('/cert.der', ctx => {
    ctx.body = fs.readFileSync(process.env.SSL_CERT);
    ctx.type = 'application/x-x509-ca-cert';
  });

  router.get('/take', async ctx => {
    ctx.body = await camera.takePicture();
    ctx.type = 'image/jpeg';
  });

  app.use(logger());
  app.use(cors());
  app.use(router.routes());
  app.use(router.allowedMethods());

  let server;
  if(process.env.HTTPS) {
    server = https.createServer({
      key: fs.readFileSync(process.env.SSL_KEY),
      cert: fs.readFileSync(process.env.SSL_CERT)
    }, app.callback());

    // huge improvement on connection time
    server.on("connection", function (socket) {
      socket.setNoDelay(true);
    });
  } else {
    server = http.createServer(app.callback());
  }

  await server.listen(port);

  console.log(`Listening on port ${port}`);
})().catch(e => {
  console.error(`Error: ${e}`);
});
