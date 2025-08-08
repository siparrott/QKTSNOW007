import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SeoHead from "@/components/seo-head";
import SharedHeader from "@/components/shared-header";
import { 
  Calendar, 
  Clock, 
  Search, 
  Tag, 
  ArrowRight, 
  BookOpen, 
  Sparkles,
  Zap,
  TrendingUp,
  Filter,
  Grid,
  List,
  Eye,
  Share2,
  ChevronRight,
  Layers,
  Cpu,
  Brain
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { BlogPost } from "@shared/schema";

export default function Blogs() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mounted, setMounted] = useState(false);

  const { data: blogPosts = [], isLoading, error } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog-posts"],
  });

  // Debug logging
  console.log('Blog query state:', { 
    isLoading, 
    postsCount: blogPosts.length, 
    error: error?.message,
    posts: blogPosts.slice(0, 2).map(p => ({ id: p.id, title: p.title }))
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter blog posts based on search and tag
  const filteredPosts = blogPosts.filter((post: BlogPost) => {
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = !selectedTag || (post.tags && post.tags.includes(selectedTag));
    
    return matchesSearch && matchesTag;
  });

  // Get all unique tags
  const allTags = Array.from(
    new Set(blogPosts.flatMap((post: BlogPost) => post.tags || []))
  ).sort();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <>
      <SharedHeader />
      <SeoHead
        title="AI Quote Calculator Blog | QuoteKit"
        description="Discover the latest insights on AI-powered pricing tools, quote generators, and business automation. Expert tips for photographers, contractors, and service professionals."
        keywords="ai quote calculator blog, pricing tools, quote generators, business automation, service professionals"
        url="https://quotekit.ai/blogs"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-600/30 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-600/30 blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-600/20 blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23ffffff' fill-opacity='0.4'%3e%3cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
          }}
        ></div>
        {/* Header Section */}
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex justify-center items-center gap-4 mb-8"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-60"></div>
                  <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-purple-200">
                  AI Blog
                </h1>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full blur-xl opacity-60"></div>
                  <div className="relative bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-2xl">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </div>
              </motion.div>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8"
              >
                Discover cutting-edge AI-generated photography insights, behind-the-scenes stories, 
                and expert tips crafted by advanced vision intelligence.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-wrap justify-center gap-4 mb-12"
              >
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-white">AI-Powered</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-white">Vision Analysis</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-white">Expert Insights</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Search and Filter Section */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="max-w-6xl mx-auto"
            >
              <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8">
                <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                  {/* Search */}
                  <div className="relative flex-1 max-w-lg">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Search AI-generated insights..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 pr-4 py-4 bg-white/10 border-white/20 rounded-2xl text-white placeholder:text-gray-400 focus:bg-white/20 transition-all duration-300"
                    />
                  </div>

                  {/* View Toggle */}
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-2xl p-1 border border-white/20">
                    <Button
                      variant={viewMode === 'grid' ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="rounded-xl"
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-xl"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Tag Filter */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant={selectedTag === null ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTag(null)}
                      className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0"
                    >
                      <Filter className="w-3 h-3 mr-2" />
                      All Topics
                    </Button>
                    {allTags.slice(0, 4).map((tag) => (
                      <Button
                        key={tag}
                        variant={selectedTag === tag ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTag(tag)}
                        className="rounded-full border-white/20 hover:bg-white/10 text-white"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          {isLoading ? (
            <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {[...Array(6)].map((_, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group relative overflow-hidden rounded-3xl"
                >
                  <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/10 p-8 h-full">
                    <div className="animate-pulse">
                      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 aspect-video rounded-2xl mb-6"></div>
                      <div className="space-y-4">
                        <div className="h-4 bg-gradient-to-r from-white/20 to-white/10 rounded-full"></div>
                        <div className="h-4 bg-gradient-to-r from-white/20 to-white/10 rounded-full w-3/4"></div>
                        <div className="h-3 bg-gradient-to-r from-white/20 to-white/10 rounded-full w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-20"
            >
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full blur-3xl"></div>
                <div className="relative bg-gradient-to-r from-blue-500/10 to-purple-600/10 backdrop-blur-2xl rounded-3xl p-12 border border-white/10">
                  <Brain className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {searchQuery || selectedTag ? "No posts found" : "AI Blog Library Loading"}
                  </h3>
                  <p className="text-gray-300 mb-8 max-w-md mx-auto">
                    {searchQuery || selectedTag 
                      ? "Try adjusting your search or filter criteria to discover more AI-generated content." 
                      : `Found ${blogPosts.length} blog posts. Loading...`
                    }
                  </p>
                  <p className="text-gray-400 text-sm">
                    Debug: isLoading={isLoading.toString()}, posts={blogPosts.length}, filtered={filteredPosts.length}
                  </p>
                  {(searchQuery || selectedTag) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedTag(null);
                      }}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 text-white hover:from-blue-600 hover:to-purple-700 rounded-full px-8 py-3"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div 
                key={viewMode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 max-w-4xl mx-auto'}`}
              >
                {filteredPosts.map((post: BlogPost, index: number) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group relative overflow-hidden rounded-3xl cursor-pointer"
                    onClick={() => setLocation(`/blog/${post.slug}`)}
                  >
                    {/* Glassmorphism Card */}
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/10 p-8 h-full relative overflow-hidden group-hover:from-white/20 group-hover:to-white/10 transition-all duration-500">
                      
                      {/* Hover Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-600/0 group-hover:from-blue-500/10 group-hover:to-purple-600/10 transition-all duration-500"></div>
                      
                      {/* Featured Image */}
                      {post.featuredImage && (
                        <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl overflow-hidden mb-6 relative">
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                          
                          {/* AI Badge */}
                          <div className="absolute top-4 right-4">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20">
                              <div className="flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-white" />
                                <span className="text-xs font-medium text-white">AI Generated</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="relative z-10">
                        {/* Meta Info */}
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {post.publishedAt ? formatDate(typeof post.publishedAt === 'string' ? post.publishedAt : post.publishedAt.toISOString()) : 
                             post.createdAt ? formatDate(typeof post.createdAt === 'string' ? post.createdAt : post.createdAt.toISOString()) : 
                             formatDate(new Date().toISOString())}
                          </div>
                          {post.readTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {post.readTime} min read
                            </div>
                          )}
                          <div className="flex items-center gap-1 ml-auto">
                            <Eye className="w-4 h-4" />
                            <span className="text-xs">AI Vision</span>
                          </div>
                        </div>
                        
                        {/* Title */}
                        <h3 className={`font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300 ${viewMode === 'grid' ? 'text-xl line-clamp-2' : 'text-2xl'}`}>
                          {post.title}
                        </h3>
                        
                        {/* Excerpt */}
                        <p className={`text-gray-300 mb-6 leading-relaxed ${viewMode === 'grid' ? 'line-clamp-3' : 'line-clamp-2'}`}>
                          {post.excerpt}
                        </p>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {(post.tags || []).slice(0, viewMode === 'grid' ? 3 : 5).map((tag, tagIndex) => (
                              <Badge 
                                key={tagIndex} 
                                variant="secondary" 
                                className="text-xs bg-white/10 text-white border-white/20 hover:bg-white/20 transition-colors"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {(post.tags || []).length > (viewMode === 'grid' ? 3 : 5) && (
                              <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                                +{(post.tags || []).length - (viewMode === 'grid' ? 3 : 5)} more
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Action Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <Layers className="w-4 h-4" />
                              <span>Deep Analysis</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Share functionality
                              }}
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                            
                            <div className="flex items-center gap-1 text-blue-400 font-medium group-hover:text-purple-400 transition-colors">
                              <span className="text-sm">Read More</span>
                              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Stats Section */}
          {filteredPosts.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-center mt-16"
            >
              <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 max-w-2xl mx-auto">
                <div className="grid grid-cols-3 gap-8">
                  <div>
                    <div className="text-3xl font-bold text-white mb-2">{filteredPosts.length}</div>
                    <div className="text-sm text-gray-400">AI Posts</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white mb-2">{blogPosts.length}</div>
                    <div className="text-sm text-gray-400">Total Articles</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white mb-2">{allTags.length}</div>
                    <div className="text-sm text-gray-400">Topics</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Newsletter Subscription Section */}
        <div className="relative z-10 border-t border-white/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-12 max-w-4xl mx-auto relative overflow-hidden">
                
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-3xl"></div>
                
                <div className="relative z-10">
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-60"></div>
                      <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-full">
                        <Zap className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <h2 className="text-4xl font-bold text-white mb-4">
                    Stay in the AI Loop
                  </h2>
                  <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                    Get cutting-edge AI photography insights, vision analysis tips, and 
                    expert content delivered straight to your inbox.
                  </p>
                  
                  <div className="max-w-md mx-auto">
                    <div className="flex gap-3">
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        className="flex-1 bg-white/10 border-white/20 rounded-2xl text-white placeholder:text-gray-400 focus:bg-white/20 py-4 px-6"
                      />
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 rounded-2xl px-8 py-4">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Subscribe
                      </Button>
                    </div>
                    
                    <p className="text-sm text-gray-400 mt-4">
                      AI-powered content • No spam • Unsubscribe anytime
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}