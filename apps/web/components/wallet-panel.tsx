"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletPanel() {
  const { address, chain, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (!isConnected) {
    return (
      <div className="card">
        <h3>Operator Wallet</h3>
        <p className="muted">
          Connect to Ritual before approving market creation or treasury actions.
        </p>
        <div className="action-row">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              className="button"
              onClick={() => connect({ connector })}
              type="button"
            >
              Connect {connector.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>Operator Wallet</h3>
      <p className="muted">
        Connected to {chain?.name ?? "Unknown chain"} as{" "}
        <span className="mono">{address ? truncateAddress(address) : "No address"}</span>.
      </p>
      <div className="action-row">
        <button className="button secondary" onClick={() => disconnect()} type="button">
          Disconnect
        </button>
      </div>
    </div>
  );
}
