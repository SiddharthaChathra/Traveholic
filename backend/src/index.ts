import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import destinationsRoutes from './routes/destinations';
import vlogsRoutes from './routes/vlogs';
import postsRoutes from './routes/posts';
import listingsRoutes from './routes/listings';
import bookingsRoutes from './routes/bookings';
import messagesRoutes from './routes/messages';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/destinations', destinationsRoutes);
app.use('/api/vlogs', vlogsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/messages', messagesRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
