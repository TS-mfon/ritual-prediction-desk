# Ritual Prediction Desk

Integrated Ritual-native dapp and AI agent for advisory-first prediction market operations.

## What it includes

- `apps/web`: Next.js operator console for desks, opportunities, approvals, and audit history
- `packages/contracts`: Foundry contracts for policy vaults, topics, recommendations, approvals, and Ritual-native scheduling hooks
- `packages/shared`: shared Ritual chain constants, types, demo state, and request codec helpers
- `packages/agent-runner`: TypeScript Ritual agent toolkit for HTTP research, LLM drafting, and recommendation commit payloads
- `.codex/skills/ritual-dapp-skills`: locally installed Ritual skill repo used during implementation

## Ritual-specific design choices

- Chain ID `1979`
- RPC `https://rpc.ritualfoundation.org`
- Scheduler `0x56e776BAE2DD60664b69Bd5F865F1180ffB7D58B`
- RitualWallet `0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948`
- AsyncJobTracker `0xC069FFCa0389f44eCA2C626e55491b0ab045AEF5`
- AsyncDelivery `0x5A16214fF555848411544b005f7Ac063742f39F6`
- SecretsAccessControl `0xf9BF1BC8A3e79B9EBeD0fa2Db70D0513fecE32FD`

## Product model

The dapp is the control plane.

The AI agent uses Ritual-native primitives to:

1. pull research with the HTTP precompile
2. draft structured recommendation memos with the LLM precompile
3. prepare sovereign-agent job payloads for deeper research or autonomous follow-up
4. submit advisory recommendations into the onchain desk for human approval

V1 is advisory-first. Live execution remains gated by explicit approval in the desk contract.

## Local development

```bash
npm install
npm run dev
```

Contracts:

```bash
cd packages/contracts
forge build
forge test -vv
```

Type checks:

```bash
npm run typecheck
```

## Environment

See `.env.example` for the full set of variables. The web app only needs public Ritual RPC values to render. The agent-runner additionally needs a private key plus executor configuration if you want to submit real Ritual precompile transactions.
