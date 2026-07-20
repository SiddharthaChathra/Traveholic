import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter (optional, to accept only specific file types)
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WEBP, and MP4 are allowed.'));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// POST /api/upload - Single or multiple file upload
// Expects form-data with field name 'media'
router.post('/', requireAuth, upload.array('media', 10), (req: Request, res: Response): void => {
  try {
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      res.status(400).json({ error: 'No files were uploaded.' });
      return;
    }

    const files = req.files as Express.Multer.File[];
    
    // Construct public URLs for the uploaded files
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}/uploads/`;

    const fileUrls = files.map(file => ({
      originalName: file.originalname,
      filename: file.filename,
      url: baseUrl + file.filename,
      size: file.size,
      mimetype: file.mimetype
    }));

    res.json({
      success: true,
      message: 'Files uploaded successfully',
      files: fileUrls
    });
  } catch (error: any) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: error.message || 'File upload failed' });
  }
});

export default router;
