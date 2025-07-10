import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SidebarInset } from "@/components/ui/sidebar";
import {
  Notification,
  PinnedItem,
  RecentChat,
  RecentDoc,
  RecentSearch,
  UsageStat,
} from "@/types/types";
import { auth } from "@clerk/nextjs/server";
import {
  AlertCircle,
  Bell,
  BookOpen,
  Clock,
  FileText,
  MessageSquare,
  Search,
  Star,
  TrendingUp,
} from "lucide-react";
import { redirect } from "next/navigation";

export default async function Home() {
  const recentSearches: RecentSearch[] = [];
  const recentChats: RecentChat[] = [];
  const recentDocs: RecentDoc[] = [];
  const pinnedItems: PinnedItem[] = [];
  const notifications: Notification[] = [];
  const usageStats: UsageStat[] = [];

  const { userId, orgId } = await auth();
  if (!userId && !orgId) {
    redirect("/sign-in");
  }

  if (userId && !orgId) {
    redirect("/org");
  }

  return (
    <SidebarInset>
      <SiteHeader title="Dashboard" />
      <div className="flex flex-1 flex-col p-4">
        <Card className="border-none shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search regulations, requirements, guidance..."
                  className="w-full"
                />
              </div>
              <Button>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                New Chat
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Browse Documents
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="gap-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Recent Searches
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-full">
                    {recentSearches.length > 0 ? (
                      <div className="space-y-2">
                        {recentSearches.slice(0, 3).map((search, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-start p-3 rounded-lg border hover:bg-accent cursor-pointer"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-sm line-clamp-2">
                                {search.query}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">
                                  {search.timestamp}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {search.results} results
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                        <Button variant="ghost" className="w-full text-sm">
                          View All Searches
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-between h-full">
                        <p className="text-muted-foreground py-4">
                          Start searching to see your recent searches!
                        </p>
                        <Button variant="default" className="w-full text-sm">
                          New Search
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="gap-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Recent Chats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-full">
                    {recentChats.length > 0 ? (
                      <div className="space-y-2">
                        {recentChats.slice(0, 3).map((chat, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-start p-3 rounded-lg border hover:bg-accent cursor-pointer"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-sm line-clamp-2">
                                {chat.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">
                                  {chat.timestamp}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {chat.messages} messages
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                        <Button variant="ghost" className="w-full text-sm">
                          View All Chats
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-between h-full">
                        <p className="text-muted-foreground py-4">
                          Start chatting to see your recent chats!
                        </p>
                        <Button variant="default" className="w-full text-sm">
                          New Chat
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Recently Viewed Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentDocs.length > 0 ? (
                      recentDocs.map((doc, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-3 rounded-lg border hover:bg-accent cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">{doc.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {doc.type}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {doc.accessed}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-center items-center h-full">
                        <p className="text-muted-foreground">
                          Start browsing to see your recent documents!
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Pinned Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pinnedItems.length > 0 ? (
                    pinnedItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
                      >
                        <span className="text-sm font-medium">
                          {item.title}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-center items-center h-full">
                      <p className="text-muted-foreground">
                        Start pinning items to see your pinned items!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Recent Updates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notifications.length > 0 ? (
                    <div className="space-y-2">
                      {notifications.map((notif, idx) => (
                        <div
                          key={idx}
                          className="space-y-1 p-3 rounded-lg border"
                        >
                          <div className="flex items-start justify-between">
                            <p className="font-medium text-sm">{notif.title}</p>
                            <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notif.description}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {notif.time}
                          </span>
                        </div>
                      ))}
                      <Button variant="ghost" className="w-full text-sm">
                        View All Updates
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-full">
                      <p className="text-muted-foreground">
                        Start updating to see your recent updates!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    This Month
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {usageStats.length > 0 ? (
                    usageStats.map((stat, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm text-muted-foreground">
                          {stat.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{stat.value}</span>
                          <Badge variant="secondary" className="text-xs">
                            {stat.change}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-center items-center h-full">
                      <p className="text-muted-foreground">
                        Start using to see your usage stats!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
