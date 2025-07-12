// app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SearchResult } from "@/types/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");
  const type = searchParams.get("type") || "documents";

  if (!query) {
    return NextResponse.json({ results: [], total: 0 });
  }

  // Mock search results
  const mockResults: SearchResult[] = [
    {
      id: "1",
      title: "General Data Protection Regulation (GDPR)",
      content:
        "Comprehensive data protection regulation covering processing of personal data within the European Union.",
      type: "document",
      source: "EU Regulation 2016/679",
      relevance: 95,
      metadata: {
        docType: "EU Regulation",
        jurisdiction: "EU",
        lastUpdated: "2024-01-15",
      },
    },
    {
      id: "2",
      title: "GDPR Article 6 - Lawfulness of processing",
      content:
        "Processing shall be lawful only if and to the extent that at least one of the following applies: (a) the data subject has given consent to the processing...",
      type: "passage",
      source: "General Data Protection Regulation (GDPR)",
      relevance: 92,
      metadata: {
        section: "Article 6",
        jurisdiction: "EU",
      },
    },
    {
      id: "3",
      title: "GDPR Data Processing Requirements",
      content:
        "Under the GDPR, data processing must meet several key requirements: lawful basis, transparency, purpose limitation, data minimization, and accuracy.",
      type: "answer",
      source: "AI Generated",
      relevance: 88,
      metadata: {
        jurisdiction: "EU",
      },
    },
    {
      id: "4",
      title: "GDPR Implementation Guidelines",
      content:
        "Company guidelines for GDPR compliance and data processing procedures.",
      type: "document",
      source: "Internal Document",
      relevance: 85,
      metadata: {
        docType: "Internal Document",
        lastUpdated: "2023-12-10",
      },
    },
    {
      id: "5",
      title: "Data Processing Principles",
      content:
        "Personal data shall be processed lawfully, fairly and in a transparent manner in relation to the data subject...",
      type: "passage",
      source: "General Data Protection Regulation (GDPR)",
      relevance: 82,
      metadata: {
        section: "Article 5",
        jurisdiction: "EU",
      },
    },
  ];

  // Filter results based on type
  let filteredResults = mockResults;
  if (type === "documents") {
    filteredResults = mockResults.filter((r) => r.type === "document");
  } else if (type === "passages") {
    filteredResults = mockResults.filter((r) => r.type === "passage");
  } else if (type === "answers") {
    filteredResults = mockResults.filter((r) => r.type === "answer");
  }

  return NextResponse.json({
    results: filteredResults,
    total: filteredResults.length,
  });
}
