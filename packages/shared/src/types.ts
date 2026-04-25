export type AsyncStatus =
  | "SUBMITTING"
  | "PENDING_COMMITMENT"
  | "COMMITTED"
  | "EXECUTOR_PROCESSING"
  | "RESULT_READY"
  | "PENDING_SETTLEMENT"
  | "SETTLED"
  | "FAILED"
  | "EXPIRED";

export type OpportunityTag = "macro" | "earnings" | "geopolitics" | "sports" | "governance" | "liquidity";

export interface AgentPolicy {
  owner: string;
  vaultAddress: string;
  baseAsset: "RITUAL";
  maxNotional: string;
  requireApproval: boolean;
  topicAllowlist: string[];
  venuePolicy: "ritual-native";
}

export interface ResearchTopic {
  id: string;
  label: string;
  cadence: string;
  source: string;
  secretMode: "public" | "delegated";
}

export interface RecommendationSummary {
  id: string;
  status: "queued" | "approved" | "expired";
  title: string;
  marketType: "prediction";
  confidenceBps: number;
  maxNotional: string;
  rationale: string;
  supportingEvidence: string[];
  riskTags: string[];
  createdAt: string;
  expiresAt: string;
  draftDigest: string;
}

export interface ApprovalRequest {
  id: string;
  action: "create_market" | "seed_liquidity" | "enter_position";
  recommendationId: string;
  requestedBy: string;
  createdAt: string;
  maxNotional: string;
  status: "pending" | "approved" | "rejected";
}

export interface AttestationReceipt {
  txHash: string;
  executor: string;
  precompile: string;
  jobId: string;
  status: AsyncStatus;
}

export interface DeskSnapshot {
  headline: string;
  policy: AgentPolicy;
  topics: ResearchTopic[];
  recommendations: RecommendationSummary[];
  approvals: ApprovalRequest[];
  receipts: AttestationReceipt[];
}
