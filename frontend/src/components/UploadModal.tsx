'use client';

import { useState } from 'react';
import { Camera, Image, Upload, X, MapPin, Check, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const uploadSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  altitude: z.number().optional(),
  heading: z.number().min(0).max(360).optional(),
  pitch: z.number().min(-90).max(90).optional(),
  taken_at: z.string().optional(),
  user_email: z.string().email(),
  user_name: z.string().min(1),
});

type UploadForm = z.infer<typeof uploadSchema>;

export function UploadModal({ onClose }: { onClose: () => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UploadForm>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      user_email: '',
      user_name: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type)) {
        toast.error('Invalid file type. Please upload JPEG, PNG, or WebP.');
        return;
      }
      if (selected.size > 10 * 1024 * 1024) {
        toast.error('File too large. Maximum size is 10MB.');
        return;
      }
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const onSubmit = async (data: UploadForm) => {
    if (!file) {
      toast.error('Please select an image');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('latitude', data.latitude.toString());
      formData.append('longitude', data.longitude.toString());
      if (data.altitude) formData.append('altitude', data.altitude.toString());
      if (data.heading) formData.append('heading', data.heading.toString());
      if (data.pitch) formData.append('pitch', data.pitch.toString());
      if (data.taken_at) formData.append('taken_at', data.taken_at);
      formData.append('user_email', data.user_email);
      formData.append('user_name', data.user_name);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/crowdsource/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Upload failed');
      }

      toast.success('Photo uploaded successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleLocationClick = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue('latitude', position.coords.latitude);
        setValue('longitude', position.coords.longitude);
        if (position.coords.altitude) {
          setValue('altitude', position.coords.altitude);
        }
        toast.success('Location captured');
      },
      () => toast.error('Failed to get location'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Upload Beach Photo</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          {/* Image Preview */}
          <div className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden">
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4">
                <Camera className="w-12 h-12 mb-2" />
                <p className="text-center">Tap to select photo</p>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            )}
            {!preview && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                JPEG, PNG, WebP • Max 10MB
              </div>
            )}
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
              <input
                {...register('latitude', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="12.8765"
                step="0.0001"
              />
              {errors.latitude && <p className="text-red-500 text-xs mt-1">{errors.latitude.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
              <input
                {...register('longitude', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="74.8345"
                step="0.0001"
              />
              {errors.longitude && <p className="text-red-500 text-xs mt-1">{errors.longitude.message}</p>}
            </div>
          </div>

          <button
            type="button"
            onClick={handleLocationClick}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm"
          >
            <MapPin className="w-4 h-4" />
            Use Current Location
          </button>

          {/* Optional fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Altitude (m)</label>
              <input
                {...register('altitude', { valueAsNumber: true })}
                type="number"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Optional"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Heading (°)</label>
              <input
                {...register('heading', { valueAsNumber: true })}
                type="number"
                min="0"
                max="360"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Optional"
                step="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pitch (°)</label>
              <input
                {...register('pitch', { valueAsNumber: true })}
                type="number"
                min="-90"
                max="90"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Optional"
                step="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Taken At</label>
              <input
                {...register('taken_at')}
                type="datetime-local"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* User Info */}
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-medium text-slate-800">Your Information</h4>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input
                {...register('user_name')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="John Doe"
              />
              {errors.user_name && <p className="text-red-500 text-xs mt-1">{errors.user_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                {...register('user_email')}
                type="email"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="john@example.com"
              />
              {errors.user_email && <p className="text-red-500 text-xs mt-1">{errors.user_email.message}</p>}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading || !file}
            className="w-full py-2.5 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload Photo
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}