"use client";

import { useEffect, useMemo, useState } from "react";
import type React from "react";
import {
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Factory,
  HelpCircle,
  Plus,
  RadioTower,
  ShieldCheck,
  Sparkles,
  UserRoundCog,
  WalletCards,
  X,
} from "lucide-react";
import { WalletPanel } from "./wallet-panel";

type TabId = "overview" | "agents" | "work" | "markets" | "approvals";

type Agent = {
  id: string;
  name: string;
  specialty: string;
  endpoint: string;
  riskLimit: string;
  createdAt: string;
};

type WorkOrder = {
  id: string;
  title: string;
  budget: string;
  deadline: string;
  brief: string;
  assignedAgent: string;
  createdAt: string;
};

type MarketTopic = {
  id: string;
  title: string;
  source: string;
  cadence: string;
  createdAt: string;
};

type Approval = {
  id: string;
  label: string;
  amount: string;
  status: "Pending" | "Approved";
  createdAt: string;
};

type AppState = {
  agents: Agent[];
  workOrders: WorkOrder[];
  marketTopics: MarketTopic[];
  approvals: Approval[];
};

const emptyState: AppState = {
  agents: [],
  workOrders: [],
  marketTopics: [],
  approvals: [],
};

const tabs: Array<{ id: TabId; label: string; icon: React.ElementType; description: string }> = [
  { id: "overview", label: "Overview", icon: Factory, description: "Control room" },
  { id: "agents", label: "Agents", icon: UserRoundCog, description: "Register operators" },
  { id: "work", label: "Work", icon: BriefcaseBusiness, description: "Create paid jobs" },
  { id: "markets", label: "Markets", icon: RadioTower, description: "Track event feeds" },
  { id: "approvals", label: "Approvals", icon: ShieldCheck, description: "Approve actions" },
];

const guideCopy: Record<TabId, { title: string; body: string; action: string }> = {
  overview: {
    title: "Start here",
    body: "Connect a wallet, then create an agent and a work order.",
    action: "Open agents",
  },
  agents: {
    title: "Register agent",
    body: "Add the worker identity users can assign to paid work.",
    action: "Create agent",
  },
  work: {
    title: "Create work",
    body: "Define the task, budget, deadline, and target agent.",
    action: "Create work",
  },
  markets: {
    title: "Add feed",
    body: "Register a market topic the agent should monitor.",
    action: "Add topic",
  },
  approvals: {
    title: "Review queue",
    body: "Approve only the actions you want to settle.",
    action: "Review approvals",
  },
};

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function useStoredState() {
  const [state, setState] = useState<AppState>(emptyState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem("ritual-desk-state");
    if (raw) {
      setState(JSON.parse(raw) as AppState);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      window.localStorage.setItem("ritual-desk-state", JSON.stringify(state));
    }
  }, [loaded, state]);

  return [state, setState] as const;
}

export function OperationsConsole() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [showGuide, setShowGuide] = useState(true);
  const [state, setState] = useStoredState();

  const metrics = useMemo(
    () => [
      { label: "Agents", value: state.agents.length },
      { label: "Open work", value: state.workOrders.length },
      { label: "Market feeds", value: state.marketTopics.length },
      { label: "Approvals", value: state.approvals.filter((item) => item.status === "Pending").length },
    ],
    [state]
  );

  function openTab(tab: TabId) {
    setActiveTab(tab);
    setShowGuide(true);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">
          <div className="brand-icon">R</div>
          <div>
            <strong>Ritual Desk</strong>
            <span>Agent operations</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="Workspace">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
                key={tab.id}
                onClick={() => openTab(tab.id)}
                type="button"
              >
                <Icon size={18} />
                <span>{tab.label}</span>
                <ChevronRight size={16} className="nav-chevron" />
              </button>
            );
          })}
        </nav>

        <div className="sidebar-panel">
          <HelpCircle size={18} />
          <div>
            <strong>Guided mode</strong>
            <span>Context prompts</span>
          </div>
          <button className="icon-button" onClick={() => setShowGuide(true)} aria-label="Open guide" type="button">
            <Sparkles size={16} />
          </button>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="kicker">{tabs.find((tab) => tab.id === activeTab)?.description}</p>
            <h1>{tabs.find((tab) => tab.id === activeTab)?.label}</h1>
          </div>
          <WalletPanel />
        </header>

        {showGuide ? (
          <GuidePanel
            tab={activeTab}
            onClose={() => setShowGuide(false)}
            onNext={() => {
              const nextTab = activeTab === "overview" ? "agents" : activeTab;
              setActiveTab(nextTab);
              setShowGuide(false);
            }}
          />
        ) : null}

        {activeTab === "overview" ? <Overview metrics={metrics} state={state} onOpen={openTab} /> : null}
        {activeTab === "agents" ? <Agents state={state} setState={setState} /> : null}
        {activeTab === "work" ? <Work state={state} setState={setState} /> : null}
        {activeTab === "markets" ? <Markets state={state} setState={setState} /> : null}
        {activeTab === "approvals" ? <Approvals state={state} setState={setState} /> : null}
      </section>
    </main>
  );
}

