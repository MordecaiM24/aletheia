"use client";

import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { FileText, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function DashboardSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/workspace/search?query=${query}`);
  };

  return (
    <CardContent className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search regulations, requirements, guidance..."
            className="w-full"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button type="submit" className="cursor-pointer">
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </form>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={() => router.push("/workspace/chat")}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          New Chat
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={() => router.push("/workspace/docs")}
        >
          <FileText className="mr-2 h-4 w-4" />
          Browse Documents
        </Button>
      </div>
    </CardContent>
  );
}
