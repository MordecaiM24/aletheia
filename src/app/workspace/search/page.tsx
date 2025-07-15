import { TrendingUp, Clock, FileText, Globe, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import SearchBar from "@/components/search/search-bar";

interface SearchPageProps {
  searchParams?: Promise<{
    query?: string;
  }>;
}

export default async function SearchPage(props: SearchPageProps) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";

  const results = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/search?query=${query}`,
  );
  const data = await results.json();
  console.log(data?.results?.length);
  console.log(data?.results?.map((r: any) => r.metadata.title));

  const recentSearches = [
    "gdpr data breach notification timeline",
    "sox section 404 internal controls",
    "iso 27001 risk assessment requirements",
  ];

  const suggestedSearches = [
    "gdpr data processing requirements",
    "sox section 404 compliance checklist",
    "fda device classification guidelines",
    "iso 27001 security controls",
    "hipaa data encryption standards",
    "pci dss network segmentation",
  ];

  const popularTopics = [
    "Data Privacy",
    "Financial Compliance",
    "Medical Devices",
    "Cybersecurity",
    "Environmental",
    "Healthcare",
    "Banking",
  ];

  const stats = [
    { icon: FileText, label: "Documents", value: "1,247" },
    { icon: Globe, label: "Jurisdictions", value: "15+" },
    { icon: Calendar, label: "Last Updated", value: "Yesterday" },
  ];

  return (
    <SidebarInset>
      <SiteHeader title="Search" />
      {!query && (
        <div className="mx-auto max-w-4xl space-y-8 p-6">
          {/* Hero Section */}
          <div className="space-y-6 py-8 text-center">
            {/* Main Search Bar */}
            <SearchBar />

            {/* Stats */}
            <div className="flex justify-center gap-8 pt-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="text-muted-foreground flex items-center gap-2 text-sm"
                >
                  <stat.icon className="h-4 w-4" />
                  <span className="text-foreground font-medium">
                    {stat.value}
                  </span>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5" />
                    Recent Searches
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentSearches.map((search, idx) => (
                    <a
                      key={idx}
                      href={`?query=${encodeURIComponent(search)}`}
                      className="hover:bg-accent block w-full rounded-lg border p-3 text-left transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="text-muted-foreground h-4 w-4" />
                        <span className="text-sm">{search}</span>
                      </div>
                    </a>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Suggested Searches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5" />
                  Try Searching For
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestedSearches.slice(0, 3).map((search, idx) => (
                  <a
                    key={idx}
                    href={`?query=${encodeURIComponent(search)}`}
                    className="hover:bg-accent block w-full rounded-lg border p-3 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="text-muted-foreground h-4 w-4" />
                      <span className="text-sm">{search}</span>
                    </div>
                  </a>
                ))}

                {/* Show more button */}
                <details className="group">
                  <summary className="text-muted-foreground hover:text-foreground cursor-pointer py-2 text-sm">
                    Show more suggestions...
                  </summary>
                  <div className="space-y-3 pt-2">
                    {suggestedSearches.slice(3).map((search, idx) => (
                      <a
                        key={idx + 3}
                        href={`?query=${encodeURIComponent(search)}`}
                        className="hover:bg-accent block w-full rounded-lg border p-3 text-left transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="text-muted-foreground h-4 w-4" />
                          <span className="text-sm">{search}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </details>
              </CardContent>
            </Card>
          </div>

          {/* Popular Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Popular Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {popularTopics.map((topic) => (
                  <a
                    key={topic}
                    href={`?query=${encodeURIComponent(topic.toLowerCase())}`}
                  >
                    <Badge
                      variant="secondary"
                      className="hover:bg-secondary/80 cursor-pointer px-3 py-1 transition-colors"
                    >
                      {topic}
                    </Badge>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {query && <div className="mx-auto max-w-4xl space-y-8 p-6">{query}</div>}
    </SidebarInset>
  );
}
