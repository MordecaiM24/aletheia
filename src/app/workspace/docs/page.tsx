import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Doc } from "@/types/types";
import { DataTable } from "@/components/table/data-table";
import { columns } from "@/components/table/columns";

async function getData(): Promise<Doc[]> {
  return [
    {
      id: "1",
      title: "Document 1",
      sourceUrl: "https://www.google.com",
      docType: "pdf",
      createdAt: new Date(),
      updatedAt: new Date(),
      orgId: "1",
      userId: "1",
      filePath: "https://www.google.com",
      effectiveDate: new Date(),
      lastUpdated: new Date(),
      metadata: {},
    },
    {
      id: "2",
      title: "Document 2",
      sourceUrl: "https://www.google.com",
      docType: "pdf",
      createdAt: new Date(),
      updatedAt: new Date(),
      orgId: "1",
      userId: "1",
      filePath: "https://www.google.com",
      effectiveDate: new Date(),
      lastUpdated: new Date(),
      metadata: {},
    },
    {
      id: "3",
      title: "Document 3",
      sourceUrl: "https://www.google.com",
      docType: "pdf",
      createdAt: new Date(),
      updatedAt: new Date(),
      orgId: "1",
      userId: "1",
      filePath: "https://www.google.com",
      effectiveDate: new Date(),
      lastUpdated: new Date(),
      metadata: {},
    },
    {
      id: "4",
      title: "Document 4",
      sourceUrl: "https://www.google.com",
      docType: "pdf",
      createdAt: new Date(),
      updatedAt: new Date(),
      orgId: "1",
      userId: "1",
      filePath: "https://www.google.com",
      effectiveDate: new Date(),
      lastUpdated: new Date(),
      metadata: {},
    },
    {
      id: "5",
      title: "Document 5",
      sourceUrl: "https://www.google.com",
      docType: "pdf",
      createdAt: new Date(),
      updatedAt: new Date(),
      orgId: "1",
      userId: "1",
      filePath: "https://www.google.com",
      effectiveDate: new Date(),
      lastUpdated: new Date(),
      metadata: {},
    },
    {
      id: "6",
      title: "Document 6",
      sourceUrl: "https://www.google.com",
      docType: "pdf",
      createdAt: new Date(),
      updatedAt: new Date(),
      orgId: "1",
      userId: "1",
      filePath: "https://www.google.com",
      effectiveDate: new Date(),
      lastUpdated: new Date(),
      metadata: {},
    },
    {
      id: "7",
      title: "Document 7",
      sourceUrl: "https://www.google.com",
      docType: "pdf",
      createdAt: new Date(),
      updatedAt: new Date(),
      orgId: "1",
      userId: "1",
      filePath: "https://www.google.com",
      effectiveDate: new Date(),
      lastUpdated: new Date(),
      metadata: {},
    },
    {
      id: "8",
      title: "Document 8",
      sourceUrl: "https://www.google.com",
      docType: "pdf",
      createdAt: new Date(),
      updatedAt: new Date(),
      orgId: "1",
      userId: "1",
      filePath: "https://www.google.com",
      effectiveDate: new Date(),
      lastUpdated: new Date(),
      metadata: {},
    },
    {
      id: "9",
      title: "Document 9",
      sourceUrl: "https://www.google.com",
      docType: "pdf",
      createdAt: new Date(),
      updatedAt: new Date(),
      orgId: "1",
      userId: "1",
      filePath: "https://www.google.com",
      effectiveDate: new Date(),
      lastUpdated: new Date(),
      metadata: {},
    },
    {
      id: "10",
      title: "Document 10",
      sourceUrl: "https://www.google.com",
      docType: "pdf",
      createdAt: new Date(),
      updatedAt: new Date(),
      orgId: "1",
      userId: "1",
      filePath: "https://www.google.com",
      effectiveDate: new Date(),
      lastUpdated: new Date(),
      metadata: {},
    },
    {
      id: "11",
      title: "Document 11",
      sourceUrl: "https://www.google.com",
      docType: "pdf",
      createdAt: new Date(),
      updatedAt: new Date(),
      orgId: "1",
      userId: "1",
      filePath: "https://www.google.com",
      effectiveDate: new Date(),
      lastUpdated: new Date(),
      metadata: {},
    },
  ];
}

export default async function Docs() {
  const data = await getData();

  return (
    <SidebarInset>
      <SiteHeader title="Documents" />

      <div className="container mx-auto py-10 p-4">
        <DataTable columns={columns} data={data} />
      </div>
    </SidebarInset>
  );
}
