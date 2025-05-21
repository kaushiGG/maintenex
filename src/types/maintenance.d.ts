export type BackupStatus = "Completed" | "Failed" | "In Progress";

export interface Backup {
  id: number;
  name: string;
  date: string;
  size: string;
  status: BackupStatus;
  type: string;
}

export type LogLevel = "info" | "warning" | "error";

export interface Log {
  id: number;
  user: string;
  action: string;
  timestamp: string;
  ip: string;
  details: string;
  level: LogLevel;
}

export type UserStatus = "Active" | "Inactive";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "contractor";
  department: string;
  status: UserStatus;
  serviceTypes?: string[];
  sitesAccess?: string[];
  is_approved?: boolean;
  profile_id?: string;
}
