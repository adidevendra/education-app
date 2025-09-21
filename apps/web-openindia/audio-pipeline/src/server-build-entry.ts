// small entry that imports server default export and listens (for bundlers)
import app from './server';

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on ${port}`);
});
