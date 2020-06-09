import express from 'express';

import rulesController from './controllers/rulesController';

const app = express();

app.use(express.json());

app.use('/api/rules', rulesController.create);

app.listen(3333, () => console.log('server running!'));