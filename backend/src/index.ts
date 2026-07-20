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
import followsRoutes from './routes/follows';
import notificationsRoutes from './routes/notifications';
import storiesRoutes from './routes/stories';
import searchRoutes from './routes/search';
import feedRoutes from './routes/feed';
import uploadRoutes from './routes/upload';
import aiRoutes from './routes/ai';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// --- Existing routes ---
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/destinations', destinationsRoutes);
app.use('/api/vlogs', vlogsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/messages', messagesRoutes);

// --- New Phase A routes ---
app.use('/api/follows', followsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/stories', storiesRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running', version: '2.0.0' });
});

// Centralized error handler (must be after all routes)
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
