import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 8080;

mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));


// import express from 'express';
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import menuRoutes from './routes/menuRoutes.js';

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 8080;

// // Connect to MongoDB
// mongoose.connect(process.env.DB_URL)
//     .then(() => console.log('Connected to MongoDB'))
//     .catch((err) => console.error('Error connecting to MongoDB:', err));

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Routes 
// app.use('/api/menu', menuRoutes);

// // Check !!
// app.get('/', (req, res) => {
//     res.json({ message: 'Rubato API is running...' });
// });

// // Start the server
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

