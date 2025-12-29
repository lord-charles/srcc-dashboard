"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { Organization } from "@/types/organization";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { Badge } from "@/components/ui/badge";
import { FileText, Building2, Mail, Phone, MapPin } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { formatDate } from "@/lib/utils";
import { formatDateForInput } from "@/lib/date-utils";

const customIncludesStringFilter = (
  row: Row<Organization>,
  columnId: string,
  filterValue: string
) => {
  const value = row.getValue(columnId) as string | undefined;
  return (
    value?.toLowerCase().includes((filterValue as string).toLowerCase()) ??
    false
  );
};

export const columns: ColumnDef<Organization>[] = [
  {
    id: "combinedName",
    header: "Name",
    accessorFn: (row) => {
      const services = row.servicesOffered?.join(" ") ?? "N/A";
      const industries = row.industries?.join(" ") ?? "N/A";
      return `${row.companyName} ${row.registrationNumber} ${row.kraPin} ${services} ${industries} ${row.businessEmail} ${row.businessPhone}`;
    },
    filterFn: customIncludesStringFilter,
    enableHiding: true,
    enableSorting: false,
    size: 0,
    cell: () => null,
  },
  {
    accessorKey: "companyName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Organization" />
    ),
    cell: ({ row }) => {
      const org = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary rounded-full h-10 w-10 flex items-center justify-center font-semibold">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <HoverCard>
              <HoverCardTrigger asChild>
                <span className="font-medium cursor-help">
                  {org.companyName}
                </span>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 opacity-70" />
                    <span className="font-semibold">{org.companyName}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      {org.businessEmail ?? "N/A"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      {org.businessPhone ?? "N/A"}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      {org.businessAddress ?? "N/A"}
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{org.organizationId ?? "N/A"}</span>
              <span>•</span>
              <span>{org.registrationNumber ?? "N/A"}</span>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "services",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Services & Industries" />
    ),
    cell: ({ row }) => {
      const org = row.original;
      const services = org.servicesOffered?.map((s) => s.trim()) ?? [];
      const industries = org.industries?.map((i) => i.trim()) ?? [];

      return (
        <HoverCard>
          <HoverCardTrigger asChild>
            <div className="flex flex-col gap-1.5 cursor-help max-w-[280px]">
              <div className="flex flex-wrap gap-1">
                {services.slice(0, 2).map((service, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs whitespace-nowrap bg-blue-50 text-blue-700 border-blue-200"
                  >
                    {service.length > 20
                      ? `${service.substring(0, 20)}...`
                      : service}
                  </Badge>
                ))}
                {services.length > 2 && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-gray-50 text-gray-600"
                  >
                    +{services.length - 2}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {industries.slice(0, 2).map((industry, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-[10px] bg-purple-50 text-purple-700"
                  >
                    {industry.length > 15
                      ? `${industry.substring(0, 15)}...`
                      : industry}
                  </Badge>
                ))}
                {industries.length > 2 && (
                  <span className="text-xs text-muted-foreground">
                    +{industries.length - 2}
                  </span>
                )}
              </div>
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="flex flex-col gap-4">
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  Services Offered
                  <Badge variant="outline" className="text-[10px]">
                    {services.length}
                  </Badge>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {services.map((service, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  Industries
                  <Badge variant="outline" className="text-[10px]">
                    {industries.length}
                  </Badge>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {industries.map((industry, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-purple-50 text-purple-700"
                    >
                      {industry}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      );
    },
  },
  {
    accessorKey: "contact",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contact Person" />
    ),
    cell: ({ row }) => {
      const contact = row.original.contactPerson;
      return (
        <div className="flex flex-col space-y-1">
          <span className="text-sm font-medium">{contact?.name ?? "N/A"}</span>
          <span className="text-xs text-muted-foreground capitalize">
            {contact?.position ?? "N/A"}
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span>{contact?.email ?? "N/A"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{contact?.phoneNumber ?? "N/A"}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "details",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Business Details" />
    ),
    cell: ({ row }) => {
      const org = row.original;
      const taxExpiryDate = org.taxComplianceExpiryDate
        ? new Date(org.taxComplianceExpiryDate)
        : null;
      const isExpiringSoon =
        taxExpiryDate &&
        taxExpiryDate.getTime() - new Date().getTime() <
          30 * 24 * 60 * 60 * 1000; // 30 days

      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {org.yearsOfOperation ?? "N/A"} years in operation
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>KRA PIN: {org.kraPin ?? "N/A"}</span>
            <span>•</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Tax Compliance Expires:{" "}
            <span className={isExpiringSoon ? "text-red-500 font-medium" : ""}>
              {formatDateForInput(taxExpiryDate?.toString() ?? "N/A")}
            </span>
          </div>
          <div className="flex gap-2 mt-1">
            {org?.registrationCertificateUrl && (
              <a
                href={org?.registrationCertificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                <FileText className="h-3 w-3" />
                Registration
              </a>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            (status === "active"
              ? "success"
              : status === "pending"
              ? "warning"
              : "destructive") as
              | "default"
              | "secondary"
              | "destructive"
              | "outline"
          }
          className="capitalize"
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
