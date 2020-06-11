import fs from 'fs';
import path from 'path';
import express from 'express';

import rulesController from './controllers/rulesController';

const FILE_PATH = path.resolve(__dirname, '..', 'database.json');

const app = express();

app.use(express.json());

app.post('/api/rules', rulesController.create);
app.get('/api/rules', rulesController.list);
app.delete('/api/rules/:id', rulesController.delete);

app.listen(3333, async () =>  { 

  console.log('server running!')

  fs.exists(FILE_PATH, async (exists) =>{

    if (!exists) {
      let initialDb = { rules: [] };

      await fs.promises.writeFile(FILE_PATH, JSON.stringify(initialDb))
    }
  });
});