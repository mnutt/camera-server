const Koa = require('koa');
const logger = require('koa-logger');
const cors = require('@koa/cors');
const Camera = require('./camera');

const port = process.env.PORT || 3059;

(async function() {
  const camera = new Camera();

  await camera.initialize();
  console.log(`Found camera ${camera.info}`);
  await camera.configure('capturetarget', 1);

  const app = new Koa();
  app.use(logger());
  app.use(cors());

  app.use(async ctx => {
    ctx.assert(ctx.path === '/take', 404, 'Unknown path');

    ctx.body = await camera.takePicture();
    ctx.type = 'image/jpeg';
  });

  await app.listen(port);

  console.log(`Listening on port ${port}`);
})().catch(e => {
  console.error(`Error: ${e}`);
});
