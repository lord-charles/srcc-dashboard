export interface DashboardEmployeeStats {
  total: number;
  quarterlyGrowth: string;
  description: string;
}

export interface DashboardAdvanceTotal {
  amount: number;
  outstanding: number;
  repaymentRate: number;
}

export interface DashboardAdvanceActive {
  count: number;
  percentageOfTotal: number;
  dueThisMonth: number;
}

export interface DashboardAdvanceUtilization {
  rate: number;
  employeesWithAdvances: number;
  monthlyChange: number;
}

export interface DashboardAdvanceInterest {
  monthlyRate: number;
  earned: number;
}

export interface DashboardAdvanceAtRisk {
  count: number;
  percentageOfTotal: number;
  changeFromLastMonth: number;
}

export interface DashboardAdvanceStats {
  total: DashboardAdvanceTotal;
  active: DashboardAdvanceActive;
  utilization: DashboardAdvanceUtilization;
  interest: DashboardAdvanceInterest;
  atRisk: DashboardAdvanceAtRisk;
}

export interface DashboardStats {
  employees: DashboardEmployeeStats;
  advances: DashboardAdvanceStats;
}

export interface LineChartData {
  lineChart: {
    date: string;
    applications: number;
  }[];
}

export interface PieChartData {
  name: string;
  value: number;
}

export interface ChartDataResponse {
  lineChart: {
    date: string;
    applications: number;
  }[];
  pieChart: PieChartData[];
}

export interface DetailedStats {
  totals: {
    totalAdvanceAmount: number;
    totalRepaidAmount: number;
  };
  paymentMethods: {
    name: string;
    value: number;
  }[];
}

export interface MonthlyTrends {
  date: string;
  totalRequests: number;
  approvedRequests: number;
  approvalRate: number;
}

export interface RecentAdvanceStats {
  totalRequested: {
    amount: number;
    period: string;
  };
  approvedAmount: {
    amount: number;
    period: string;
  };
  pendingRequests: {
    count: number;
    description: string;
  };
  uniqueRequesters: {
    count: number;
    description: string;
  };
}

export interface SystemLog {
  timestamp: string;
  event: string;
  details: string;
  severity: "info" | "warn" | "error";
  userId: string;
  ipAddress: string;
  createdAt: string;
}
