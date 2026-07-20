import { z } from 'zod';

export const signupSchema = z.object({
  role: z.enum(['traveller', 'business']),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(1, 'Full name is required').max(100),
  phone: z.string().optional(),
  
  // Traveller specific
  travellerType: z.enum(['normal', 'vlogger']).optional().default('normal'),
  
  // Business specific
  businessProfile: z.object({
    businessType: z.enum(['agency', 'hotel']),
    businessName: z.string().max(100),
    registrationNumber: z.string().max(100),
    phone: z.string(),
    address: z.string().max(255),
    websiteUrl: z.string().url('Invalid website URL').optional().or(z.literal('')),
    bookingModel: z.enum(['direct', 'redirect']),
  }).optional(),
}).refine((data) => {
  if (data.role === 'business') {
    return !!data.businessProfile;
  }
  return true;
}, {
  message: 'Missing business-specific profile information',
  path: ['businessProfile'],
});

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const createPostSchema = z.object({
  caption: z.string().max(2200).optional(),
  location: z.string().max(100).optional(),
  images: z.union([z.string(), z.array(z.string())]).optional(),
  tags: z.array(z.string()).optional(),
});

export const createMessageSchema = z.object({
  receiverId: z.string().min(1, 'Receiver ID is required'),
  text: z.string().min(1, 'Message text cannot be empty').max(1000),
});
