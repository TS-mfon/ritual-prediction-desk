import {
  decodeAbiParameters,
  encodeAbiParameters,
  parseAbiParameters,
  stringToBytes,
  type Address,
  type Hex,
} from "viem";

export interface HttpRequestInput {
  executor: Address;
  ttl: bigint;
  url: string;
  method?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  headerKeys?: string[];
  headerValues?: string[];
  body?: Hex;
  encryptedSecrets?: Hex[];
  secretSignatures?: Hex[];
  userPublicKey?: Hex;
}

export interface HttpResponseOutput {
  statusCode: number;
  body: Hex;
  errorMessage: string;
}

export interface LlmRequestInput {
  executor: Address;
  ttl: bigint;
  messagesJson: string;
  model?: string;
  maxCompletionTokens?: bigint;
  reasoningEffort?: "low" | "medium" | "high";
  temperature?: bigint;
}

const EMPTY_STORAGE_REF = ["", "", ""] as const;

export function encodeHttpCall(input: HttpRequestInput): Hex {
  return encodeAbiParameters(
    parseAbiParameters(
      "address, bytes[], uint256, bytes[], bytes, string, uint8, string[], string[], bytes, uint256, uint8, bool"
    ),
    [
      input.executor,
      input.encryptedSecrets ?? [],
      input.ttl,
      input.secretSignatures ?? [],
      input.userPublicKey ?? "0x",
      input.url,
      input.method ?? 1,
      input.headerKeys ?? [],
      input.headerValues ?? [],
      input.body ?? "0x",
      0n,
      0,
      false,
    ]
  );
}

export function decodeHttpEnvelope(rawOutput: Hex): HttpResponseOutput {
  const [, actualOutput] = decodeAbiParameters(
    parseAbiParameters("bytes, bytes"),
    rawOutput
  );
  const [statusCode, , , body, errorMessage] = decodeAbiParameters(
    parseAbiParameters("uint16, string[], string[], bytes, string"),
    actualOutput
  );
  return { statusCode, body, errorMessage };
}

export function encodeLlmCall(input: LlmRequestInput): Hex {
  return encodeAbiParameters(
    parseAbiParameters(
      "address, bytes[], uint256, bytes[], bytes, string, string, int256, string, bool, int256, string, string, uint256, bool, int256, string, bytes, int256, string, string, bool, int256, bytes, bytes, int256, int256, string, bool, (string,string,string)"
    ),
    [
      input.executor,
      [],
      input.ttl,
      [],
      "0x",
      input.messagesJson,
      input.model ?? "zai-org/GLM-4.7-FP8",
      0n,
      "",
      false,
      input.maxCompletionTokens ?? 4096n,
      "",
      "",
      1n,
      true,
      0n,
      input.reasoningEffort ?? "medium",
      "0x",
      -1n,
      "auto",
      "",
      false,
      input.temperature ?? 700n,
      "0x",
      "0x",
      -1n,
      1000n,
      "",
      false,
      EMPTY_STORAGE_REF,
    ]
  );
}

export function decodeLlmEnvelope(rawOutput: Hex): { hasError: boolean; completion: string; errorMessage: string } {
  const [, actualOutput] = decodeAbiParameters(parseAbiParameters("bytes, bytes"), rawOutput);
  const [hasError, completionData, , errorMessage] = decodeAbiParameters(
    parseAbiParameters("bool, bytes, bytes, string, (string,string,string)"),
    actualOutput
  );
  return {
    hasError,
    completion: new TextDecoder().decode(completionData.length ? completionData : stringToBytes("")),
    errorMessage,
  };
}
