export const CONNECT_BANK_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Connect Bank</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
    color: var(--color-text-primary, #1a1a2e);
    background: var(--color-background-primary, transparent);
    padding: 20px; max-width: 480px; margin: 0 auto;
  }
  h2 { font-size: var(--font-heading-sm-size, 18px); font-weight: var(--font-weight-semibold, 600); margin-bottom: 16px; }
  .step { display: none; }
  .step.active { display: block; }
  .search-box {
    width: 100%; padding: 10px 14px;
    border: var(--border-width-regular, 1.5px) solid var(--color-border-secondary, #d1d5db);
    border-radius: var(--border-radius-md, 8px);
    font-size: var(--font-text-md-size, 15px); outline: none; transition: border-color 0.15s;
    background: var(--color-background-primary, #fff);
    color: var(--color-text-primary, inherit);
  }
  .search-box:focus { border-color: var(--color-ring-primary, #6366f1); }
  .results { margin-top: 12px; max-height: 260px; overflow-y: auto; }
  .result-item {
    padding: 12px 14px;
    border: var(--border-width-regular, 1px) solid var(--color-border-secondary, #e5e7eb);
    border-radius: var(--border-radius-md, 8px);
    margin-bottom: 8px; cursor: pointer; transition: all 0.15s;
    display: flex; justify-content: space-between; align-items: center;
  }
  .result-item:hover { background: var(--color-background-ghost, #f5f3ff); border-color: var(--color-border-primary, #a5b4fc); }
  .result-item .name { font-weight: var(--font-weight-medium, 500); font-size: var(--font-text-sm-size, 14px); }
  .result-item .url { font-size: var(--font-text-xs-size, 12px); color: var(--color-text-secondary, #6b7280); }
  .form-group { margin-bottom: 14px; }
  .form-group label { display: block; font-size: var(--font-text-xs-size, 13px); font-weight: var(--font-weight-medium, 500); color: var(--color-text-secondary, #374151); margin-bottom: 5px; }
  .form-group input {
    width: 100%; padding: 10px 14px;
    border: var(--border-width-regular, 1.5px) solid var(--color-border-secondary, #d1d5db);
    border-radius: var(--border-radius-md, 8px);
    font-size: var(--font-text-md-size, 15px); outline: none;
    background: var(--color-background-primary, #fff);
    color: var(--color-text-primary, inherit);
  }
  .form-group input:focus { border-color: var(--color-ring-primary, #6366f1); }
  .btn {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 10px 20px; border: none;
    border-radius: var(--border-radius-md, 8px);
    font-size: var(--font-text-sm-size, 14px); font-weight: var(--font-weight-medium, 500);
    cursor: pointer; transition: all 0.15s; min-width: 120px;
  }
  .btn-primary { background: var(--color-ring-primary, #6366f1); color: var(--color-text-inverse, #fff); }
  .btn-primary:hover { opacity: 0.9; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-secondary { background: var(--color-background-secondary, #f3f4f6); color: var(--color-text-primary, #374151); margin-right: 8px; }
  .btn-secondary:hover { opacity: 0.8; }
  .btn-row { display: flex; justify-content: flex-end; margin-top: 16px; }
  .status { padding: 16px; background: var(--color-background-secondary, #f9fafb); border-radius: var(--border-radius-lg, 10px); text-align: center; }
  .status .spinner { display: inline-block; width: 20px; height: 20px; border: 2.5px solid var(--color-border-secondary, #e5e7eb); border-top-color: var(--color-ring-primary, #6366f1); border-radius: 50%; animation: spin 0.7s linear infinite; margin-bottom: 10px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .status .text { font-size: var(--font-text-sm-size, 14px); color: var(--color-text-secondary, #6b7280); }
  .mfa-info { font-size: var(--font-text-xs-size, 13px); color: var(--color-text-secondary, #6b7280); margin-bottom: 10px; }
  .success-box { background: var(--color-background-success, #ecfdf5); border: 1px solid var(--color-border-success, #a7f3d0); border-radius: var(--border-radius-lg, 10px); padding: 20px; text-align: center; }
  .success-box h3 { color: var(--color-text-success, #065f46); font-size: var(--font-heading-xs-size, 16px); margin-bottom: 8px; }
  .success-box p { color: var(--color-text-success, #047857); font-size: var(--font-text-sm-size, 14px); }
  .error-box { background: var(--color-background-danger, #fef2f2); border: 1px solid var(--color-border-danger, #fecaca); border-radius: var(--border-radius-lg, 10px); padding: 16px; }
  .error-box p { color: var(--color-text-danger, #991b1b); font-size: var(--font-text-sm-size, 14px); }
  .account-list { margin-top: 14px; text-align: left; }
  .account-item {
    padding: 10px 14px;
    background: var(--color-background-primary, #fff);
    border: 1px solid var(--color-border-success, #d1f4e0);
    border-radius: var(--border-radius-md, 8px);
    margin-bottom: 6px; display: flex; justify-content: space-between;
  }
  .account-item .acct-name { font-weight: var(--font-weight-medium, 500); font-size: var(--font-text-sm-size, 14px); }
  .account-item .acct-balance { font-size: var(--font-text-sm-size, 14px); color: var(--color-text-success, #047857); font-weight: var(--font-weight-semibold, 600); }
  .no-results { text-align: center; padding: 30px; color: var(--color-text-tertiary, #9ca3af); font-size: var(--font-text-sm-size, 14px); }
  .selected-bank {
    display: flex; align-items: center; gap: 10px; padding: 10px 14px;
    background: var(--color-background-ghost, #f5f3ff);
    border: 1px solid var(--color-border-primary, #c7d2fe);
    border-radius: var(--border-radius-md, 8px);
    margin-bottom: 16px; font-size: var(--font-text-sm-size, 14px); font-weight: var(--font-weight-medium, 500);
  }
  #init-loading { text-align: center; padding: 40px; color: var(--color-text-tertiary, #9ca3af); font-size: var(--font-text-sm-size, 14px); }
</style>
</head>
<body>

<div id="init-loading">
  <div class="status">
    <div class="spinner"></div>
    <div class="text">Initializing...</div>
  </div>
</div>

<!-- Step 1: Search -->
<div id="step-search" class="step">
  <h2>Connect Your Bank</h2>
  <input class="search-box" id="search-input" type="text" placeholder="Search for your bank or credit card..." autocomplete="off">
  <div class="results" id="search-results"></div>
  <div class="no-results" id="no-results" style="display:none">Type to search for your financial institution</div>
</div>

<!-- Step 2: Login -->
<div id="step-login" class="step">
  <h2>Sign In</h2>
  <div class="selected-bank" id="selected-bank-label"></div>
  <div class="form-group">
    <label for="login-username">Username</label>
    <input id="login-username" type="text" placeholder="Bank username" autocomplete="off">
  </div>
  <div class="form-group">
    <label for="login-password">Password</label>
    <input id="login-password" type="password" placeholder="Bank password">
  </div>
  <div class="form-group">
    <label for="login-pin">PIN <span style="color:#9ca3af">(optional)</span></label>
    <input id="login-pin" type="password" placeholder="If required by your bank">
  </div>
  <div class="btn-row">
    <button class="btn btn-secondary" onclick="showStep('search')">Back</button>
    <button class="btn btn-primary" id="btn-connect" onclick="doConnect()">Connect</button>
  </div>
</div>

<!-- Step 3: Processing / MFA -->
<div id="step-processing" class="step">
  <h2>Connecting...</h2>
  <div class="status" id="processing-status">
    <div class="spinner"></div>
    <div class="text">Establishing connection to your bank...</div>
  </div>
</div>

<!-- Step 3b: MFA -->
<div id="step-mfa" class="step">
  <h2>Verification Required</h2>
  <div class="mfa-info" id="mfa-info"></div>
  <div id="mfa-fields"></div>
  <div class="btn-row">
    <button class="btn btn-primary" id="btn-mfa-submit" onclick="submitMfa()">Submit</button>
  </div>
</div>

<!-- Step 4: Success -->
<div id="step-success" class="step">
  <div class="success-box">
    <h3>Connected!</h3>
    <p id="success-message"></p>
    <div class="account-list" id="account-list"></div>
  </div>
</div>

<!-- Step 5: Error -->
<div id="step-error" class="step">
  <div class="error-box">
    <p id="error-message"></p>
  </div>
  <div class="btn-row">
    <button class="btn btn-secondary" onclick="showStep('search')">Try Again</button>
  </div>
</div>

<script>
// --- MCP Apps protocol implementation ---
const pending = {};
let nextId = 1;
let initialized = false;

function sendMessage(msg) {
  window.parent.postMessage(msg, '*');
}

function sendRequest(method, params) {
  return new Promise((resolve, reject) => {
    const id = nextId++;
    pending[id] = { resolve, reject };
    sendMessage({ jsonrpc: '2.0', id, method, params });
  });
}

function sendNotification(method, params) {
  sendMessage({ jsonrpc: '2.0', method, params: params || {} });
}

window.addEventListener('message', (e) => {
  const msg = e.data;
  if (!msg || typeof msg !== 'object') return;
  if (msg.jsonrpc !== '2.0') return;

  // Response to a request we sent
  if (msg.id != null && pending[msg.id]) {
    if (msg.error) pending[msg.id].reject(msg.error);
    else pending[msg.id].resolve(msg.result);
    delete pending[msg.id];
    return;
  }

  // Notifications from host
  if (msg.method === 'ui/notifications/tool-result') {
    // Initial tool result — wizard doesn't need it
  }
  if (msg.method === 'ui/notifications/tool-input') {
    // Tool arguments — wizard has none
  }
  if (msg.method === 'ui/notifications/host-context-changed') {
    applyHostContext(msg.params);
  }

  // Handle ping
  if (msg.method === 'ping' && msg.id != null) {
    sendMessage({ jsonrpc: '2.0', id: msg.id, result: {} });
  }
});

// --- Theme + style helpers ---
function applyTheme(theme) {
  if (!theme) return;
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;
}

function applyStyleVars(vars) {
  if (!vars) return;
  const root = document.documentElement;
  for (const [k, v] of Object.entries(vars)) {
    if (v !== undefined) root.style.setProperty(k, v);
  }
}

function applyFonts(css) {
  if (!css || document.getElementById('__mcp-host-fonts')) return;
  const s = document.createElement('style');
  s.id = '__mcp-host-fonts';
  s.textContent = css;
  document.head.appendChild(s);
}

function applyHostContext(ctx) {
  if (!ctx) return;
  if (ctx.theme) applyTheme(ctx.theme);
  if (ctx.styles?.variables) applyStyleVars(ctx.styles.variables);
  if (ctx.styles?.css?.fonts) applyFonts(ctx.styles.css.fonts);
}

// --- MCP Apps initialization handshake ---
async function init() {
  try {
    const result = await sendRequest('ui/initialize', {
      appInfo: { name: 'Sophtron Connect Bank', version: '1.0.0' },
      appCapabilities: {},
      protocolVersion: '2026-01-26',
    });
    initialized = true;

    // Apply host theme and styles
    if (result) applyHostContext(result.hostContext || result);

    // Send initialized notification
    sendNotification('ui/notifications/initialized');

    // Send initial size
    notifySize();

    // Show the search step
    document.getElementById('init-loading').style.display = 'none';
    showStep('search');
    document.getElementById('search-input').focus();
  } catch (e) {
    // If init fails, still show UI (graceful degradation)
    document.getElementById('init-loading').style.display = 'none';
    showStep('search');
  }
}

function notifySize() {
  try {
    const w = document.documentElement.scrollWidth;
    const h = document.documentElement.scrollHeight;
    sendNotification('ui/notifications/size-changed', { width: w, height: h });
  } catch (e) {}
}

// Observe size changes
const resizeObs = new ResizeObserver(() => { if (initialized) notifySize(); });
resizeObs.observe(document.documentElement);
resizeObs.observe(document.body);

// Start initialization
init();

// --- Tool calls via MCP Apps ---
async function callTool(name, args) {
  try {
    const res = await sendRequest('tools/call', { name, arguments: args || {} });
    const text = res?.content?.find(c => c.type === 'text')?.text;
    return text ? JSON.parse(text) : res;
  } catch (e) {
    console.error('Tool call failed:', name, e);
    throw e;
  }
}

// --- State ---
let selectedInstitution = null;
let currentJobId = null;
let currentUserInstitutionId = null;
let currentMfaType = null;
let searchTimeout = null;

// --- UI helpers ---
function showStep(step) {
  document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
  document.getElementById('step-' + step).classList.add('active');
  notifySize();
}

function setProcessingText(text) {
  document.querySelector('#processing-status .text').textContent = text;
}

// --- Search ---
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  const q = searchInput.value.trim();
  if (q.length < 2) {
    searchResults.innerHTML = '';
    document.getElementById('no-results').style.display = 'block';
    return;
  }
  searchTimeout = setTimeout(() => doSearch(q), 350);
});

async function doSearch(query) {
  document.getElementById('no-results').style.display = 'none';
  searchResults.innerHTML = '<div class="no-results">Searching...</div>';
  try {
    const results = await callTool('search_institutions', { query });
    if (!results || !Array.isArray(results) || results.length === 0) {
      searchResults.innerHTML = '<div class="no-results">No results found</div>';
      return;
    }
    searchResults.innerHTML = results.slice(0, 15).map(inst => {
      const name = inst.InstitutionName || inst.Name || 'Unknown';
      const url = inst.URL || inst.InstitutionUrl || '';
      const id = inst.InstitutionID || inst.Id || '';
      return '<div class="result-item" onclick=\\'selectInstitution(' + JSON.stringify(JSON.stringify({id, name, url})) + ')\\'>' +
        '<div><div class="name">' + escapeHtml(name) + '</div>' +
        (url ? '<div class="url">' + escapeHtml(url) + '</div>' : '') +
        '</div></div>';
    }).join('');
  } catch (e) {
    searchResults.innerHTML = '<div class="no-results">Search failed. Try again.</div>';
  }
}

function selectInstitution(json) {
  selectedInstitution = JSON.parse(json);
  document.getElementById('selected-bank-label').textContent = selectedInstitution.name;
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('login-pin').value = '';
  showStep('login');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// --- Connect ---
async function doConnect() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const pin = document.getElementById('login-pin').value;

  if (!username || !password) return;

  document.getElementById('btn-connect').disabled = true;
  showStep('processing');
  setProcessingText('Connecting to ' + selectedInstitution.name + '...');

  try {
    const result = await callTool('create_connection', {
      institutionId: selectedInstitution.id,
      username,
      password,
      pin: pin || '',
    });

    if (!result || !result.JobID) {
      showError('Failed to start connection. Please try again.');
      return;
    }

    currentJobId = result.JobID;
    currentUserInstitutionId = result.UserInstitutionID;
    pollJob();
  } catch (e) {
    showError('Connection failed: ' + (e.message || 'Unknown error'));
  }
}

// --- Job polling + MFA ---
async function pollJob() {
  setProcessingText('Verifying credentials...');
  let attempts = 0;
  const maxAttempts = 60;

  while (attempts < maxAttempts) {
    await sleep(4000);
    attempts++;

    try {
      const job = await callTool('poll_job', { jobId: currentJobId });
      if (!job) { showError('Lost connection to job.'); return; }

      if (job.SuccessFlag === true) {
        onConnectionSuccess();
        return;
      }

      if (job.SuccessFlag === false && job.LastStatus === 'Completed') {
        showError('Connection failed. Your bank may have rejected the credentials.');
        return;
      }

      if (job.LastStatus === 'AccountsReady') {
        setProcessingText('Accounts found! Fetching transaction data...');
      }

      // MFA challenges
      if (job.SecurityQuestion) {
        showMfa('security_question', job.SecurityQuestion);
        return;
      } else if (job.TokenMethod) {
        showMfa('token_method', job.TokenMethod);
        return;
      } else if (job.TokenSentFlag === true) {
        showMfa('token_input', 'A verification code was sent to you. Enter it below.');
        return;
      } else if (job.TokenRead != null) {
        showMfa('token_phone', 'Please verify via phone. Content: ' + job.TokenRead);
        return;
      } else if (job.CaptchaImage != null) {
        showMfa('captcha', job.CaptchaImage);
        return;
      }

      setProcessingText('Waiting for bank response...');
    } catch (e) {
      // Network error, retry
    }
  }

  showError('Connection timed out. Please try again.');
}

function showMfa(type, data) {
  currentMfaType = type;
  const info = document.getElementById('mfa-info');
  const fields = document.getElementById('mfa-fields');

  if (type === 'security_question') {
    let questions;
    try { questions = JSON.parse(data); } catch { questions = [data]; }
    info.textContent = 'Your bank requires you to answer security questions:';
    fields.innerHTML = questions.map((q, i) =>
      '<div class="form-group"><label>' + escapeHtml(q) + '</label>' +
      '<input class="mfa-answer" data-index="' + i + '" type="text" placeholder="Your answer"></div>'
    ).join('');
  } else if (type === 'token_method') {
    let methods;
    try { methods = JSON.parse(data); } catch { methods = [data]; }
    info.textContent = 'Choose how to receive your verification code:';
    fields.innerHTML = methods.map((m, i) =>
      '<div class="result-item" onclick="selectTokenMethod(' + i + ', this)" data-method="' + escapeHtml(m) + '">' +
      '<div class="name">' + escapeHtml(m) + '</div></div>'
    ).join('');
  } else if (type === 'token_input') {
    info.textContent = data;
    fields.innerHTML = '<div class="form-group"><label>Verification Code</label>' +
      '<input id="mfa-token" type="text" placeholder="Enter code"></div>';
  } else if (type === 'token_phone') {
    info.textContent = data;
    fields.innerHTML = '<p style="font-size:14px;color:#374151;margin:10px 0;">Click Submit after you have verified on your phone.</p>';
  } else if (type === 'captcha') {
    info.textContent = 'Enter the text shown in the image:';
    fields.innerHTML = '<img src="data:image/png;base64,' + data + '" style="max-width:100%;border-radius:8px;margin-bottom:10px;" />' +
      '<div class="form-group"><input id="mfa-captcha" type="text" placeholder="Enter captcha"></div>';
  }

  showStep('mfa');
}

let selectedTokenMethodValue = null;
function selectTokenMethod(index, el) {
  document.querySelectorAll('#mfa-fields .result-item').forEach(e => e.style.background = '');
  el.style.background = '#e0e7ff';
  selectedTokenMethodValue = el.dataset.method;
}

async function submitMfa() {
  document.getElementById('btn-mfa-submit').disabled = true;
  showStep('processing');
  setProcessingText('Submitting verification...');

  try {
    if (currentMfaType === 'security_question') {
      const answers = [];
      document.querySelectorAll('.mfa-answer').forEach(el => answers.push(el.value));
      await callTool('answer_mfa', { jobId: currentJobId, type: 'security_answer', value: JSON.stringify(answers) });
    } else if (currentMfaType === 'token_method') {
      await callTool('answer_mfa', { jobId: currentJobId, type: 'token_choice', value: selectedTokenMethodValue || '' });
    } else if (currentMfaType === 'token_input') {
      const token = document.getElementById('mfa-token').value;
      await callTool('answer_mfa', { jobId: currentJobId, type: 'token_input', value: token });
    } else if (currentMfaType === 'token_phone') {
      await callTool('answer_mfa', { jobId: currentJobId, type: 'token_phone', value: 'true' });
    } else if (currentMfaType === 'captcha') {
      const captcha = document.getElementById('mfa-captcha').value;
      await callTool('answer_mfa', { jobId: currentJobId, type: 'captcha', value: captcha });
    }
    document.getElementById('btn-mfa-submit').disabled = false;
    pollJob();
  } catch (e) {
    showError('MFA submission failed: ' + (e.message || 'Unknown error'));
  }
}

// --- Success ---
async function onConnectionSuccess() {
  setProcessingText('Loading your accounts...');
  try {
    const accounts = await callTool('get_connection_accounts', { userInstitutionId: currentUserInstitutionId });
    const accountList = document.getElementById('account-list');

    if (accounts && Array.isArray(accounts) && accounts.length > 0) {
      document.getElementById('success-message').textContent =
        selectedInstitution.name + ' — ' + accounts.length + ' account' + (accounts.length > 1 ? 's' : '') + ' found';
      accountList.innerHTML = accounts.map(a => {
        const name = a.AccountName || a.Name || 'Account';
        const number = a.AccountNumber ? ('...' + a.AccountNumber.slice(-4)) : '';
        const balance = a.Balance != null ? '$' + Number(a.Balance).toLocaleString('en-US', {minimumFractionDigits: 2}) : '';
        return '<div class="account-item"><div class="acct-name">' + escapeHtml(name) +
          (number ? ' <span style="color:#9ca3af">' + number + '</span>' : '') +
          '</div>' + (balance ? '<div class="acct-balance">' + balance + '</div>' : '') + '</div>';
      }).join('');

      // Tell Claude about the connected accounts
      const summary = accounts.map(a => {
        const name = a.AccountName || a.Name || 'Account';
        const id = a.AccountID || a.Id || '';
        const bal = a.Balance != null ? '$' + Number(a.Balance).toFixed(2) : 'N/A';
        return name + ' (ID: ' + id + ', Balance: ' + bal + ')';
      }).join('\\n');

      sendRequest('ui/update-model-context', {
        content: [{ type: 'text', text:
          'Bank connection successful. Institution: ' + selectedInstitution.name +
          '. UserInstitutionID: ' + currentUserInstitutionId +
          '. ' + accounts.length + ' accounts linked:\\n' + summary +
          '\\n\\nThe user can now query transactions using get_transactions with any AccountID above.'
        }]
      }).catch(() => {});

      sendRequest('ui/message', {
        message: {
          role: 'user',
          content: { type: 'text', text:
            'I just connected ' + selectedInstitution.name + ' with ' + accounts.length + ' accounts via the wizard. The UserInstitutionID is ' + currentUserInstitutionId + '.'
          }
        }
      }).catch(() => {});
    } else {
      document.getElementById('success-message').textContent = selectedInstitution.name + ' connected successfully!';
      sendRequest('ui/update-model-context', {
        content: [{ type: 'text', text:
          'Bank connection successful. Institution: ' + selectedInstitution.name +
          '. UserInstitutionID: ' + currentUserInstitutionId +
          '. Use list_accounts to see available accounts.'
        }]
      }).catch(() => {});
    }
    showStep('success');
  } catch (e) {
    document.getElementById('success-message').textContent = selectedInstitution.name + ' connected!';
    showStep('success');
  }
}

function showError(msg) {
  document.getElementById('error-message').textContent = msg;
  document.getElementById('btn-connect').disabled = false;
  document.getElementById('btn-mfa-submit').disabled = false;
  showStep('error');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
</script>
</body>
</html>`;
