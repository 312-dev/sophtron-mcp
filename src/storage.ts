import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const dataDir = path.join(os.homedir(), '.sophtron-mcp');
const connectionsFile = path.join(dataDir, 'connections.json');

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

export function saveConnection(institutionName: string, data: any) {
  const connections = loadConnections();
  connections[institutionName] = { ...data, savedAt: new Date().toISOString() };
  ensureDataDir();
  fs.writeFileSync(connectionsFile, JSON.stringify(connections, null, 2));
}
