import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BlogImageUploader } from "@/components/BlogImageUploader";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Save, 
  Eye, 
  Upload, 
  Image as ImageIcon, 
  Tag, 
  Calendar,
  Globe,
  FileText,
  Settings,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import { motion } from "framer-motion";
import type { InsertBlogPost } from "@shared/schema";

export default function AdminBlogEditor() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<Partial<InsertBlogPost>>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    images: [],
    tags: [],
    status: "draft",
    language: "en",
    readTime: 5,
  });

  const [newTag, setNewTag] = useState("");
  const [isPreview, setIsPreview] = useState(false);

  const createBlogMutation = useMutation({
    mutationFn: async (blogData: InsertBlogPost) => {
      return apiRequest('/api/admin/blog-posts', {
        method: 'POST',
        body: JSON.stringify(blogData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Blog Post Created",
        description: "Your blog post has been saved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/blog-posts'] });
      setLocation('/admin');
    },
    onError: (error) => {
      console.error('Create blog error:', error);
      toast({
        title: "Error",
        description: "Failed to create blog post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast({
        title: "Validation Error",
        description: "Title and content are required fields.",
        variant: "destructive",
      });
      return;
    }

    // Auto-generate slug if not provided
    const slug = formData.slug || formData.title
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Estimate read time based on content length
    const wordCount = formData.content.split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    const blogData: InsertBlogPost = {
      ...formData,
      slug,
      readTime,
      publishedAt: formData.status === 'published' ? new Date() : null,
    } as InsertBlogPost;

    createBlogMutation.mutate(blogData);
  };

  const handleInputChange = (field: keyof InsertBlogPost, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      const currentTags = Array.isArray(formData.tags) ? formData.tags : [];
      const updatedTags = [...currentTags, newTag.trim()];
      handleInputChange('tags', updatedTags);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = Array.isArray(formData.tags) ? formData.tags : [];
    const updatedTags = currentTags.filter(tag => tag !== tagToRemove);
    handleInputChange('tags', updatedTags);
  };

  const handleImageUploaded = (imageUrl: string) => {
    if (!formData.featuredImage) {
      // Set as featured image if none exists
      handleInputChange('featuredImage', imageUrl);
    }
    
    // Add to images array
    const currentImages = Array.isArray(formData.images) ? formData.images : [];
    const updatedImages = [...currentImages, imageUrl];
    handleInputChange('images', updatedImages);
    
    toast({
      title: "Image Added",
      description: "Image has been added to your blog post.",
    });
  };

  const insertImageToContent = (imageUrl: string) => {
    const imageMarkdown = `\n\n![Image](${imageUrl})\n\n`;
    const currentContent = formData.content || "";
    handleInputChange('content', currentContent + imageMarkdown);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-600/30 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-600/30 blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setLocation('/admin')}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-purple-400" />
                  Create Blog Post
                </h1>
                <p className="text-gray-300">Write and publish AI-powered content</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setIsPreview(!isPreview)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Eye className="w-4 h-4 mr-2" />
                {isPreview ? 'Edit' : 'Preview'}
              </Button>
              
              <Button
                onClick={handleSubmit}
                disabled={createBlogMutation.isPending}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0"
              >
                {createBlogMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            <Card className="bg-white/10 backdrop-blur-2xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Title *
                  </label>
                  <Input
                    value={formData.title || ""}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter your blog post title..."
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    URL Slug
                  </label>
                  <Input
                    value={formData.slug || ""}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="auto-generated-from-title"
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Excerpt
                  </label>
                  <Textarea
                    value={formData.excerpt || ""}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    placeholder="Brief description of your blog post..."
                    rows={3}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Content *
                  </label>
                  <Textarea
                    value={formData.content || ""}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Write your blog post content in Markdown..."
                    rows={20}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Supports Markdown formatting. Use ![Alt text](image-url) for images.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Image Upload */}
            <Card className="bg-white/10 backdrop-blur-2xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BlogImageUploader
                  onImageUploaded={handleImageUploaded}
                  multiple={true}
                  maxFiles={10}
                  label="Upload Images"
                />
                
                {Array.isArray(formData.images) && formData.images.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-300 mb-2">Uploaded Images:</p>
                    <div className="space-y-2">
                      {formData.images.map((imageUrl: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                          <img src={imageUrl} alt={`Upload ${index + 1}`} className="w-8 h-8 object-cover rounded" />
                          <span className="text-xs text-gray-400 flex-1 truncate">{imageUrl}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => insertImageToContent(imageUrl)}
                            className="text-blue-400 hover:text-blue-300 h-6 px-2"
                          >
                            Insert
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card className="bg-white/10 backdrop-blur-2xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Featured Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={formData.featuredImage || ""}
                  onChange={(e) => handleInputChange('featuredImage', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                />
                {formData.featuredImage && (
                  <div className="mt-3">
                    <img 
                      src={formData.featuredImage} 
                      alt="Featured" 
                      className="w-full aspect-video object-cover rounded-lg"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="bg-white/10 backdrop-blur-2xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} size="sm" className="bg-blue-500 hover:bg-blue-600">
                    Add
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(formData.tags) && formData.tags.map((tag: string, index: number) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card className="bg-white/10 backdrop-blur-2xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Status
                  </label>
                  <select
                    value={formData.status || "draft"}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-md px-3 py-2 text-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Language
                  </label>
                  <select
                    value={formData.language || "en"}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-md px-3 py-2 text-white"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}