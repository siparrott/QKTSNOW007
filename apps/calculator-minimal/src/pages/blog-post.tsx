import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SeoHead from "@/components/seo-head";
import { 
  Calendar, 
  Clock, 
  ArrowLeft, 
  Share2, 
  BookOpen, 
  Tag,
  ExternalLink,
  Sparkles,
  Brain,
  Eye,
  Zap,
  Layers,
  ChevronLeft,
  ChevronRight,
  Copy,
  Twitter,
  Facebook,
  Linkedin,
  Heart,
  MessageCircle,
  Bookmark,
  TrendingUp,
  Cpu
} from "lucide-react";
import { motion } from "framer-motion";
import type { BlogPost } from "@shared/schema";

export default function BlogPostPage() {
  const [match, params] = useRoute("/blog/:slug");
  const slug = params?.slug;

  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: ["/api/blog-posts", slug],
    enabled: !!slug,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt || "",
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share cancelled or failed");
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-600/30 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-600/30 blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-12"
          >
            <div className="animate-pulse space-y-8">
              <div className="h-6 bg-gradient-to-r from-white/20 to-white/10 rounded-full w-32"></div>
              <div className="h-12 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl w-3/4"></div>
              <div className="h-6 bg-gradient-to-r from-white/20 to-white/10 rounded-full w-1/2"></div>
              <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-3xl"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gradient-to-r from-white/20 to-white/10 rounded-full"></div>
                <div className="h-4 bg-gradient-to-r from-white/20 to-white/10 rounded-full w-5/6"></div>
                <div className="h-4 bg-gradient-to-r from-white/20 to-white/10 rounded-full w-4/5"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <>
        <SeoHead
          title="Blog Post Not Found | QuoteKit"
          description="The requested blog post could not be found."
        />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-600/30 blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-600/30 blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-16 max-w-2xl mx-auto">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-600/20 rounded-full blur-3xl"></div>
                  <div className="relative bg-gradient-to-r from-red-500/10 to-pink-600/10 backdrop-blur-2xl rounded-3xl p-8">
                    <Brain className="w-20 h-20 text-gray-400 mx-auto" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">
                  AI Article Not Found
                </h1>
                <p className="text-gray-300 mb-10 leading-relaxed">
                  The AI-generated blog post you're looking for doesn't exist in our neural network or may have been archived.
                </p>
                <Link href="/blogs">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 rounded-full px-8 py-4 text-white">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to AI Blog
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SeoHead
        title={post.seoTitle || post.title}
        description={post.seoDescription || post.excerpt || ""}
        keywords={post.tags.join(", ")}
        url={`https://quotekit.ai/blog/${post.slug}`}
        type="article"
        image={post.featuredImage || undefined}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation */}
          <div className="mb-8">
            <Link href="/blogs">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>

          {/* Article Header */}
          <article className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {/* Featured Image */}
            {post.featuredImage && (
              <div className="aspect-video bg-gray-100 overflow-hidden">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-8 lg:p-12">
              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.publishedAt || post.createdAt)}
                </div>
                {post.readTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {post.readTime} min read
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="ml-auto"
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
              </div>

              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {post.title}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  {post.excerpt}
                </p>
              )}

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b">
                  <Tag className="w-4 h-4 text-gray-400 mr-2" />
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Article Content */}
              <div 
                className="prose prose-lg prose-gray max-w-none
                  prose-headings:text-gray-900 prose-headings:font-bold
                  prose-p:text-gray-700 prose-p:leading-relaxed
                  prose-strong:text-gray-900 prose-strong:font-semibold
                  prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                  prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:p-4 prose-blockquote:rounded-r
                  prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                  prose-img:rounded-lg prose-img:shadow-md
                  prose-ul:text-gray-700 prose-ol:text-gray-700"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Website Attribution */}
              {post.websiteUrl && (
                <div className="mt-12 pt-8 border-t">
                  <Card className="bg-gray-50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            Learn More About Our Photography Services
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Discover our portfolio and book your session
                          </p>
                        </div>
                        <Button asChild>
                          <a 
                            href={post.websiteUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            Visit Website
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </article>

          {/* Related Posts Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              More Photography Insights
            </h2>
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>More related posts coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}