function GuidePanel({ tab, onClose, onNext }: { tab: TabId; onClose: () => void; onNext: () => void }) {
  const guide = guideCopy[tab];

  return (
    <div className="guide-panel" role="status">
      <div className="guide-icon">
        <Sparkles size={18} />
      </div>
      <div>
        <strong>{guide.title}</strong>
        <p>{guide.body}</p>
      </div>
      <button className="button compact" onClick={onNext} type="button">
        {guide.action}
      </button>
      <button className="icon-button" onClick={onClose} aria-label="Close guide" type="button">
        <X size={16} />
      </button>
    </div>
  );
}

function Overview({
  metrics,
  state,
  onOpen,
}: {
  metrics: Array<{ label: string; value: number }>;
  state: AppState;
  onOpen: (tab: TabId) => void;
}) {
  return (
    <div className="content-grid">
      <section className="panel span-2">
        <div className="panel-heading">
          <div>
            <h2>Operations board</h2>
            <p>Live workspace status</p>
          </div>
          <span className="status-dot">Ready</span>
        </div>
        <div className="metric-grid">
          {metrics.map((metric) => (
            <div className="metric-tile" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Next actions</h2>
            <p>Build the desk</p>
          </div>
        </div>
        <div className="quick-list">
          <button className="quick-action" onClick={() => onOpen("agents")} type="button">
            <UserRoundCog size={18} />
            <span>Register agent</span>
          </button>
          <button className="quick-action" onClick={() => onOpen("work")} type="button">
            <BriefcaseBusiness size={18} />
            <span>Create work</span>
          </button>
          <button className="quick-action" onClick={() => onOpen("markets")} type="button">
            <RadioTower size={18} />
            <span>Add market feed</span>
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Readiness</h2>
            <p>Production checklist</p>
          </div>
        </div>
        <div className="check-list">
          <ReadinessItem label="Agent profile" done={state.agents.length > 0} />
          <ReadinessItem label="Work order" done={state.workOrders.length > 0} />
          <ReadinessItem label="Market feed" done={state.marketTopics.length > 0} />
          <ReadinessItem label="Approval queue" done={state.approvals.length > 0} />
        </div>
      </section>
    </div>
  );
}

function ReadinessItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className={`readiness ${done ? "done" : ""}`}>
      <CheckCircle2 size={18} />
      <span>{label}</span>
    </div>
  );
}

function Agents({ state, setState }: { state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  const [form, setForm] = useState({ name: "", specialty: "", endpoint: "", riskLimit: "" });

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) return;
    setState((current) => ({
      ...current,
      agents: [
        {
          id: uid("agent"),
          name: form.name.trim(),
          specialty: form.specialty.trim(),
          endpoint: form.endpoint.trim(),
          riskLimit: form.riskLimit.trim(),
          createdAt: new Date().toISOString(),
        },
        ...current.agents,
      ],
    }));
    setForm({ name: "", specialty: "", endpoint: "", riskLimit: "" });
  }

  return (
    <div className="content-grid">
      <FormPanel title="Agent profile" description="Register operators" onSubmit={submit}>
        <Field label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} placeholder="Alpha Desk" />
        <Field
          label="Skill"
          value={form.specialty}
          onChange={(specialty) => setForm({ ...form, specialty })}
          placeholder="Market research"
        />
        <Field
          label="Endpoint"
          value={form.endpoint}
          onChange={(endpoint) => setForm({ ...form, endpoint })}
          placeholder="https://..."
        />
        <Field
          label="Risk limit"
          value={form.riskLimit}
          onChange={(riskLimit) => setForm({ ...form, riskLimit })}
          placeholder="50 RITUAL"
        />
        <button className="button primary" type="submit">
          <Plus size={16} />
          Register agent
        </button>
      </FormPanel>
      <RecordsPanel title="Registered agents" description="Active workers" empty="No agents yet">
        {state.agents.map((agent) => (
          <RecordRow key={agent.id} title={agent.name} meta={agent.specialty || "General agent"} side={agent.riskLimit || "No limit"} />
        ))}
      </RecordsPanel>
    </div>
  );
}

