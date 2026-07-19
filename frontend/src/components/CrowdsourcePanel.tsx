'use client';

import { useState } from 'react';
import { 
  Upload, Image, MapPin, Check, X, Clock, 
  Camera, Smartphone, Globe, ChevronDown, ChevronUp,
  CheckCircle, AlertCircle, MoreVertical,
  Trash2
} from 'lucide-react';
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

export function CrowdsourceTab({ photos }: { photos: any[] }) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'validated' | 'rejected'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const filteredPhotos = photos.filter(p => 
    filter === 'all' || p.status === filter
  );

  const stats = {
    total: photos.length,
    pending: photos.filter(p => p.status === 'pending').length,
    validated: photos.filter(p => p.status === 'validated').length,
    rejected: photos.filter(p => p.status === 'rejected').length,
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    validated: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
  };

  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="w-4 h-4" />,
    validated: <CheckCircle className="w-4 h-4" />,
    rejected: <AlertCircle className="w-4 h-4" />,
  };

  return (
    <div className="h-full flex flex-col">
      {/* Stats Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-800">Community Shoreline Mapping</h3>
            <p className="text-sm text-slate-500">Citizen-contributed beach photos for shoreline validation</p>
          </div>
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary-600" />
            <button 
              onClick={() => setShowUpload(true)}
              className="px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
            >
              Upload Photo
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {[
            { id: 'all', label: 'All', count: stats.total },
            { id: 'pending', label: 'Pending', count: stats.pending },
            { id: 'validated', label: 'Validated', count: stats.validated },
            { id: 'rejected', label: 'Rejected', count: stats.rejected },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${filter === f.id 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'}`}
            >
              {f.label}
              <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full
                ${filter === f.id ? 'bg-primary-100 text-primary-700' : 'bg-slate-200 text-slate-600'}">
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Photos List */}
      <div className="flex-1 overflow-y-auto">
        {filteredPhotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Image className="w-16 h-16 mb-4 text-slate-300" />
            <p className="font-medium">No photos found</p>
            <p className="text-sm">{filter === 'all' ? 'Be the first to contribute!' : `No ${filter} photos`}</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredPhotos.map(photo => (
              <PhotoCard 
                key={photo.id} 
                photo={photo}
                isExpanded={expandedId === photo.id}
                onToggle={() => setExpandedId(expandedId === photo.id ? null : photo.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <UploadModal 
          onClose={() => setShowUpload(false)}
          onSuccess={() => setShowUpload(false)}
        />
      )}
    </div>
  );
}

function PhotoCard({ photo, isExpanded, onToggle }: { photo: any; isExpanded: boolean; onToggle: () => void }) {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    validated: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
  };

  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="w-4 h-4" />,
    validated: <CheckCircle className="w-4 h-4" />,
    rejected: <AlertCircle className="w-4 h-4" />,
  };

  return (
    <div className={`bg-white rounded-lg border transition-all ${isExpanded ? 'border-primary-300 shadow-lg' : 'border-slate-200'} hover:shadow-sm`}>
      <button onClick={onToggle} className="w-full p-4 flex gap-4">
        {/* Thumbnail */}
        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
          {photo.thumbnail_url ? (
            <img 
              src={`http://localhost:8000${photo.thumbnail_url}`}
              alt="Beach photo"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <Image className="w-8 h-8" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[photo.status]}`}>
              {statusIcons[photo.status]}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-medium text-slate-800 truncate">
                {photo.user?.name || 'Community Member'}
              </h4>
              <p className="text-sm text-slate-500 truncate">
                {photo.beach_name || `Lat: ${photo.latitude.toFixed(4)}, Lon: ${photo.longitude.toFixed(4)}`}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[photo.status]}`}>
                {photo.status.charAt(0).toUpperCase() + photo.status.slice(1)}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
          </div>

          <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(photo.taken_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {photo.latitude.toFixed(4)}, {photo.longitude.toFixed(4)}
            </span>
            {photo.heading && (
              <span className="flex items-center gap-1">
                <Camera className="w-3 h-3" />
                Heading: {Math.round(photo.heading)}°
              </span>
            )}
          </div>

          {photo.validation_notes && (
            <p className="mt-2 text-sm text-slate-600 italic">"{photo.validation_notes}"</p>
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-100 bg-slate-50 rounded-b-lg animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Image */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Full Image</p>
              <div className="rounded-lg overflow-hidden bg-slate-100 aspect-video">
                {photo.image_url ? (
                  <img 
                    src={`http://localhost:8000${photo.image_url}`}
                    alt="Full beach photo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Image className="w-12 h-12" />
                  </div>
                )}
              </div>
            </div>

            {/* Details & Actions */}
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Location Details</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <p className="text-slate-500">Latitude</p>
                    <p className="font-mono font-medium">{photo.latitude.toFixed(6)}</p>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <p className="text-slate-500">Longitude</p>
                    <p className="font-mono font-medium">{photo.longitude.toFixed(6)}</p>
                  </div>
                  {photo.altitude && (
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <p className="text-slate-500">Altitude</p>
                      <p className="font-mono font-medium">{photo.altitude.toFixed(1)}m</p>
                    </div>
                  )}
                  {photo.pitch && (
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <p className="text-slate-500">Pitch</p>
                      <p className="font-mono font-medium">{photo.pitch.toFixed(1)}°</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Validation Actions (for researchers) */}
              {photo.status === 'pending' && (
                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <p className="text-sm font-medium text-slate-700">Validation Actions</p>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 px-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-1">
                      <Check className="w-4 h-4" /> Validate
                    </button>
                    <button className="flex-1 py-2 px-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center justify-center gap-1">
                      <Trash2 className="w-4 h-4" /> Reject
                    </button>
                  </div>
                  <textarea 
                    placeholder="Validation notes (optional)..."
                    className="w-full p-2 border border-slate-300 rounded text-sm"
                    rows={2}
                  />
                </div>
              )}

              {/* Extracted Shoreline */}
              {photo.shoreline_geojson && (
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-sm font-medium text-slate-700 mb-2">Extracted Shoreline</p>
                  <div className="p-2 bg-white rounded border border-slate-200 font-mono text-xs text-slate-600 max-h-32 overflow-auto">
                    {JSON.stringify(photo.shoreline_geojson, null, 2)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
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
      onSuccess();
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
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Upload Beach Photo</h2>
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
            <h4 className="text-sm font-medium text-slate-700">Your Information</h4>
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