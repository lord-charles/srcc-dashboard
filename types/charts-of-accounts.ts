export interface SubAccount {
  subAccountNumber: string;
  subAccountName: string;
  type: string;
}

export interface Mapping {
  section: string;
  chart: string;
  accountNumber: string;
  accountName?: string;
  accountName2025?: string;
  objectCode: string;
  objectCodeName: string;
  financialStatement: string;
  type: string;
  fsTitle: string;
  fsSubTitle?: string;
  mapping: boolean | string;
}

export interface Account {
  accountNumber: string;
  accountName: string;
  subAccounts: SubAccount[];
  mappings: Mapping[];
}

export interface ObjectCode {
  objectCode: string;
  objectCodeName: string;
  type: string;
}

export interface ChartData {
  accounts: Account[];
  objectCodes: ObjectCode[];
  mappings?: Mapping[];
}

// Database response format: { _id, SR: {...}, CU: {...}, CB: {...} }
export interface ChartsOfAccountsDBResponse {
  _id: string;
  [chartCode: string]: ChartData | string; // chartCode -> ChartData, _id -> string
}

export interface ChartOfAccounts {
  _id: string;
  chartCode: string;
  accounts: Account[];
  objectCodes: ObjectCode[];
  mappings?: Mapping[];
}

export interface CreateChartPayload {
  chartCode: string;
  accounts: Account[];
  objectCodes: ObjectCode[];
  mappings?: Mapping[];
}

export interface UpdateChartPayload {
  accounts?: Account[];
  objectCodes?: ObjectCode[];
  mappings?: Mapping[];
}

export interface ChartStatistics {
  chartCode: string;
  totalAccounts: number;
  totalSubAccounts: number;
  totalObjectCodes: number;
  totalMappings: number;
}
