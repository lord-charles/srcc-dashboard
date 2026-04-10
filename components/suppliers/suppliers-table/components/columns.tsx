"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Supplier } from "@/services/suppliers.service";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash, Ban } from "lucide-react";
import Link from "next/link";

export function getColumns(): ColumnDef<Supplier>[] {
  return [
    {
      accessorKey: "name",
      header: "Supplier Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "kraPin",
      header: "KRA PIN",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "supplierCategory",
      header: "Category",
      cell: ({ row }) => {
        const category = row.getValue("supplierCategory") as string;
        let colorClass = "bg-blue-50 text-blue-700 border-blue-200";
        if (category === "Goods") colorClass = "bg-amber-50 text-amber-700 border-amber-200";
        if (category === "Services") colorClass = "bg-violet-50 text-violet-700 border-violet-200";
        
        return (
          <Badge variant="outline" className={colorClass}>
            {category}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        let colorClass = "bg-slate-50 text-slate-700 border-slate-200";
        
        switch(status) {
          case 'active':
            colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
            break;
          case 'pending_approval':
            colorClass = "bg-amber-50 text-amber-700 border-amber-200";
            break;
          case 'suspended':
            colorClass = "bg-rose-50 text-rose-700 border-rose-200";
            break;
          case 'inactive':
            colorClass = "bg-slate-100 text-slate-500 border-slate-200";
            break;
        }

        return (
          <Badge variant="outline" className={`capitalize ${colorClass}`}>
            {status.replace('_', ' ')}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const dateStr = row.getValue("createdAt") as string;
        if (!dateStr) return "-";
        return <span>{new Date(dateStr).toLocaleDateString()}</span>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const supplier = row.original;
        const isActive = supplier.status === "active";

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
              <DropdownMenuItem asChild>
                <Link href={`/suppliers/${supplier._id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-amber-600 focus:bg-amber-50 focus:text-amber-700 cursor-pointer"
                onClick={async () => {
                  try {
                     const { updateSupplier } = await import("@/services/suppliers.service");
                     await updateSupplier(supplier._id, { status: isActive ? "inactive" : "active" });
                     window.location.reload();
                  } catch(e) {}
                }}
              >
                <Ban className="mr-2 h-4 w-4" />
                {isActive ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                onClick={async () => {
                  if (confirm("Are you sure you want to delete this supplier?")) {
                    try {
                      const { deleteSupplier } = await import("@/services/suppliers.service");
                      await deleteSupplier(supplier._id);
                      window.location.reload();
                    } catch(e) {}
                  }
                }}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
