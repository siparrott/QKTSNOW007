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

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug;

  const { data: post, isLoading, error } = useQuery({
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title || "Blog Post",
        url: window.location.href,
      });
    } else {
      // Fallback to copying URL to clipboard
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
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-600/30 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-600/30 blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-600/20 blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23ffffff' fill-opacity='0.4'%3e%3cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
          }}
        ></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          {/* Navigation */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <Link href="/blogs">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/10 border border-white/20 rounded-full backdrop-blur-md px-6 py-3"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to AI Blog
              </Button>
            </Link>
          </motion.div>

          {/* Article Container */}
          <motion.article 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden relative"
          >
            {/* Hero Image Section */}
            {post.featuredImage && (
              <div className="relative aspect-video bg-gradient-to-br from-blue-500/20 to-purple-600/20 overflow-hidden">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                {/* AI Badge */}
                <div className="absolute top-8 right-8">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-white" />
                      <span className="text-sm font-semibold text-white">AI Generated Content</span>
                    </div>
                  </div>
                </div>

                {/* Article Meta Overlay */}
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-white/80 mb-4">
                    <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
                      <Calendar className="w-4 h-4" />
                      {formatDate(post.publishedAt || post.createdAt)}
                    </div>
                    {post.readTime && (
                      <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
                        <Clock className="w-4 h-4" />
                        {post.readTime} min read
                      </div>
                    )}
                    <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
                      <Eye className="w-4 h-4" />
                      AI Vision Analysis
                    </div>
                  </div>
                  
                  <h1 className="text-3xl lg:text-5xl font-black text-white mb-4 leading-tight">
                    {post.title}
                  </h1>
                </div>
              </div>
            )}

            {/* Content Section */}
            <div className="p-8 lg:p-16">
              {/* Title (if no featured image) */}
              {!post.featuredImage && (
                <div className="mb-12">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8">
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
                    <div className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full px-3 py-1">
                      <Sparkles className="w-3 h-3 text-white" />
                      <span className="text-xs font-medium text-white">AI Generated</span>
                    </div>
                  </div>
                  
                  <h1 className="text-4xl lg:text-6xl font-black text-white mb-6 leading-tight">
                    {post.title}
                  </h1>
                </div>
              )}

              {/* Excerpt */}
              {post.excerpt && (
                <div className="mb-12">
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                    <div className="flex items-start gap-4">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">AI Analysis Summary</h3>
                        <p className="text-xl text-gray-300 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-6 mb-12 pb-8 border-b border-white/10">
                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-colors px-3 py-1 rounded-full"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Social Actions */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-3"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-3"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-3"
                  >
                    <Bookmark className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-3"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Article Content */}
              <div 
                className="prose prose-xl prose-invert max-w-none
                  prose-headings:text-white prose-headings:font-bold
                  prose-p:text-gray-300 prose-p:leading-relaxed prose-p:text-lg
                  prose-strong:text-white prose-strong:font-semibold
                  prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                  prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-500/10 prose-blockquote:backdrop-blur-sm prose-blockquote:p-6 prose-blockquote:rounded-r-2xl prose-blockquote:border-l-4
                  prose-code:bg-white/10 prose-code:text-blue-300 prose-code:px-2 prose-code:py-1 prose-code:rounded
                  prose-img:rounded-2xl prose-img:shadow-2xl
                  prose-ul:text-gray-300 prose-ol:text-gray-300
                  prose-li:text-gray-300
                  [&>*]:mb-6"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Website Attribution */}
              {post.websiteUrl && (
                <div className="mt-16 pt-8 border-t border-white/10">
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                      <div className="text-center lg:text-left">
                        <div className="flex items-center gap-3 mb-3 justify-center lg:justify-start">
                          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-full">
                            <Cpu className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-xl font-semibold text-white">
                            Explore Our AI Photography Services
                          </h3>
                        </div>
                        <p className="text-gray-300">
                          Discover our portfolio and experience cutting-edge AI-powered photography
                        </p>
                      </div>
                      <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 rounded-full px-8 py-4 text-white">
                        <a 
                          href={post.websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <Zap className="w-4 h-4" />
                          Visit Website
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.article>

          {/* Related Posts Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-20"
          >
            <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-12">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">More AI Insights</h2>
                </div>
                <p className="text-gray-300 max-w-2xl mx-auto">
                  Discover more cutting-edge AI-generated photography content and expert insights
                </p>
              </div>
              
              <div className="text-center">
                <Link href="/blogs">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 rounded-full px-8 py-4 text-white text-lg">
                    <Brain className="w-5 h-5 mr-2" />
                    Explore AI Blog
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}