import {
  UserCheckIcon,
  UserMinusIcon,
  ShieldOffIcon,
  UserXIcon,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";

export const statuses = [
  {
    value: "active",
    label: "active",
    icon: UserCheckIcon,
    color: "#33FF57", // Green background
    textColor: "#000000", // Black text
  },
  {
    value: "pending",
    label: "Pending",
    icon: UserMinusIcon,
    color: "#FF8C33", // Orange background
    textColor: "#000000", // Black text
  },
  {
    value: "suspended",
    label: "Suspended",
    icon: ShieldOffIcon,
    color: "#FF5733", // Red background
    textColor: "#FFFFFF", // White text
  },
  {
    value: "terminated",
    label: "Terminated",
    icon: UserXIcon,
    color: "#8C33FF", // Purple background
    textColor: "#FFFFFF", // White text
  },
];

export const userTypes = [
  {
    value: "admin",
    label: "Admin Users",
    icon: ShieldCheck,
  },
  {
    value: "regular",
    label: "Regular Users",
    icon: UserIcon,
  },
];
