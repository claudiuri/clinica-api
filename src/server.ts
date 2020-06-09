import express from 'express';

import rulesController from './controllers/rulesController';

const app = express();

app.use(express.json());

app.post('/api/rules', rulesController.create);
app.delete('/api/rules/:id', rulesController.delete);

app.listen(3333, () => console.log('server running!'));