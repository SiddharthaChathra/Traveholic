'use client';

import { useState } from 'react';
import { 
  Upload, Image, MapPin, Check, X, 
  Clock, User, AlertCircle, CheckCircle,
  ChevronDown, ChevronUp, MoreVertical,
  Camera, Smartphone, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CrowdsourceTabProps {
  photos: any[];
}

export function CrowdsourceTab({ photos }: CrowdsourceTabProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'validated' | 'rejected'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredPhotos = photos.filter(p => 
    filter === 'all' || p.status === filter
  );

  const stats = {
    total: photos.length,
    pending: photos.filter(p => p.status === 'pending').length,
    validated: photos.filter(p => p.status === 'validated').length,
    rejected: photos.filter(p => p.status === 'rejected').length,
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
            <button className="px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700">
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

      {/* Upload Modal Placeholder */}
      <UploadModal />
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
    <div className={`bg-white rounded-lg border transition-all ${isExpanded ? 'border-primary-300 shadow-lg' : 'border-slate-200'}`}>
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
                    <button className="flex-1 py-2 px-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
                      <Check className="w-4 h-4 inline mr-1" /> Validate
                    </button>
                    <button className="flex-1 py-2 px-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">
                      <X className="w-4 h-4 inline mr-1" /> Reject
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
      )}
    </div>
  );
}

function UploadModal() {
  return null; // Placeholder for upload modal
}