function Work({ state, setState }: { state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  const [form, setForm] = useState({ title: "", budget: "", deadline: "", brief: "", assignedAgent: "" });

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) return;
    setState((current) => ({
      ...current,
      workOrders: [
        {
          id: uid("work"),
          title: form.title.trim(),
          budget: form.budget.trim(),
          deadline: form.deadline.trim(),
          brief: form.brief.trim(),
          assignedAgent: form.assignedAgent.trim(),
          createdAt: new Date().toISOString(),
        },
        ...current.workOrders,
      ],
      approvals: [
        {
          id: uid("approval"),
          label: form.title.trim(),
          amount: form.budget.trim(),
          status: "Pending",
          createdAt: new Date().toISOString(),
        },
        ...current.approvals,
      ],
    }));
    setForm({ title: "", budget: "", deadline: "", brief: "", assignedAgent: "" });
  }

  return (
    <div className="content-grid">
      <FormPanel title="Work order" description="Create paid work" onSubmit={submit}>
        <Field label="Title" value={form.title} onChange={(title) => setForm({ ...form, title })} placeholder="Research CPI market" />
        <Field label="Budget" value={form.budget} onChange={(budget) => setForm({ ...form, budget })} placeholder="25 RITUAL" />
        <Field label="Deadline" value={form.deadline} onChange={(deadline) => setForm({ ...form, deadline })} placeholder="2026-05-01" />
        <label className="field">
          <span>Agent</span>
          <select value={form.assignedAgent} onChange={(event) => setForm({ ...form, assignedAgent: event.target.value })}>
            <option value="">Unassigned</option>
            {state.agents.map((agent) => (
              <option key={agent.id} value={agent.name}>
                {agent.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field span-full">
          <span>Brief</span>
          <textarea
            value={form.brief}
            onChange={(event) => setForm({ ...form, brief: event.target.value })}
            placeholder="Define the work package"
            rows={5}
          />
        </label>
        <button className="button primary" type="submit">
          <ClipboardList size={16} />
          Create work
        </button>
      </FormPanel>
      <RecordsPanel title="Work queue" description="User-created jobs" empty="No work yet">
        {state.workOrders.map((work) => (
          <RecordRow key={work.id} title={work.title} meta={work.assignedAgent || "Unassigned"} side={work.budget || "No budget"} />
        ))}
      </RecordsPanel>
    </div>
  );
}

function Markets({ state, setState }: { state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  const [form, setForm] = useState({ title: "", source: "", cadence: "" });

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) return;
    setState((current) => ({
      ...current,
      marketTopics: [
        {
          id: uid("topic"),
          title: form.title.trim(),
          source: form.source.trim(),
          cadence: form.cadence.trim(),
          createdAt: new Date().toISOString(),
        },
        ...current.marketTopics,
      ],
    }));
    setForm({ title: "", source: "", cadence: "" });
  }

  return (
    <div className="content-grid">
      <FormPanel title="Market feed" description="Track live events" onSubmit={submit}>
        <Field label="Topic" value={form.title} onChange={(title) => setForm({ ...form, title })} placeholder="Fed decision" />
        <Field label="Source" value={form.source} onChange={(source) => setForm({ ...form, source })} placeholder="https://..." />
        <Field label="Cadence" value={form.cadence} onChange={(cadence) => setForm({ ...form, cadence })} placeholder="Hourly" />
        <button className="button primary" type="submit">
          <RadioTower size={16} />
          Add topic
        </button>
      </FormPanel>
      <RecordsPanel title="Market topics" description="Watched feeds" empty="No feeds yet">
        {state.marketTopics.map((topic) => (
          <RecordRow key={topic.id} title={topic.title} meta={topic.source || "No source"} side={topic.cadence || "Manual"} />
        ))}
      </RecordsPanel>
    </div>
  );
}

function Approvals({ state, setState }: { state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  function approve(id: string) {
    setState((current) => ({
      ...current,
      approvals: current.approvals.map((approval) =>
        approval.id === id ? { ...approval, status: "Approved" } : approval
      ),
    }));
  }

  return (
    <div className="content-grid">
      <section className="panel span-2">
        <div className="panel-heading">
          <div>
            <h2>Approval queue</h2>
            <p>Human review</p>
          </div>
        </div>
        <div className="record-list">
          {state.approvals.length === 0 ? (
            <EmptyBlock label="No approvals yet" />
          ) : (
            state.approvals.map((approval) => (
              <div className="record-row" key={approval.id}>
                <div>
                  <strong>{approval.label}</strong>
                  <span>{approval.amount || "No amount"}</span>
                </div>
                <div className="record-actions">
                  <span className={`mini-status ${approval.status === "Approved" ? "done" : ""}`}>{approval.status}</span>
                  {approval.status === "Pending" ? (
                    <button className="button compact" onClick={() => approve(approval.id)} type="button">
                      Approve
                    </button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function FormPanel({
  title,
  description,
  children,
  onSubmit,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  onSubmit: (event: React.FormEvent) => void;
}) {
  return (
    <form className="panel form-panel" onSubmit={onSubmit}>
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      <div className="form-grid">{children}</div>
    </form>
  );
}

function RecordsPanel({
  title,
  description,
  empty,
  children,
}: {
  title: string;
  description: string;
  empty: string;
  children: React.ReactNode;
}) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      <div className="record-list">{hasChildren ? children : <EmptyBlock label={empty} />}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

function RecordRow({ title, meta, side }: { title: string; meta: string; side: string }) {
  return (
    <div className="record-row">
      <div>
        <strong>{title}</strong>
        <span>{meta}</span>
      </div>
      <em>{side}</em>
    </div>
  );
}

function EmptyBlock({ label }: { label: string }) {
  return (
    <div className="empty-block">
      <WalletCards size={22} />
      <span>{label}</span>
    </div>
  );
}
