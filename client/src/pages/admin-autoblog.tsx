import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UploadDropzone } from "@/components/ui/upload-dropzone";
import { 
  Upload, 
  Wand2, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  Globe, 
  Hash, 
  Clock,
  CheckCircle,
  XCircle,
  BookOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { BlogPost } from "@shared/schema";

interface BlogGenerationRequest {
  images: File[];
  contentGuidance: string;
  language: string;
  websiteUrl: string;
  customSlug?: string;
}

export default function AdminAutoBlog() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [contentGuidance, setContentGuidance] = useState("");
  const [language, setLanguage] = useState("en");
  const [websiteUrl, setWebsiteUrl] = useState("https://quotekit.ai");
  const [customSlug, setCustomSlug] = useState("");
  const [publishingOption, setPublishingOption] = useState("draft");
  const [scheduledDate, setScheduledDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all blog posts
  const { data: blogPosts = [], isLoading: isLoadingPosts } = useQuery({
    queryKey: ["/api/admin/blog-posts"],
  });

  // Generate blog post mutation
  const generateBlogMutation = useMutation({
    mutationFn: async (request: BlogGenerationRequest) => {
      setIsGenerating(true);
      
      // Convert files to base64
      const base64Images: string[] = [];
      for (const file of request.images) {
        const base64 = await fileToBase64(file);
        base64Images.push(base64.split(',')[1]); // Remove data:image/jpeg;base64, prefix
      }

      return apiRequest("/api/admin/blog-posts/generate", {
        method: "POST",
        body: {
          images: base64Images,
          contentGuidance: request.contentGuidance,
          language: request.language,
          websiteUrl: request.websiteUrl,
          customSlug: request.customSlug,
        },
      });
    },
    onSuccess: (data) => {
      setPreviewPost(data);
      setIsGenerating(false);
      toast({
        title: "Blog post generated!",
        description: "Review your AI-generated blog post below.",
      });
    },
    onError: (error) => {
      setIsGenerating(false);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate blog post",
        variant: "destructive",
      });
    },
  });

  // Publish blog post mutation
  const publishBlogMutation = useMutation({
    mutationFn: async (data: { 
      blogPost: BlogPost; 
      publishingOption: string; 
      scheduledDate?: string 
    }) => {
      const status = data.publishingOption === "publish" ? "published" : 
                    data.publishingOption === "schedule" ? "scheduled" : "draft";
      
      return apiRequest("/api/admin/blog-posts", {
        method: "POST",
        body: {
          ...data.blogPost,
          status,
          scheduledFor: data.scheduledDate ? new Date(data.scheduledDate) : null,
          publishedAt: status === "published" ? new Date() : null,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog-posts"] });
      setPreviewPost(null);
      resetForm();
      toast({
        title: "Blog post saved!",
        description: "Your blog post has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Save failed",
        description: error.message || "Failed to save blog post",
        variant: "destructive",
      });
    },
  });

  // Update blog post mutation
  const updateBlogMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BlogPost> }) => {
      return apiRequest(`/api/admin/blog-posts/${id}`, {
        method: "PATCH",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog-posts"] });
      toast({
        title: "Blog post updated!",
        description: "Changes saved successfully.",
      });
    },
  });

  // Delete blog post mutation
  const deleteBlogMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/admin/blog-posts/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog-posts"] });
      toast({
        title: "Blog post deleted",
        description: "The blog post has been removed.",
      });
    },
  });

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const resetForm = () => {
    setSelectedFiles([]);
    setContentGuidance("");
    setCustomSlug("");
    setPublishingOption("draft");
    setScheduledDate("");
  };

  const handleGenerate = () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No images selected",
        description: "Please select at least one image to generate content.",
        variant: "destructive",
      });
      return;
    }

    if (!contentGuidance.trim()) {
      toast({
        title: "Content guidance required",
        description: "Please provide some context about what you want to write about.",
        variant: "destructive",
      });
      return;
    }

    generateBlogMutation.mutate({
      images: selectedFiles,
      contentGuidance,
      language,
      websiteUrl,
      customSlug,
    });
  };

  const handlePublish = () => {
    if (!previewPost) return;

    publishBlogMutation.mutate({
      blogPost: previewPost,
      publishingOption,
      scheduledDate,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Published</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Scheduled</Badge>;
      case "draft":
        return <Badge variant="secondary"><Edit className="w-3 h-3 mr-1" />Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI AutoBlog</h1>
          <p className="text-muted-foreground">
            Generate professional blog content using TONINJA assistant
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Wand2 className="w-4 h-4 mr-1" />
          Powered by GPT-4o Vision
        </Badge>
      </div>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generator">AutoBlog Generator</TabsTrigger>
          <TabsTrigger value="posts">Manage Posts</TabsTrigger>
        </TabsList>

        {/* Blog Generator Tab */}
        <TabsContent value="generator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Generation Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Generate Blog Post
                </CardTitle>
                <CardDescription>
                  Upload up to 3 images from your photography session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Image Upload */}
                <div>
                  <Label htmlFor="images" className="text-sm font-medium">
                    Session Images *
                  </Label>
                  <div className="mt-2">
                    <UploadDropzone
                      onFileUpload={setSelectedFiles}
                      maxFiles={3}
                      className="border-dashed border-2 border-gray-300 rounded-lg p-4"
                    />
                  </div>
                </div>

                {/* Content Guidance */}
                <div>
                  <Label htmlFor="guidance" className="text-sm font-medium">
                    Content Guidance (Optional)
                  </Label>
                  <Textarea
                    id="guidance"
                    placeholder="Tell the AI about this session, e.g., 'This was a family portrait session in Schönbrunn Park during golden hour...'"
                    value={contentGuidance}
                    onChange={(e) => setContentGuidance(e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                </div>

                {/* Language Selection */}
                <div>
                  <Label htmlFor="language" className="text-sm font-medium">
                    Content Language
                  </Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="de">Deutsch (German)</SelectItem>
                      <SelectItem value="es">Español (Spanish)</SelectItem>
                      <SelectItem value="fr">Français (French)</SelectItem>
                      <SelectItem value="it">Italiano (Italian)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Website URL */}
                <div>
                  <Label htmlFor="website" className="text-sm font-medium">
                    Website URL (for brand voice)
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://www.newagefotografie.com"
                    className="mt-1"
                  />
                </div>

                {/* Custom URL Slug */}
                <div>
                  <Label htmlFor="slug" className="text-sm font-medium">
                    Custom URL Slug (Optional)
                  </Label>
                  <Input
                    id="slug"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value)}
                    placeholder="e.g., my-custom-blog-post-url"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    * If specified, this exact slug will be used instead of auto-generating one from the title
                  </p>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || selectedFiles.length === 0}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Blog Post...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Blog Post
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Preview/Publishing Panel */}
            {previewPost && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Blog Preview
                  </CardTitle>
                  <CardDescription>
                    Review and publish your AI-generated content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{previewPost.title}</h3>
                      <p className="text-sm text-muted-foreground">{previewPost.excerpt}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {previewPost.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <Hash className="w-3 h-3 mr-1" />{tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {previewPost.readTime} min read
                    </div>
                  </div>

                  {/* Publishing Options */}
                  <div className="border-t pt-4 space-y-4">
                    <div>
                      <Label htmlFor="publishing" className="text-sm font-medium">
                        Publishing Options
                      </Label>
                      <Select value={publishingOption} onValueChange={setPublishingOption}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Save as Draft</SelectItem>
                          <SelectItem value="publish">Publish Immediately</SelectItem>
                          <SelectItem value="schedule">Schedule for Later</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {publishingOption === "schedule" && (
                      <div>
                        <Label htmlFor="scheduled" className="text-sm font-medium">
                          Schedule Date & Time
                        </Label>
                        <Input
                          id="scheduled"
                          type="datetime-local"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    )}

                    <Button
                      onClick={handlePublish}
                      disabled={publishBlogMutation.isPending}
                      className="w-full"
                    >
                      {publishBlogMutation.isPending ? (
                        "Saving..."
                      ) : publishingOption === "publish" ? (
                        "Publish Blog Post"
                      ) : publishingOption === "schedule" ? (
                        "Schedule Blog Post"
                      ) : (
                        "Save as Draft"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Manage Posts Tab */}
        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Blog Posts
              </CardTitle>
              <CardDescription>
                Manage your published and draft blog posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPosts ? (
                <div className="text-center py-8">Loading blog posts...</div>
              ) : blogPosts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No blog posts yet. Generate your first post using the AutoBlog Generator.
                </div>
              ) : (
                <div className="space-y-4">
                  {blogPosts.map((post: BlogPost) => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{post.title}</h3>
                          {getStatusBadge(post.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{post.excerpt}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                          <span>
                            <Clock className="w-3 h-3 inline mr-1" />
                            {post.readTime} min read
                          </span>
                          <span>
                            <Globe className="w-3 h-3 inline mr-1" />
                            /{post.slug}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateBlogMutation.mutate({
                            id: post.id,
                            data: { 
                              status: post.status === "published" ? "draft" : "published",
                              publishedAt: post.status === "draft" ? new Date() : null
                            }
                          })}
                        >
                          {post.status === "published" ? "Unpublish" : "Publish"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteBlogMutation.mutate(post.id)}
                          disabled={deleteBlogMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}