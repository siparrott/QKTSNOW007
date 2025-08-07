import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SeoHead from "@/components/seo-head";
import { Calendar, Clock, Search, Tag, ArrowRight, BookOpen } from "lucide-react";
import type { BlogPost } from "@shared/schema";

export default function Blogs() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const { data: blogPosts = [], isLoading } = useQuery({
    queryKey: ["/api/blog-posts"],
  });

  // Filter blog posts based on search and tag
  const filteredPosts = blogPosts.filter((post: BlogPost) => {
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = !selectedTag || post.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  // Get all unique tags
  const allTags = Array.from(
    new Set(blogPosts.flatMap((post: BlogPost) => post.tags))
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
      <SeoHead
        title="Photography Blog | QuoteKit"
        description="Discover the latest insights, tips, and stories from the photography world. Professional photography tips, behind-the-scenes content, and industry insights."
        keywords="photography blog, photography tips, portrait photography, professional photography, QuoteKit blog"
        url="https://quotekit.ai/blogs"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Header Section */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="flex justify-center items-center gap-2 mb-4">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <h1 className="text-4xl font-bold text-gray-900">
                  Photography Blog
                </h1>
              </div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover professional photography insights, behind-the-scenes stories, 
                and expert tips to elevate your craft.
              </p>
            </div>

            {/* Search and Filter Section */}
            <div className="mt-12 max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search blog posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Tag Filter */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedTag === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTag(null)}
                  >
                    All Topics
                  </Button>
                  {allTags.slice(0, 5).map((tag) => (
                    <Button
                      key={tag}
                      variant={selectedTag === tag ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTag(tag)}
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-video rounded-t-lg"></div>
                  <div className="bg-white p-6 rounded-b-lg border border-t-0">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {searchQuery || selectedTag ? "No posts found" : "No blog posts yet"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || selectedTag 
                  ? "Try adjusting your search or filter criteria." 
                  : "Check back soon for the latest photography insights and tips."
                }
              </p>
              {(searchQuery || selectedTag) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedTag(null);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post: BlogPost) => (
                <Card key={post.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {post.featuredImage && (
                    <div className="aspect-video bg-gray-100 overflow-hidden">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(post.publishedAt || post.createdAt)}
                      {post.readTime && (
                        <>
                          <span className="mx-2">•</span>
                          <Clock className="w-4 h-4" />
                          {post.readTime} min read
                        </>
                      )}
                    </div>
                    
                    <CardTitle className="text-xl group-hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </CardTitle>
                    
                    <CardDescription className="line-clamp-3">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {post.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{post.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Read More Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="group/btn p-0 h-auto font-medium text-blue-600 hover:text-blue-700"
                      onClick={() => setLocation(`/blog/${post.slug}`)}
                    >
                      Read full article
                      <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Show More Button */}
          {filteredPosts.length > 0 && (
            <div className="text-center mt-12">
              <p className="text-gray-600 mb-4">
                Showing {filteredPosts.length} of {blogPosts.length} blog posts
              </p>
              {/* Future: Implement pagination or load more functionality */}
            </div>
          )}
        </div>

        {/* Newsletter Subscription Section */}
        <div className="bg-gray-50 border-t">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Stay Updated
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Get the latest photography tips and insights delivered to your inbox.
              </p>
              
              <div className="max-w-md mx-auto flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1"
                />
                <Button>Subscribe</Button>
              </div>
              
              <p className="text-sm text-gray-500 mt-3">
                No spam, unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}