import express from 'express';
import bodyParser from 'body-parser';
import { CustomError, NotFoundError } from './types/errors';
import { AccommodationService } from './service/accommodation-service';
import cors from 'cors';
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

const corsOptions = {
    origin: process.env.ALLOWED_ORIGIN,
    optionsSuccessStatus: 200,
  };

const accommodationService = new AccommodationService();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cors(corsOptions));


// upload images for accomondation

app.get('/accommodation/health', (req, res) => {
  return res.status(200).json({message: "Hello, World!"});
})

app.get('/accommodation/:id', async (req, res) => {
    console.log(`Getting accommodation with id: ${req.params.id}`);
    try {
        const accommodation = await accommodationService.getAccommodation(req.params.id);
        return res.json(accommodation);
    } catch (err) {
      const code = err instanceof CustomError ? err.code : 500;
      return res.status(code).json({ message: (err as Error).message });
    }
});

app.post('/accommodation', async (req, res) => {
    console.log('Creating new accommodation');
    const userDataStr = req.headers.user;
    try {
        if (!userDataStr) {
          throw new NotFoundError('User data not provided');
        }
        const userData = JSON.parse(userDataStr as string);
        console.log(`Logged user: ${JSON.stringify(userData)}`);
        const newAccommodationId = await accommodationService.createAccommodation(userData, req.body);
        return res.status(201).json({ id: newAccommodationId });
    } catch (err) {
        const code = err instanceof CustomError ? err.code : 500;
        return res.status(code).json({ message: (err as Error).message });
    }
});

app.get('/accommodation/', async (req, res) => {
    console.log(`Getting all accommodations which belongs to user: ${JSON.stringify(req.headers.user)}`);
    const userDataStr = req.headers.user;
    try {
        if (!userDataStr) {
            throw new NotFoundError('User data not provided');
          }
        const userData = JSON.parse(userDataStr as string);
        const accommodation = await accommodationService.getAccommodationByUser(userData);
        return res.json(accommodation);
    } catch (err) {
      const code = err instanceof CustomError ? err.code : 500;
      return res.status(code).json({ message: (err as Error).message });
    }
});


//preko rabbit mq: promeni username

// preko rabbit mq: obrisi sve smestaje koji pripadaju korisniku

// preko rabbit mq:azuriraj rejting smestaja

app.listen(PORT, () => {
  console.log(`Backend service running on http://localhost:${PORT}`);
});
