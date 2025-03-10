// app.js
import express from 'express';
import morgan from './src/configs/morgan.js';
import logger from './src/configs/loggers.js';
import mongoose from 'mongoose'; // Import MongoClient from 'mongodb'
import config from './src/configs/config.js';
import courseRouter from './src/routers/courseRoute.js';
import adminCourseRouter from './src/routers/adminCourseRoute.js';
import cors from 'cors';
import webinarRouter from './src/routers/WebinarRoute.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan.errorHandler);
app.use(morgan.successHandler);

const corsOptions = {
  origin: 'http://localhost:2999',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.get('/', (req, res) => {
  res.send('I am working');
});


app.get('/stream', (req, res) => {
    res.send('I am working');
  });
  
app.use("/stream", courseRouter);
app.use("/stream/admin", adminCourseRouter);
app.use("/stream/webinar", webinarRouter);

mongoose.connect(config.mongoDbUri).then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to connect to MongoDB', err);
});