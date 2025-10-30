"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Flag, Plus, MessageSquare, TrendingUp, 
  MapPin, User, Clock, Filter, Star
} from "lucide-react";
import { 
  MOCK_VOICE_POSTS, 
  getVoicePosts, 
  getUniqueLocations, 
  getUniqueTags,
  getTrendingCount,
  type VoicePost 
} from "@/lib/mock-data/voice-posts";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function RealTimeFeedView() {
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [showTrendingOnly, setShowTrendingOnly] = useState(false);

  // Get filtered posts
  const posts = getVoicePosts({
    location: locationFilter || undefined,
    tag: tagFilter || undefined,
    trendingOnly: showTrendingOnly
  });

  const locations = getUniqueLocations();
  const tags = getUniqueTags();
  const trendingCount = getTrendingCount();

  const getActionTypeColor = (type: VoicePost['actionType']) => {
    switch (type) {
      case 'issue': return 'text-red-600 dark:text-red-400';
      case 'positive': return 'text-green-600 dark:text-green-400';
      case 'observation': return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getActionTypeIcon = (type: VoicePost['actionType']) => {
    switch (type) {
      case 'issue': return '🔴';
      case 'positive': return '🎉';
      case 'observation': return '💡';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    return `${Math.floor(hours / 24)} day${Math.floor(hours / 24) !== 1 ? 's' : ''} ago`;
  };

  const handleFlagIssue = (post: VoicePost) => {
    toast.success('Issue flagged', {
      description: 'Management has been notified'
    });
  };

  const handleAddToForm = (post: VoicePost) => {
    // For demo, just show toast
    // In production, would open modal to select form and add question
    toast.success('Added to form suggestions', {
      description: 'Review in form builder to approve'
    });
  };

  const handleReply = (post: VoicePost) => {
    toast.info('Reply feature', {
      description: 'Coming soon: respond to team insights'
    });
  };

  const handleRecognize = (post: VoicePost) => {
    toast.success('Recognition sent!', {
      description: `Positive feedback shared with ${post.inspector}`
    });
  };

  const clearFilters = () => {
    setLocationFilter(null);
    setTagFilter(null);
    setShowTrendingOnly(false);
  };

  const activeFilterCount = [locationFilter, tagFilter, showTrendingOnly].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Voice Insights Feed</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time observations from {locations.length} locations
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {/* Trending Filter */}
          <Button
            variant={showTrendingOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowTrendingOnly(!showTrendingOnly)}
            className={showTrendingOnly ? "bg-orange-500 hover:bg-orange-600" : ""}
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            Trending ({trendingCount})
          </Button>

          {/* Location Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MapPin className="h-4 w-4 mr-1" />
                {locationFilter || 'All Locations'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setLocationFilter(null)}>
                All Locations
              </DropdownMenuItem>
              {locations.map((loc) => (
                <DropdownMenuItem key={loc} onClick={() => setLocationFilter(loc)}>
                  {loc}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Tag Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                {tagFilter || 'All Tags'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setTagFilter(null)}>
                All Tags
              </DropdownMenuItem>
              {tags.map((tag) => (
                <DropdownMenuItem key={tag} onClick={() => setTagFilter(tag)}>
                  #{tag}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear ({activeFilterCount})
            </Button>
          )}
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No posts found matching your filters</p>
            <Button variant="link" onClick={clearFilters} className="mt-2">
              Clear filters
            </Button>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="p-5 hover:shadow-lg hover:border-[#c4dfc4]/30 transition-all duration-200">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c4dfc4] to-[#c8e0f5] flex items-center justify-center">
                      <User className="h-5 w-5 text-[#0a0a0a]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{post.inspector}</span>
                      <Badge variant="outline" className="text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        {post.location}
                      </Badge>
                      {post.area && (
                        <span className="text-sm text-gray-500">· {post.area}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(post.timestamp)}
                    </div>
                  </div>
                </div>
                {post.isTrending && (
                  <Badge variant="destructive" className="bg-orange-500">
                    🔥 Trending
                  </Badge>
                )}
              </div>

              {/* Quote */}
              <div className={`p-4 rounded-lg border-l-4 bg-gray-50 dark:bg-gray-900/50 mb-3 ${
                post.actionType === 'issue' ? 'border-red-500' :
                post.actionType === 'positive' ? 'border-green-500' :
                'border-blue-500'
              }`}>
                <p className={`text-sm leading-relaxed ${getActionTypeColor(post.actionType)}`}>
                  <span className="mr-2">{getActionTypeIcon(post.actionType)}</span>
                  "{post.quote}"
                </p>
              </div>

              {/* Tags and Similar Count */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {post.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs cursor-pointer hover:bg-[#c4dfc4] hover:text-[#0a0a0a] dark:hover:bg-[#c4dfc4] dark:hover:text-[#0a0a0a] transition-colors"
                      onClick={() => setTagFilter(tag)}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
                {post.similarCount > 1 && (
                  <Badge variant="outline" className="text-xs font-medium">
                    💡 {post.similarCount} similar {post.similarCount === 1 ? 'mention' : 'mentions'}
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t">
                {post.actionType === 'issue' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFlagIssue(post)}
                      className="flex-1"
                    >
                      <Flag className="h-3 w-3 mr-1" />
                      Flag Issue
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddToForm(post)}
                      className="flex-1"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add to Form
                    </Button>
                  </>
                )}
                {post.actionType === 'positive' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRecognize(post)}
                    className="flex-1"
                  >
                    <Star className="h-3 w-3 mr-1" />
                    Recognize
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReply(post)}
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

