"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useState, FormEvent } from "react";

interface SearchProps {
  placeholder?: string;
}

export default function SearchBar({
  placeholder = "Search for regulations, requirements, or ask a question...",
}: SearchProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [query, setQuery] = useState(
    searchParams.get("query")?.toString() || "",
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (query.trim()) {
      params.set("query", query.trim());
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform" />
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="py-5 pl-12 text-lg"
        />
        <Button
          type="submit"
          className="absolute top-[1px] right-[1px] transform cursor-pointer rounded-l-none py-5"
          disabled={!query.trim()}
        >
          Search
        </Button>
      </form>
    </div>
  );
}
