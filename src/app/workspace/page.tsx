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
import { DashboardSearch } from "./dashboard-search";
import Link from "next/link";

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
              <Search className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <DashboardSearch />
        </Card>

        <div className="p-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card className="gap-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Recent Searches
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-full">
                    {recentSearches.length > 0 ? (
                      <div className="space-y-2">
                        {recentSearches.slice(0, 3).map((search, idx) => (
                          <div
                            key={idx}
                            className="hover:bg-accent flex cursor-pointer items-start justify-between rounded-lg border p-3"
                          >
                            <div className="flex-1">
                              <p className="line-clamp-2 text-sm font-medium">
                                {search.query}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-muted-foreground text-xs">
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
                      <div className="flex h-full flex-col items-center justify-between">
                        <p className="text-muted-foreground py-4">
                          Start searching to see your recent searches!
                        </p>
                        <Link href="/workspace/search">New Search</Link>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="gap-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Recent Chats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-full">
                    {recentChats.length > 0 ? (
                      <div className="space-y-2">
                        {recentChats.slice(0, 3).map((chat, idx) => (
                          <div
                            key={idx}
                            className="hover:bg-accent flex cursor-pointer items-start justify-between rounded-lg border p-3"
                          >
                            <div className="flex-1">
                              <p className="line-clamp-2 text-sm font-medium">
                                {chat.title}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-muted-foreground text-xs">
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
                      <div className="flex h-full flex-col items-center justify-between">
                        <p className="text-muted-foreground py-4">
                          Start chatting to see your recent chats!
                        </p>
                        <Link href="/workspace/chat">New Chat</Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Recently Viewed Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentDocs.length > 0 ? (
                      recentDocs.map((doc, idx) => (
                        <div
                          key={idx}
                          className="hover:bg-accent flex cursor-pointer items-center justify-between rounded-lg border p-3"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="text-muted-foreground h-5 w-5" />
                            <div>
                              <p className="text-sm font-medium">{doc.title}</p>
                              <p className="text-muted-foreground text-xs">
                                {doc.type}
                              </p>
                            </div>
                          </div>
                          <span className="text-muted-foreground text-xs">
                            {doc.accessed}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="flex h-full items-center justify-center">
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
                    <Star className="h-5 w-5" />
                    Pinned Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pinnedItems.length > 0 ? (
                    pinnedItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="hover:bg-accent flex cursor-pointer items-center gap-3 rounded-lg p-2"
                      >
                        <span className="text-sm font-medium">
                          {item.title}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex h-full items-center justify-center">
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
                    <Bell className="h-5 w-5" />
                    Recent Updates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notifications.length > 0 ? (
                    <div className="space-y-2">
                      {notifications.map((notif, idx) => (
                        <div
                          key={idx}
                          className="space-y-1 rounded-lg border p-3"
                        >
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-medium">{notif.title}</p>
                            <AlertCircle className="mt-0.5 h-4 w-4 text-orange-500" />
                          </div>
                          <p className="text-muted-foreground line-clamp-2 text-xs">
                            {notif.description}
                          </p>
                          <span className="text-muted-foreground text-xs">
                            {notif.time}
                          </span>
                        </div>
                      ))}
                      <Button variant="ghost" className="w-full text-sm">
                        View All Updates
                      </Button>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center">
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
                    <TrendingUp className="h-5 w-5" />
                    This Month
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {usageStats.length > 0 ? (
                    usageStats.map((stat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between"
                      >
                        <span className="text-muted-foreground text-sm">
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
                    <div className="flex h-full items-center justify-center">
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
