import express from 'express'
import path from 'path'
import bodyParser from 'body-parser'

import solver from './routes/solver'

let app = express();
app.use(bodyParser.json());
app.use('/api/solver',solver)
app.use(express.static(path.join(__dirname, '../../client/build')))
app.listen(4000, () => console.log('Running on localhost:4000'));
