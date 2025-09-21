import express from 'express';
import {ttsFunction} from '../functions/ttsFunction';

const app = express();
app.use(express.json());
app.post('/', (req, res) => ttsFunction(req, res));

export default app;
