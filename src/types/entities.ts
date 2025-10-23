export type CampaignType =
  | 'TEXT_CAMPAIGN'
  | 'UNIFIED_CAMPAIGN'
  | 'SMART_CAMPAIGN'
  | 'DYNAMIC_CAMPAIGN'
  | 'MOBILE_APP_CAMPAIGN';

export type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

export interface Campaign {
  id: number;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  strategy: string;
  budget: number;
  dailyBudget: number;
  startDate: string;
  endDate: string;
  region: string;
  adjustments: string[];
  spend: number;
  clicks: number;
  impressions: number;
  conversions: number;
}

export interface Ad {
  id: number;
  name: string;
  status: CampaignStatus;
  bid: number;
  ctr: number;
  url: string;
}

export interface AdGroup {
  id: number;
  campaignId: number;
  name: string;
  status: CampaignStatus;
  bid: number;
  ctr: number;
  url: string;
  ads: Ad[];
}

export type MatchType = 'EXACT' | 'PHRASE' | 'BROAD';

export interface Keyword {
  id: number;
  campaignId: number;
  phrase: string;
  matchType: MatchType;
  bid: number;
  status: CampaignStatus;
  impressions: number;
  clicks: number;
  ctr: number;
  negative: boolean;
}

export interface MetricPoint {
  campaignId: number;
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
}

export interface DeviceShare {
  device: 'desktop' | 'mobile' | 'tablet';
  value: number;
}

export interface ReportRow {
  campaignId: number;
  campaign: string;
  impressions: number;
  clicks: number;
  spend: number;
  cpc: number;
  conversions: number;
  roi: number;
}

export interface LogEntry {
  id: number;
  timestamp: string;
  method: string;
  operation: string;
  status: 'success' | 'error';
  httpCode: number;
  duration: number;
  message: string;
}

export interface ApiSettings {
  token: string;
  clientId: string;
  apiUsage: number;
  apiLimit: number;
  autoPauseThreshold: number;
  parallelStreams: number;
  delayMs: number;
  notifications: {
    limit: boolean;
    errors: boolean;
  };
  isPaused: boolean;
}

export interface SchedulerConfig {
  frequency: 'daily' | 'weekly';
  email: string;
  time: string;
  lastRun: string | null;
}

export interface PlacementOption {
  id: number;
  name: string;
  enabled: boolean;
}

export interface ExtensionItem {
  id: number;
  type: 'sitelink' | 'call' | 'image';
  label: string;
  value: string;
}

export interface QueueState {
  pending: number;
  paused: boolean;
}
