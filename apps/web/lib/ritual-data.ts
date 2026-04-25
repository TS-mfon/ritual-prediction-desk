import { defineChain } from "viem";

export const ritualChain = defineChain({
  id: 1979,
  name: "Ritual",
  nativeCurrency: {
    name: "RITUAL",
    symbol: "RITUAL",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RITUAL_RPC_URL ?? "https://rpc.ritualfoundation.org"],
      webSocket: [process.env.NEXT_PUBLIC_RITUAL_WS_URL ?? "wss://rpc.ritualfoundation.org/ws"],
    },
  },
  blockExplorers: {
    default: {
      name: "Ritual Explorer",
      url: process.env.NEXT_PUBLIC_RITUAL_EXPLORER_URL ?? "https://explorer.ritualfoundation.org",
    },
  },
  contracts: {
    multicall3: {
      address: "0x5577Ea679673Ec7508E9524100a188E7600202a3",
    },
  },
});

export const RITUAL_SYSTEM = {
  explorerUrl: "https://explorer.ritualfoundation.org",
  ritualWallet: "0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948",
  asyncJobTracker: "0xC069FFCa0389f44eCA2C626e55491b0ab045AEF5",
  scheduler: "0x56e776BAE2DD60664b69Bd5F865F1180ffB7D58B",
  secretsAcl: "0xf9BF1BC8A3e79B9EBeD0fa2Db70D0513fecE32FD",
} as const;

export const RITUAL_PRECOMPILES = {
  http: "0x0000000000000000000000000000000000000801",
  llm: "0x0000000000000000000000000000000000000802",
} as const;

export const demoDesk = {
  headline: "Ritual-native advisory desk for autonomous prediction-market research.",
  policy: {
    baseAsset: "RITUAL",
    maxNotional: "125 RITUAL",
    venuePolicy: "ritual-native",
  },
  topics: [
    {
      id: "macro-cpi",
      label: "Macro releases",
      cadence: "Every 720 blocks",
      source: "https://api.example.com/releases",
      secretMode: "delegated",
    },
    {
      id: "governance-watch",
      label: "Protocol governance",
      cadence: "Every 360 blocks",
      source: "https://api.example.com/governance",
      secretMode: "public",
    },
  ],
  recommendations: [
    {
      id: "rec-001",
      status: "queued",
      title: "Open a CPI surprise market with capped liquidity",
      confidenceBps: 7420,
      maxNotional: "40 RITUAL",
      rationale: "TEE-backed news aggregation saw concentrated coverage around a surprise print and weak liquidity depth.",
      riskTags: ["macro", "liquidity"],
      draftDigest: "0x7e16ab2ce1490c7f7bf327cc2135d4e6f287947d624e92d15ab8f6f0dbe143ce",
    },
    {
      id: "rec-002",
      status: "approved",
      title: "Seed governance-vote outcome market for Protocol X",
      confidenceBps: 6810,
      maxNotional: "25 RITUAL",
      rationale: "Proposal discussion converged and whale addresses aligned with the same side over the past 24 hours.",
      riskTags: ["governance"],
      draftDigest: "0x4e16ab2ce1490c7f7bf327cc2135d4e6f287947d624e92d15ab8f6f0dbe143cd",
    },
  ],
  approvals: [
    {
      id: "apr-001",
      action: "create_market",
      recommendationId: "rec-001",
      requestedBy: "PredictionDeskAgent",
      status: "pending",
    },
  ],
  receipts: [
    {
      txHash: "0x4f31e3c8ab6f9ffcced4dc0c29ed64170139b8a76861c9ba4d16765ab0ff1001",
      precompile: "HTTP 0x0801",
      jobId: "0x8d5c5ec815f2102d33206d31ce3d25b89b0fdd5146ab2836ccfe1e2ca2ef0117",
      status: "SETTLED",
    },
    {
      txHash: "0x4f31e3c8ab6f9ffcced4dc0c29ed64170139b8a76861c9ba4d16765ab0ff1002",
      precompile: "LLM 0x0802",
      jobId: "0x1d5c5ec815f2102d33206d31ce3d25b89b0fdd5146ab2836ccfe1e2ca2ef0999",
      status: "EXECUTOR_PROCESSING",
    },
  ],
} as const;
