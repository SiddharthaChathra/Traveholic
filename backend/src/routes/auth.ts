import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'travora_super_secret_jwt_key_12345';

const isStrongPassword = (password: string) => {
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
};

router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phone, username, password, fullName, role, travellerType, businessProfile } = req.body;
    
    if (!isStrongPassword(password)) {
      res.status(400).json({ error: 'Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character.' });
      return;
    }

    if (!email && !phone) {
      res.status(400).json({ error: 'Email or phone is required' });
      return;
    }

    const orConditions: any[] = [{ username }];
    if (email) orConditions.push({ email });
    if (phone) orConditions.push({ phone });

    const existingUser = await prisma.user.findFirst({
      where: { OR: orConditions }
    });

    if (existingUser) {
      res.status(400).json({ error: 'Email, phone, or username already in use' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        username,
        passwordHash,
        fullName,
        role,
        travellerType: role === 'traveller' ? travellerType || 'normal' : null,
        businessProfile: role === 'business' && businessProfile ? {
          create: {
            businessType: businessProfile.businessType,
            businessName: businessProfile.businessName,
            registrationNumber: businessProfile.registrationNumber,
            phone: businessProfile.phone,
            address: businessProfile.address,
            websiteUrl: businessProfile.websiteUrl,
            bookingModel: businessProfile.bookingModel
          }
        } : undefined
      },
      include: {
        businessProfile: true
      }
    });

    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Signed up successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        travellerType: user.travellerType,
        businessProfile: user.businessProfile
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Server error occurred' });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      res.status(400).json({ error: 'Identifier and password are required' });
      return;
    }

    const isEmail = identifier.includes('@');
    const isPhone = /^\d+$/.test(identifier);

    const orConditions: any[] = [{ username: identifier }];
    if (isEmail) orConditions.push({ email: identifier });
    if (isPhone) orConditions.push({ phone: identifier });

    const user = await prisma.user.findFirst({
      where: {
        OR: orConditions
      },
      include: {
        businessProfile: true
      }
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        travellerType: user.travellerType,
        businessProfile: user.businessProfile
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Server error occurred' });
  }
});

router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { businessProfile: true }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        travellerType: user.travellerType,
        businessProfile: user.businessProfile
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// --- FORGOT PASSWORD OTP FLOW ---

router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      res.status(400).json({ error: 'Identifier is required' });
      return;
    }
    const isEmail = identifier.includes('@');
    
    const user = await prisma.user.findFirst({
      where: isEmail ? { email: identifier } : { phone: identifier }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found with that identifier' });
      return;
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await prisma.user.update({
      where: { id: user.id },
      data: { resetOtp: otp, resetOtpExpiry: expiry }
    });

    // SIMULATE SENDING OTP (Log to console)
    console.log(`\n\n=== OTP for ${identifier} is: ${otp} ===\n\n`);

    res.json({ success: true, message: 'OTP sent successfully', simulatedOtp: otp });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/verify-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, otp } = req.body;
    const isEmail = identifier.includes('@');
    
    const user = await prisma.user.findFirst({
      where: isEmail ? { email: identifier } : { phone: identifier }
    });

    if (!user || user.resetOtp !== otp) {
      res.status(400).json({ error: 'Invalid OTP' });
      return;
    }

    if (!user.resetOtpExpiry || user.resetOtpExpiry < new Date()) {
      res.status(400).json({ error: 'OTP has expired' });
      return;
    }

    res.json({ success: true, message: 'OTP verified' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, otp, newPassword } = req.body;
    const isEmail = identifier.includes('@');
    
    const user = await prisma.user.findFirst({
      where: isEmail ? { email: identifier } : { phone: identifier }
    });

    if (!user || user.resetOtp !== otp || !user.resetOtpExpiry || user.resetOtpExpiry < new Date()) {
      res.status(400).json({ error: 'Invalid or expired OTP' });
      return;
    }

    if (!isStrongPassword(newPassword)) {
      res.status(400).json({ error: 'Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        passwordHash,
        resetOtp: null,
        resetOtpExpiry: null
      }
    });

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
