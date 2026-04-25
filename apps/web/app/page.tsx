import { DeskSections } from "../components/desk-sections";
import { WalletPanel } from "../components/wallet-panel";
import { RITUAL_SYSTEM } from "../lib/ritual-data";

const heroStats = [
  {
    label: "Settlement Layer",
    value: "Ritual-native approvals",
  },
  {
    label: "Autonomy Mode",
    value: "Advisory-first / human-gated",
  },
  {
    label: "Agent Path",
    value: "HTTP → LLM → onchain commit",
  },
  {
    label: "Secrets",
    value: "Delegated through SecretsACL",
  },
];

export default function Page() {
  return (
    <main className="page-shell">
      <section className="hero">
        <span className="eyebrow">Ritual-native prediction desk</span>
        <h1>Autonomous market research that settles as policy, not vibes.</h1>
        <p>
          This desk turns Ritual&apos;s TEE-backed HTTP, LLM, secrets, and scheduler
          primitives into a market-operations console. The AI agent drafts
          opportunities, the desk records advisory recommendations onchain, and
          execution remains explicitly gated by approval.
        </p>
        <div className="hero-grid">
          {heroStats.map((stat) => (
            <div className="hero-stat" key={stat.label}>
              <div className="hero-stat-label">{stat.label}</div>
              <div className="hero-stat-value">{stat.value}</div>
            </div>
          ))}
        </div>
        <div className="action-row">
          <a className="button" href={`${RITUAL_SYSTEM.explorerUrl}/address/${RITUAL_SYSTEM.scheduler}`}>
            Open Scheduler
          </a>
          <a className="button secondary" href={`${RITUAL_SYSTEM.explorerUrl}/address/${RITUAL_SYSTEM.ritualWallet}`}>
            Inspect RitualWallet
          </a>
        </div>
      </section>

      <section className="section">
        <div className="grid two">
          <WalletPanel />
          <div className="card">
            <h3>Operator Notes</h3>
            <p className="muted">
              The agent toolkit in `packages/agent-runner` builds real Ritual precompile
              payloads for HTTP and LLM requests. The desk contract in `packages/contracts`
              governs topics, recommendation publication, approvals, and delegated secret access.
            </p>
            <div className="action-row">
              <span className="pill green">Chain ID 1979</span>
              <span className="pill gray mono">{RITUAL_SYSTEM.asyncJobTracker}</span>
            </div>
          </div>
        </div>
      </section>

      <DeskSections />
    </main>
  );
}
