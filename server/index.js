import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// components
import Connection from './database/db.js';
import Router from './routes/route.js';

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json()); // ✅ IMPORTANT
app.use(express.urlencoded({ extended: true })); // optional

// routes
app.use('/', Router);

const PORT = 8000;

Connection();

app.listen(PORT, () =>
  console.log(`Server is running successfully on PORT ${PORT}`)
);