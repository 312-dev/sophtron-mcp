import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const dataDir = path.join(os.homedir(), '.sophtron-mcp');
const connectionsFile = path.join(dataDir, 'connections.json');
const customerFile = path.join(dataDir, 'customer.json');

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

export function loadConnections(): Record<string, any> {
  ensureDataDir();
  if (fs.existsSync(connectionsFile)) {
    return JSON.parse(fs.readFileSync(connectionsFile, 'utf-8'));
  }
  return {};
}

export function saveConnections(connections: Record<string, any>) {
  ensureDataDir();
  fs.writeFileSync(connectionsFile, JSON.stringify(connections, null, 2));
}

export function loadCustomer(): { customerId: string; customerName: string } | null {
  ensureDataDir();
  if (fs.existsSync(customerFile)) {
    return JSON.parse(fs.readFileSync(customerFile, 'utf-8'));
  }
  return null;
}

export function saveCustomer(customerId: string, customerName: string) {
  ensureDataDir();
  fs.writeFileSync(customerFile, JSON.stringify({ customerId, customerName }, null, 2));
}
