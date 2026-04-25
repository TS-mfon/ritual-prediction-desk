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
      http: [process.env.NEXT_PUBLIC_RITUAL_RPC_URL ?? process.env.RITUAL_RPC_URL ?? "https://rpc.ritualfoundation.org"],
      webSocket: [process.env.RITUAL_WS_URL ?? "wss://rpc.ritualfoundation.org/ws"],
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
  chainId: 1979,
  rpcUrl: "https://rpc.ritualfoundation.org",
  wsUrl: "wss://rpc.ritualfoundation.org/ws",
  explorerUrl: "https://explorer.ritualfoundation.org",
  ritualWallet: "0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948",
  asyncJobTracker: "0xC069FFCa0389f44eCA2C626e55491b0ab045AEF5",
  teeServiceRegistry: "0x9644e8562cE0Fe12b4deeC4163c064A8862Bf47F",
  scheduler: "0x56e776BAE2DD60664b69Bd5F865F1180ffB7D58B",
  secretsAcl: "0xf9BF1BC8A3e79B9EBeD0fa2Db70D0513fecE32FD",
  asyncDelivery: "0x5A16214fF555848411544b005f7Ac063742f39F6",
  sovereignAgentFactory: "0x9dC4C054e53bCc4Ce0A0Ff09E890A7a8e817f304",
  persistentAgentFactory: "0xD4AA9D55215dc8149Af57605e70921Ea16b73591",
} as const;

export const RITUAL_PRECOMPILES = {
  http: "0x0000000000000000000000000000000000000801",
  llm: "0x0000000000000000000000000000000000000802",
  jq: "0x0000000000000000000000000000000000000803",
  longHttp: "0x0000000000000000000000000000000000000805",
  sovereignAgent: "0x000000000000000000000000000000000000080C",
  image: "0x0000000000000000000000000000000000000818",
  audio: "0x0000000000000000000000000000000000000819",
  video: "0x000000000000000000000000000000000000081A",
  dkms: "0x000000000000000000000000000000000000081B",
  persistentAgent: "0x0000000000000000000000000000000000000820",
} as const;

export const ASYNC_STATUSES = [
  "SUBMITTING",
  "PENDING_COMMITMENT",
  "COMMITTED",
  "EXECUTOR_PROCESSING",
  "RESULT_READY",
  "PENDING_SETTLEMENT",
  "SETTLED",
  "FAILED",
  "EXPIRED",
] as const;
