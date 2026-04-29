"use client";

import { LogOut, PlugZap } from "lucide-react";
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
      <div className="wallet-compact">
        {connectors.slice(0, 1).map((connector) => (
          <button
            key={connector.uid}
            className="button primary compact"
            onClick={() => connect({ connector })}
            type="button"
          >
            <PlugZap size={16} />
            Connect
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="wallet-compact">
      <div>
        <strong>{address ? truncateAddress(address) : "Connected"}</strong>
        <span>{chain?.name ?? "Wallet"}</span>
      </div>
      <button className="icon-button" onClick={() => disconnect()} type="button" aria-label="Disconnect wallet">
        <LogOut size={16} />
      </button>
    </div>
  );
}
