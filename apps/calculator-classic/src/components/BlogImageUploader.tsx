import { useState } from "react";
import { ObjectUploader } from "./ObjectUploader";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image, X } from "lucide-react";
import { Button } from "./ui/button";

interface BlogImageUploaderProps {
  onImageUploaded: (imageUrl: string) => void;
  multiple?: boolean;
  maxFiles?: number;
  label?: string;
  className?: string;
}

interface UploadedImage {
  url: string;
  filename: string;
}

export function BlogImageUploader({ 
  onImageUploaded, 
  multiple = false, 
  maxFiles = 1,
  label = "Upload Image",
  className = "" 
}: BlogImageUploaderProps) {
  const { toast } = useToast();
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleGetUploadParameters = async () => {
    try {
      const filename = `blog-image-${Date.now()}.jpg`;
      const response = await apiRequest('/api/blog-images/upload', {
        method: 'POST',
        body: JSON.stringify({ filename }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return {
        method: "PUT" as const,
        url: response.uploadURL,
        headers: {
          'Content-Type': 'image/jpeg',
        },
      };
    } catch (error) {
      console.error('Error getting upload parameters:', error);
      toast({
        title: "Upload Error",
        description: "Failed to prepare image upload. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUploadComplete = async (result: any) => {
    try {
      setIsUploading(true);
      
      if (result.successful && result.successful.length > 0) {
        const uploadedFile = result.successful[0];
        const uploadURL = uploadedFile.uploadURL;
        
        // Extract object path from the upload URL
        const url = new URL(uploadURL);
        const pathParts = url.pathname.split('/');
        const bucketIndex = pathParts.findIndex(part => part.startsWith('repl-default-bucket'));
        if (bucketIndex === -1) {
          throw new Error('Invalid upload URL format');
        }
        
        const objectPath = '/objects/' + pathParts.slice(bucketIndex + 2).join('/');
        
        // Finalize the upload to set proper permissions
        const finalizeResponse = await apiRequest('/api/blog-images/finalize', {
          method: 'PUT',
          body: JSON.stringify({ objectPath }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const imageUrl = finalizeResponse.publicURL;
        const newImage = {
          url: imageUrl,
          filename: uploadedFile.name || 'Uploaded Image'
        };

        setUploadedImages(prev => [...prev, newImage]);
        onImageUploaded(imageUrl);

        toast({
          title: "Image Uploaded",
          description: "Your image has been uploaded successfully!",
        });
      }
    } catch (error) {
      console.error('Error finalizing upload:', error);
      toast({
        title: "Upload Error",
        description: "Failed to finalize image upload. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-4">
        <ObjectUploader
          maxNumberOfFiles={maxFiles}
          maxFileSize={5 * 1024 * 1024} // 5MB limit
          onGetUploadParameters={handleGetUploadParameters}
          onComplete={handleUploadComplete}
          buttonClassName="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
        >
          <div className="flex items-center gap-2">
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>{label}</span>
              </>
            )}
          </div>
        </ObjectUploader>
        
        <p className="text-sm text-gray-500">
          Upload images up to 5MB (JPG, PNG, GIF)
        </p>
      </div>

      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {uploadedImages.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={image.url}
                  alt={image.filename}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeImage(index)}
                  className="bg-red-500 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-600 mt-1 truncate">{image.filename}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}