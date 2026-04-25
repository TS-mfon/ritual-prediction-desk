import {
  RITUAL_PRECOMPILES,
  RITUAL_SYSTEM,
  encodeHttpCall,
  encodeLlmCall,
  ritualChain,
  type RecommendationSummary,
} from "@ritual-desk/shared";
import {
  createPublicClient,
  createWalletClient,
  decodeFunctionData,
  encodeFunctionData,
  http,
  parseAbi,
  type Address,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

const deskAbi = parseAbi([
  "function publishRecommendation(bytes32 topicId, bytes32 draftDigest, string marketTitle, string rationale, uint16 confidenceBps, uint96 maxNotional, uint64 expiryBlocks, bytes32 researchDigest) returns (uint256 recommendationId)",
]);

export interface RunnerConfig {
  privateKey: Hex;
  deskAddress: Address;
  httpExecutor: Address;
  llmExecutor: Address;
  model?: string;
  rpcUrl?: string;
}

export interface ResearchPlan {
  topicId: Hex;
  sourceUrl: string;
  prompt: string;
  marketTitle: string;
  rationale: string;
  confidenceBps: number;
  maxNotionalRitual: bigint;
  expiryBlocks: bigint;
}

export function createClients(config: RunnerConfig) {
  const account = privateKeyToAccount(config.privateKey);
  const transport = http(config.rpcUrl ?? process.env.RITUAL_RPC_URL ?? RITUAL_SYSTEM.rpcUrl);

  return {
    account,
    publicClient: createPublicClient({
      chain: ritualChain,
      transport,
    }),
    walletClient: createWalletClient({
      account,
      chain: ritualChain,
      transport,
    }),
  };
}

export function buildHttpResearchTx(config: RunnerConfig, url: string): { to: Address; data: Hex } {
  return {
    to: RITUAL_PRECOMPILES.http as Address,
    data: encodeHttpCall({
      executor: config.httpExecutor,
      ttl: 120n,
      url,
      method: 1,
    }),
  };
}

export function buildLlmDraftTx(config: RunnerConfig, prompt: string): { to: Address; data: Hex } {
  return {
    to: RITUAL_PRECOMPILES.llm as Address,
    data: encodeLlmCall({
      executor: config.llmExecutor,
      ttl: 300n,
      messagesJson: JSON.stringify([
        {
          role: "system",
          content:
            "You are a Ritual-native prediction desk. Output a concise advisory memo with confidence and liquidity posture.",
        },
        {
          role: "user",
          content: prompt,
        },
      ]),
      model: config.model ?? process.env.DEFAULT_LLM_MODEL ?? "zai-org/GLM-4.7-FP8",
    }),
  };
}

export function buildPublishRecommendationTx(
  config: RunnerConfig,
  plan: ResearchPlan,
  draftDigest: Hex,
  researchDigest: Hex
): { to: Address; data: Hex } {
  return {
    to: config.deskAddress,
    data: encodeFunctionData({
      abi: deskAbi,
      functionName: "publishRecommendation",
      args: [
        plan.topicId,
        draftDigest,
        plan.marketTitle,
        plan.rationale,
        plan.confidenceBps,
        plan.maxNotionalRitual,
        plan.expiryBlocks,
        researchDigest,
      ],
    }),
  };
}

export function createRecommendationPreview(plan: ResearchPlan): RecommendationSummary {
  return {
    id: `draft-${plan.topicId.slice(2, 10)}`,
    status: "queued",
    title: plan.marketTitle,
    marketType: "prediction",
    confidenceBps: plan.confidenceBps,
    maxNotional: `${plan.maxNotionalRitual.toString()} RITUAL`,
    rationale: plan.rationale,
    supportingEvidence: [plan.sourceUrl, "Ritual HTTP precompile research", "Ritual LLM draft memo"],
    riskTags: ["macro", "liquidity"],
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    draftDigest: "0x0",
  };
}

export function inspectPublishPayload(data: Hex) {
  return decodeFunctionData({
    abi: deskAbi,
    data,
  });
}
