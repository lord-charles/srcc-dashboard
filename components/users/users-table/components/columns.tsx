"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { User, Skill } from "@/types/user";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { Badge } from "@/components/ui/badge";

const customIncludesStringFilter = (
  row: Row<User>,
  columnId: string,
  filterValue: string
) => {
  const value = row.getValue(columnId) as string;
  return value?.toLowerCase().includes((filterValue as string).toLowerCase());
};

const getProficiencyColor = (level: string) => {
  switch (level) {
    case "beginner":
      return "text-blue-600 bg-blue-50";
    case "intermediate":
      return "text-green-600 bg-green-50";
    case "advanced":
      return "text-purple-600 bg-purple-50";
    case "expert":
      return "text-orange-600 bg-orange-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};

export const columns: ColumnDef<User>[] = [
  {
    id: "combinedName",
    header: "Name",
    accessorFn: (row) => {
      const skillsText = (row.skills || [])
        .map(skill => skill.name)
        .join(" ");
      return `${row.firstName || ""} ${row.middleName || ""} ${row.lastName || ""} ${row.phoneNumber || ""} ${row.email || ""} ${row.employeeId || ""} ${row.nationalId || ""} ${row.kraPinNumber || ""} ${skillsText}`;
    },
    filterFn: customIncludesStringFilter,
    enableHiding: true,
    enableSorting: false,
    size: 0,
    cell: () => null,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Consultant" />
    ),
    cell: ({ row }) => {
      const fullName = [
        row.original.firstName,
        row.original.middleName,
        row.original.lastName,
      ]
        .filter(Boolean)
        .join(" ");

      return (
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary rounded-full h-9 w-9 flex items-center justify-center font-semibold">
            {row.original.firstName?.[0]?.toUpperCase()}
            {row.original.lastName?.[0]?.toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-medium capitalize">{fullName}</span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{row.original.employeeId}</span>
              {row.original.roles?.map((role, index) => (
                <Badge key={index} variant="secondary" className="text-[10px]">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "skills",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Skills & Experience" />
    ),
    cell: ({ row }) => {
      const skills = row.original.skills || [];
      const education = row.original.education?.[0];
      const topSkills = skills.slice(0, 3); // Show only top 3 skills

      return (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-1">
            {topSkills.map((skill: Skill, index: number) => (
              <Badge 
                key={index} 
                variant="outline" 
                className={`text-xs whitespace-nowrap ${getProficiencyColor(skill.proficiencyLevel)}`}
              >
                {skill.name}
                <span className="ml-1 opacity-75">
                  ({skill.yearsOfExperience}y)
                </span>
              </Badge>
            ))}
            {skills.length > 3 && (
              <Badge variant="secondary" className="text-[10px]">
                +{skills.length - 3} more
              </Badge>
            )}
          </div>
          {education && (
            <span className="text-xs text-muted-foreground">
              {education.qualification} • {education.institution} ({education.yearOfCompletion})
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "contact",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contact" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col space-y-1">
          <span className="text-sm font-medium">{row.original.email}</span>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{row.original.phoneNumber}</span>
            {row.original.alternativePhoneNumber && (
              <Badge variant="secondary" className="text-[10px]">
                +Alt
              </Badge>
            )}
          </div>
          {row.original.county && (
            <span className="text-xs text-muted-foreground capitalize">
              {row.original.county}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "department",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Department" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium capitalize">{row.original.department}</span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{row.original.yearsOfExperience}y exp.</span>
            <span>•</span>
            <span className="capitalize">{row.original.availability}</span>
            {row.original.hourlyRate > 0 && (
              <>
                <span>•</span>
                <span>
                  {new Intl.NumberFormat("en-KE", {
                    style: "currency",
                    currency: "KES",
                  }).format(row.original.hourlyRate)}/hr
                </span>
              </>
            )}
          </div>
          {row.original.cvUrl && (
            <a
              href={row.original.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline mt-1"
            >
              View CV
            </a>
          )}
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
            status === "active"
              ? "success"
              : status === "pending"
                ? "warning"
                : "destructive"
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
