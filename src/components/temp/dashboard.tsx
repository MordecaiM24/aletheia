import React from "react";
import {
  Search,
  MessageSquare,
  Upload,
  FileText,
  Star,
  Bell,
  TrendingUp,
  Clock,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const recentSearches = [
    {
      query: "GDPR article 6 processing",
      timestamp: "2 hours ago",
      results: 23,
    },
    {
      query: "SOX section 404 compliance requirements",
      timestamp: "1 day ago",
      results: 15,
    },
    {
      query: "FDA drug approval timeline",
      timestamp: "2 days ago",
      results: 41,
    },
  ];

  const recentChats = [
    {
      title: "GDPR Data Protection Impact Assessment",
      timestamp: "3 hours ago",
      messages: 12,
    },
    {
      title: "SOX Internal Controls Documentation",
      timestamp: "1 day ago",
      messages: 8,
    },
    {
      title: "ISO 27001 Security Framework",
      timestamp: "3 days ago",
      messages: 15,
    },
  ];

  const recentDocs = [
    {
      title: "General Data Protection Regulation (GDPR)",
      type: "EU Regulation",
      accessed: "Today",
    },
    {
      title: "Sarbanes-Oxley Act Section 404",
      type: "US Federal Law",
      accessed: "Yesterday",
    },
    {
      title: "21 CFR Part 820 - Quality System Regulation",
      type: "FDA Regulation",
      accessed: "2 days ago",
    },
  ];

  const pinnedItems = [
    { title: "GDPR Compliance Checklist", type: "saved_search", icon: Search },
    { title: "SOX 404 Implementation Guide", type: "document", icon: FileText },
    { title: "Data Breach Response Chat", type: "chat", icon: MessageSquare },
  ];

  const notifications = [
    {
      title: "New FDA Guidance Published",
      description: "Updated guidance on software validation requirements",
      time: "2 hours ago",
      type: "update",
    },
    {
      title: "GDPR Amendment Proposed",
      description: "EU Parliament proposes changes to Article 22",
      time: "1 day ago",
      type: "regulatory",
    },
    {
      title: "SOX Deadline Reminder",
      description: "Annual 404 assessment due in 30 days",
      time: "3 days ago",
      type: "deadline",
    },
  ];

  const usageStats = [
    { label: "Documents Searched", value: "247", change: "+12%" },
    { label: "Compliance Checks", value: "89", change: "+8%" },
    { label: "Chat Sessions", value: "156", change: "+23%" },
    { label: "Regulations Tracked", value: "34", change: "+2%" },
  ];

  return (
    <div className="p-6 space-y-6 mx-auto">
      {/* Quick Actions */}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Searches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Searches
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentSearches.map((search, idx) => (
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
              </CardContent>
            </Card>

            {/* Recent Chats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Recent Chats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentChats.map((chat, idx) => (
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
              </CardContent>
            </Card>
          </div>

          {/* Recent Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Recently Viewed Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentDocs.map((doc, idx) => (
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
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pinned Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Pinned Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pinnedItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
                >
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{item.title}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Recent Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.map((notif, idx) => (
                <div key={idx} className="space-y-1 p-3 rounded-lg border">
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
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {usageStats.map((stat, idx) => (
                <div key={idx} className="flex justify-between items-center">
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
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
