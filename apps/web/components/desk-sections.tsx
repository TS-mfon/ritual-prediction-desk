import { demoDesk, RITUAL_PRECOMPILES, RITUAL_SYSTEM } from "../lib/ritual-data";

function statusColor(status: string) {
  switch (status) {
    case "queued":
    case "pending":
    case "EXECUTOR_PROCESSING":
      return "gold";
    case "approved":
    case "SETTLED":
      return "green";
    default:
      return "gray";
  }
}

export function DeskSections() {
  return (
    <>
      <section className="section">
        <div className="section-heading">
          <h2>Control Surface</h2>
          <span className="pill pink">AI + TEE + Scheduler</span>
        </div>
        <div className="grid two">
          <div className="card">
            <h3>Policy Vault</h3>
            <p className="muted">{demoDesk.headline}</p>
            <div className="list">
              <div className="topic-row">
                <div className="row-top">
                  <strong>Base Asset</strong>
                  <span className="pill green">{demoDesk.policy.baseAsset}</span>
                </div>
                <div className="muted">Max advisory notional: {demoDesk.policy.maxNotional}</div>
              </div>
              <div className="topic-row">
                <div className="row-top">
                  <strong>Venue Policy</strong>
                  <span className="pill gray">{demoDesk.policy.venuePolicy}</span>
                </div>
                <div className="muted">
                  Human approval remains mandatory before execution.
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <h3>Ritual Runtime</h3>
            <div className="list">
              <div className="topic-row">
                <div className="row-top">
                  <strong>Scheduler</strong>
                  <span className="mono">{RITUAL_SYSTEM.scheduler}</span>
                </div>
                <div className="muted">Recurring research windows and draft refreshes.</div>
              </div>
              <div className="topic-row">
                <div className="row-top">
                  <strong>HTTP / LLM</strong>
                  <span className="mono">{RITUAL_PRECOMPILES.http} / {RITUAL_PRECOMPILES.llm}</span>
                </div>
                <div className="muted">TEE-backed data ingestion and advisory memo generation.</div>
              </div>
              <div className="topic-row">
                <div className="row-top">
                  <strong>Secrets ACL</strong>
                  <span className="mono">{RITUAL_SYSTEM.secretsAcl}</span>
                </div>
                <div className="muted">Delegated API credentials for protected market data.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>Research Topics</h2>
          <span className="pill green">Onchain policy</span>
        </div>
        <div className="grid two">
          {demoDesk.topics.map((topic) => (
            <div className="card" key={topic.id}>
              <div className="row-top">
                <h3>{topic.label}</h3>
                <span className={`pill ${topic.secretMode === "delegated" ? "pink" : "gray"}`}>
                  {topic.secretMode}
                </span>
              </div>
              <p className="muted">{topic.source}</p>
              <div className="action-row">
                <span className="pill gold">{topic.cadence}</span>
                <span className="pill gray">{topic.id}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>Opportunities</h2>
          <span className="pill gold">Advisory-first</span>
        </div>
        <div className="list">
          {demoDesk.recommendations.map((recommendation) => (
            <div className="recommendation-row" key={recommendation.id}>
              <div className="row-top">
                <strong>{recommendation.title}</strong>
                <span className={`pill ${statusColor(recommendation.status)}`}>
                  {recommendation.status}
                </span>
              </div>
              <p className="muted">{recommendation.rationale}</p>
              <div className="action-row">
                <span className="pill green">{recommendation.confidenceBps / 100}% confidence</span>
                <span className="pill gray">{recommendation.maxNotional}</span>
                {recommendation.riskTags.map((tag) => (
                  <span className="pill pink" key={`${recommendation.id}-${tag}`}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className="muted mono" style={{ marginTop: 12 }}>
                digest {recommendation.draftDigest}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="grid two">
          <div className="card">
            <div className="section-heading">
              <h2>Approvals</h2>
              <span className="pill gold">Human-in-loop</span>
            </div>
            <div className="list">
              {demoDesk.approvals.map((approval) => (
                <div className="approval-row" key={approval.id}>
                  <div className="row-top">
                    <strong>{approval.action.replaceAll("_", " ")}</strong>
                    <span className={`pill ${statusColor(approval.status)}`}>{approval.status}</span>
                  </div>
                  <div className="muted">
                    Recommendation {approval.recommendationId} requested by {approval.requestedBy}
                  </div>
                  <div className="action-row">
                    <button className="button" type="button">
                      Approve on Ritual
                    </button>
                    <button className="button secondary" type="button">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="section-heading">
              <h2>Audit Trail</h2>
              <span className="pill gray">spcCalls + jobs</span>
            </div>
            <div className="list">
              {demoDesk.receipts.map((receipt) => (
                <div className="receipt-row" key={receipt.txHash}>
                  <div className="row-top">
                    <strong>{receipt.precompile}</strong>
                    <span className={`pill ${statusColor(receipt.status)}`}>{receipt.status}</span>
                  </div>
                  <div className="muted mono">{receipt.txHash}</div>
                  <div className="muted mono">{receipt.jobId}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
