import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Film, ExternalLink, PlayCircle, Download } from 'lucide-react';
import { Button } from './button';
import { supabase } from '@/lib/supabase';

interface VideoPlayerProps {
  videoUrl: string;
  videoName?: string;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoUrl, 
  videoName = 'Training video',
  className = '' 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [directUrl, setDirectUrl] = useState<string | null>(null);
  
  // Extract filename from URL for direct download
  useEffect(() => {
    const getDirectDownloadUrl = async () => {
      setLoading(true);
      try {
        // Check if this is a valid URL
        if (!videoUrl) {
          throw new Error('No video URL provided');
        }

        console.log('Original video URL:', videoUrl);

        // For any Supabase URL, try to get a direct download URL that doesn't need authentication
        if (videoUrl.includes('supabase')) {
          // Extract essential information from the URL
          // This will create a more reliable direct URL to the resource
          const supabaseUrl = new URL(videoUrl);
          const pathSegments = supabaseUrl.pathname.split('/');
          
          // For debugging path components
          console.log('URL components:', {
            origin: supabaseUrl.origin,
            pathname: supabaseUrl.pathname,
            segments: pathSegments
          });
          
          // The most reliable approach is to construct a direct public URL
          // Format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[filename]
          if (pathSegments.includes('public')) {
            try {
              // Find where 'public' is in the path
              const publicIndex = pathSegments.indexOf('public');
              if (publicIndex >= 0 && publicIndex + 1 < pathSegments.length) {
                // Get the bucket name and file path
                const bucket = pathSegments[publicIndex + 1];
                const filePath = pathSegments.slice(publicIndex + 2).join('/');
                
                // Construct a direct public URL - this format is more stable
                const directPublicUrl = `${supabaseUrl.origin}/storage/v1/object/public/${bucket}/${filePath}`;
                console.log('Constructed direct public URL:', directPublicUrl);
                
                // Try to fetch a simple HEAD request to see if the URL is valid
                try {
                  const response = await fetch(directPublicUrl, { method: 'HEAD' });
                  if (response.ok) {
                    console.log('Direct URL is accessible');
                    setDirectUrl(directPublicUrl);
                    setLoading(false);
                    return;
                  } else {
                    console.warn('Direct URL returned status:', response.status);
                  }
                } catch (fetchError) {
                  console.warn('Error testing direct URL:', fetchError);
                }
              }
            } catch (parseError) {
              console.warn('Error constructing direct URL:', parseError);
            }
          }
          
          // If direct URL construction failed, try signed URL as fallback
          try {
            // Try to extract bucket and path for signed URL
            let bucket = '';
            let path = '';
            
            // Various Supabase path patterns
            if (videoUrl.includes('/storage/v1/object/public/')) {
              const publicSegmentIndex = videoUrl.indexOf('/public/');
              if (publicSegmentIndex !== -1) {
                const pathAfterPublic = videoUrl.substring(publicSegmentIndex + 8);
                const segments = pathAfterPublic.split('/');
                bucket = segments[0];
                path = segments.slice(1).join('/');
              }
            } else if (videoUrl.includes('/storage/v1/object/authenticated/')) {
              const authSegmentIndex = videoUrl.indexOf('/authenticated/');
              if (authSegmentIndex !== -1) {
                const pathAfterAuth = videoUrl.substring(authSegmentIndex + 14);
                const segments = pathAfterAuth.split('/');
                bucket = segments[0];
                path = segments.slice(1).join('/');
              }
            }
            
            console.log('Extracted bucket/path for signed URL:', { bucket, path });
            
            if (bucket && path) {
            // Get a signed URL with longer expiry
            const { data, error } = await supabase.storage
              .from(bucket)
                .createSignedUrl(path, 86400);
              
            if (data?.signedUrl) {
              console.log('Got signed URL:', data.signedUrl);
              setDirectUrl(data.signedUrl);
                setLoading(false);
                return;
              } else if (error) {
              console.warn('Could not get signed URL:', error);
                // Continue to fallbacks
              }
            }
          } catch (err) {
            console.warn('Error getting signed URL:', err);
          }
        }
        
        // Fallback: use the original URL if all else fails
        console.log('Using original URL as fallback:', videoUrl);
        setDirectUrl(videoUrl);
      } catch (err) {
        console.error('Error processing video URL:', err);
        setError(true);
        setDirectUrl(videoUrl); // Still set direct URL as fallback
      } finally {
        setLoading(false);
      }
    };
    
    getDirectDownloadUrl();
  }, [videoUrl]);
  
  // Add a retry mechanism for video loading
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;
  
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video playback error:', e);
    
    // Try to reload the video with a direct approach if we haven't exceeded max retries
    if (retryCount < maxRetries) {
      setRetryCount(prevCount => prevCount + 1);
      console.log(`Retry attempt ${retryCount + 1}/${maxRetries}...`);
      
      // Force reload with a small delay
      setTimeout(() => {
        const videoElement = e.target as HTMLVideoElement;
        // Try to reload using the refresh approach
        videoElement.load();
      }, 1000);
    } else {
      // After max retries, show error UI
    setError(true);
    setLoading(false);
      toast.error('Unable to play video. Please use the download or external link options.');
    }
  };
  
  const handleVideoLoad = () => {
    setLoading(false);
    setError(false);
  };
  
  // Function to download video directly
  const downloadVideo = async () => {
    try {
      const response = await fetch(directUrl || videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = videoName || 'training-video';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading video:', err);
      toast.error('Failed to download video. Try the external link instead.');
      window.open(directUrl || videoUrl, '_blank');
    }
  };
  
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="border rounded overflow-hidden bg-black aspect-video">
        {loading && !error && (
          <div className="flex items-center justify-center h-full bg-gray-900">
            <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
        
        {error ? (
          <div className="flex flex-col items-center justify-center h-full bg-gray-900">
            <Film className="h-12 w-12 text-gray-500 mb-3" />
            <p className="text-gray-300 text-center mb-4">Unable to play video directly.</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => window.open(directUrl || videoUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-green-600 text-white hover:bg-green-700"
                onClick={downloadVideo}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        ) : (
          <video 
            controls 
            src={directUrl || videoUrl}
            className="w-full h-full"
            poster="/placeholder-video.jpg"
            onError={handleVideoError}
            onLoadedData={handleVideoLoad}
            preload="auto"
            crossOrigin="anonymous"
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>
      
      <div className="text-sm text-gray-500 flex justify-between items-center">
        <span>{videoName}</span>
        <div className="flex gap-2">
          <button 
            onClick={downloadVideo}
            className="text-green-600 hover:underline text-sm flex items-center"
          >
            <Download className="h-3 w-3 mr-1" />
            Download
          </button>
          <a 
            href={directUrl || videoUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline text-sm flex items-center"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Open in new tab
          </a>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer; 