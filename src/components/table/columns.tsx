"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Doc } from "@/types/types";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export const columns: ColumnDef<Doc>[] = [
  {
    accessorKey: "title",
    header: () => {
      return <span className="pl-4">Title</span>;
    },
    cell: ({ row }) => {
      return <span className="pl-4">{row.original.title}</span>;
    },
  },
  {
    accessorKey: "sourceUrl",
    header: "Source URL",
    cell: ({ row }) => {
      return (
        <a
          href={row.original.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {row.original.sourceUrl.slice(0, 30)}{" "}
          {row.original.sourceUrl.length > 30 && "..."}
        </a>
      );
    },
  },
  {
    accessorKey: "docType",
    header: "Type",
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      return <span>{row.original.createdAt.toLocaleDateString()}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const doc = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(doc.id)}
            >
              Copy document ID
            </DropdownMenuItem>
            <DropdownMenuItem>View document</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    maxSize: 10,
  },
];
