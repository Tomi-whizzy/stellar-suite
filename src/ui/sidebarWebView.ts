import * as vscode from 'vscode';
import { ContractInfo, DeploymentRecord } from './sidebarView';

export class SidebarWebView {
    private webview: vscode.Webview;

    constructor(webview: vscode.Webview, private readonly extensionUri: vscode.Uri) {
        this.webview = webview;
    }

    public updateContent(contracts: ContractInfo[], deployments: DeploymentRecord[], isCliInstalled: boolean = false) {
        const html = this.getHtml(contracts, deployments, isCliInstalled);
        this.webview.html = html;
    }

    private getHtml(contracts: ContractInfo[], deployments: DeploymentRecord[], isCliInstalled: boolean): string {
        const contractsHtml = this.renderContracts(contracts);
        const deploymentsHtml = this.renderDeployments(deployments);

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stellar Kit</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-sideBar-background);
            padding: 12px;
            line-height: 1.5;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--vscode-sideBar-border);
        }
        .header h2 {
            font-size: 14px;
            font-weight: 600;
        }
        .refresh-btn {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: background 0.2s;
        }
        .refresh-btn:hover {
            background: var(--vscode-button-secondaryHoverBackground);
        }
        .section {
            margin-bottom: 24px;
        }
        .section-title {
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 8px;
            color: var(--vscode-foreground);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .section-title-text {
            flex: 1;
        }
        .clear-btn {
            background: transparent;
            color: var(--vscode-descriptionForeground);
            border: 1px solid var(--vscode-input-border);
            padding: 4px 8px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 10px;
            transition: all 0.2s;
        }
        .clear-btn:hover {
            background: var(--vscode-button-secondaryHoverBackground);
            color: var(--vscode-foreground);
        }
        .filter-bar {
            display: flex;
            gap: 8px;
            margin-bottom: 12px;
            flex-wrap: wrap;
        }
        .filter-input {
            flex: 1;
            min-width: 120px;
            padding: 6px 8px;
            border: 1px solid var(--vscode-input-border);
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 4px;
            font-size: 11px;
        }
        .filter-select {
            padding: 6px 8px;
            border: 1px solid var(--vscode-input-border);
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 4px;
            font-size: 11px;
            cursor: pointer;
        }
        .contract-item, .deployment-item {
            background: var(--vscode-list-inactiveSelectionBackground);
            border: 1px solid var(--vscode-sideBar-border);
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 8px;
            transition: background 0.2s, box-shadow 0.2s;
            overflow: hidden;
            word-wrap: break-word;
        }
        .contract-item:hover, .deployment-item:hover {
            background: var(--vscode-list-hoverBackground);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .contract-name {
            font-weight: 600;
            font-size: 13px;
            margin-bottom: 4px;
            color: var(--vscode-textLink-foreground);
            word-break: break-all;
            overflow-wrap: break-word;
        }
        .contract-path {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 8px;
            word-break: break-all;
        }
        .contract-id {
            font-size: 11px;
            font-family: var(--vscode-editor-font-family);
            color: var(--vscode-textLink-foreground);
            margin-bottom: 8px;
            word-break: break-all;
            overflow-wrap: break-word;
        }
        .contract-actions {
            display: flex;
            gap: 8px;
            margin-top: 8px;
            flex-wrap: wrap;
        }
        .btn {
            padding: 6px 12px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 11px;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            transition: all 0.2s;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .btn:hover {
            background: var(--vscode-button-hoverBackground);
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
            transform: translateY(-1px);
        }
        .btn-secondary {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        .btn-secondary:hover {
            background: var(--vscode-button-secondaryHoverBackground);
        }
        .status-badge-success {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: 600;
            margin-left: 8px;
            background: var(--vscode-testing-iconPassed);
            color: var(--vscode-editor-background);
        }
        .empty-state {
            text-align: center;
            padding: 24px;
            color: var(--vscode-descriptionForeground);
            font-size: 12px;
        }
        .timestamp {
            font-size: 10px;
            color: var(--vscode-descriptionForeground);
            margin-top: 4px;
        }
        #cli-history {
            max-height: 200px;
            overflow-y: auto;
        }
        .cli-entry {
            padding: 6px 0;
            border-bottom: 1px solid var(--vscode-sideBar-border);
            font-size: 11px;
        }
        .cli-command {
            font-family: var(--vscode-editor-font-family);
            color: var(--vscode-foreground);
            word-break: break-all;
        }
        .cli-timestamp {
            font-size: 10px;
            color: var(--vscode-descriptionForeground);
            margin-top: 2px;
        }
        .clipboard-copy {
            cursor: pointer;
            padding: 2px 4px;
            border-radius: 3px;
            transition: background 0.2s;
            font-family: var(--vscode-editor-font-family);
            font-size: 10px;
        }
        .clipboard-copy:hover {
            background: var(--vscode-button-secondaryHoverBackground);
        }
        .icon-btn:hover {
            background: var(--vscode-button-secondaryHoverBackground);
            transform: translateY(-1px);
        }
    </style>
</head>
<body>
    <div class="header" style="flex-direction: column; align-items: stretch; gap: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2>Kit Studio</h2>
            <button class="refresh-btn" onclick="refresh()">Refresh</button>
        </div>
        <div style="font-size: 11px; padding: 6px 8px; border-radius: 4px; background: ${isCliInstalled ? 'var(--vscode-testing-iconPassed)' : 'var(--vscode-errorForeground)'}; color: var(--vscode-editor-background); display: flex; justify-content: space-between; align-items: center; font-weight: 600;">
            <span style="display: flex; align-items: center; gap: 6px;">
                Stellar CLI: ${isCliInstalled ? 'Installed' : 'Not Found'}
            </span>
            ${!isCliInstalled ? `<button onclick="installCli()" style="background: transparent; border: 1px solid currentColor; color: inherit; padding: 2px 6px; border-radius: 3px; cursor: pointer; font-size: 10px;">Install</button>` : ''}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Quick Actions</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <button class="btn btn-secondary" style="width: 100%; text-align: left; display: flex; align-items: center; gap: 6px;" onclick="executeCommand('stellarSuite.switchNetwork')">Switch Network</button>
            <button class="btn btn-secondary" style="width: 100%; text-align: left; display: flex; align-items: center; gap: 6px;" onclick="executeCommand('stellarSuite.keysGenerate')">Create Identity</button>
            <button class="btn btn-secondary" style="width: 100%; text-align: left; display: flex; align-items: center; gap: 6px;" onclick="executeCommand('stellarSuite.keysList')">Identities</button>
            <button class="btn btn-secondary" style="width: 100%; text-align: left; display: flex; align-items: center; gap: 6px;" onclick="executeCommand('stellarSuite.keysFund')">Fund Account</button>
            <button class="btn btn-secondary" style="width: 100%; text-align: left; display: flex; align-items: center; gap: 6px;" onclick="executeCommand('stellarSuite.simulateFromSidebar')">Simulate Tx</button>
            <button class="btn btn-secondary" style="width: 100%; text-align: left; display: flex; align-items: center; gap: 6px;" onclick="executeCommand('stellarSuite.runInvoke')">Run Tx</button>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Filters</div>
        <div class="filter-bar">
            <input type="text" id="search-filter" placeholder="Search contracts..." class="filter-input" oninput="applyFilters()">
            <select id="build-filter" class="filter-select" onchange="applyFilters()">
                <option value="">All Build Status</option>
                <option value="built">Built</option>
                <option value="not-built">Not Built</option>
            </select>
            <select id="deploy-filter" class="filter-select" onchange="applyFilters()">
                <option value="">All Deploy Status</option>
                <option value="deployed">Deployed</option>
                <option value="not-deployed">Not Deployed</option>
            </select>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Contracts</div>
        <div id="contracts-list">
            ${contractsHtml}
        </div>
    </div>

    <div class="section">
        <div class="section-title">
            <span class="section-title-text">Deployments</span>
            <button class="clear-btn" onclick="clearDeployments()">Clear</button>
        </div>
        ${deploymentsHtml}
    </div>

    <div class="section">
        <div class="section-title">CLI History</div>
        <div id="cli-history" class="empty-state">No CLI history yet</div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        function refresh() {
            vscode.postMessage({ command: 'refresh' });
        }
        
        function installCli() {
            vscode.postMessage({ command: 'installCli' });
        }
        
        function deploy(contractPath) {
            vscode.postMessage({ command: 'deploy', contractPath: contractPath });
        }
        
        function build(contractPath) {
            vscode.postMessage({ command: 'build', contractPath: contractPath });
        }
        
        function buildOptimized(contractPath) {
            vscode.postMessage({ command: 'execute', executeCommand: 'stellarSuite.buildContract', args: { contractPath: contractPath, optimize: true } });
        }
        
        function copyToClipboard(text) {
            vscode.postMessage({ command: 'copyToClipboard', text: text });
        }
        
        function simulate(contractId, functionName) {
            vscode.postMessage({ command: 'simulate', contractId: contractId, functionName: functionName });
        }
        
        function inspectContract(contractId) {
            vscode.postMessage({ command: 'inspectContract', contractId: contractId });
        }
        
        function runInvoke(contractId, functionName) {
            vscode.postMessage({ command: 'runInvoke', contractId: contractId, functionName: functionName });
        }

        function contractInfo(contractId) {
            vscode.postMessage({ command: 'contractInfo', contractId: contractId });
        }
        
        function copyId(id) {
            copyToClipboard(id);
        }
        
        function executeCommand(cmd, args) {
            vscode.postMessage({ command: 'execute', executeCommand: cmd, args: args });
        }
        
        function clearDeployments() {
            vscode.postMessage({ command: 'clearDeployments' });
        }

        function applyFilters() {
            const search = document.getElementById('search-filter').value.toLowerCase();
            const buildFilter = document.getElementById('build-filter').value;
            const deployFilter = document.getElementById('deploy-filter').value;
            
            const contracts = document.querySelectorAll('.contract-item');
            contracts.forEach(contract => {
                const name = contract.querySelector('.contract-name')?.textContent?.toLowerCase() || '';
                const path = contract.querySelector('.contract-path')?.textContent?.toLowerCase() || '';
                const matchesSearch = !search || name.includes(search) || path.includes(search);
                
                const actionsEl = contract.querySelector('.contract-actions');
                const isBuilt = actionsEl?.getAttribute('data-is-built') === 'true' || 
                               contract.querySelector('.status-badge-success') !== null;
                
                const matchesBuild = !buildFilter || 
                    (buildFilter === 'built' && isBuilt) || 
                    (buildFilter === 'not-built' && !isBuilt);
                
                const hasContractId = contract.querySelector('.contract-id') !== null;
                const matchesDeploy = !deployFilter || 
                    (deployFilter === 'deployed' && hasContractId) || 
                    (deployFilter === 'not-deployed' && !hasContractId);
                
                if (matchesSearch && matchesBuild && matchesDeploy) {
                    contract.style.display = '';
                } else {
                    contract.style.display = 'none';
                }
            });
        }

        function loadCliHistory() {
            vscode.postMessage({ command: 'getCliHistory' });
        }

        window.addEventListener('message', event => {
            const message = event.data;
            if (message.type === 'cliHistory:data') {
                const historyEl = document.getElementById('cli-history');
                if (message.history && message.history.length > 0) {
                    historyEl.innerHTML = message.history.map(function(entry) {
                        const cmd = escapeHtml(entry.command || entry);
                        const ts = entry.timestamp ? '<div class="cli-timestamp">' + new Date(entry.timestamp).toLocaleString() + '</div>' : '';
                        return '<div class="cli-entry"><div class="cli-command">' + cmd + '</div>' + ts + '</div>';
                    }).join('');
                } else {
                    historyEl.innerHTML = '<div class="empty-state">No CLI history yet</div>';
                }
            }
        });

        function escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        loadCliHistory();
    </script>
</body>
</html>`;
    }

    private renderContracts(contracts: ContractInfo[]): string {
        if (contracts.length === 0) {
            return '<div class="empty-state">No contracts detected in workspace</div>';
        }

        return contracts.map(contract => {
            const buildStatusBadge = contract.hasWasm
                ? '<span class="status-badge-success">Built</span>'
                : '';
            const functionsHtml = '';

            return `
                <div class="contract-item">
                    <div class="contract-name">
                        ${this.escapeHtml(contract.name)}
                        ${buildStatusBadge}
                    </div>
                    <div class="contract-path">${this.escapeHtml(contract.path)}</div>
                    ${contract.contractId ? `<div class="contract-id clipboard-copy" onclick="copyToClipboard('${this.escapeHtml(contract.contractId)}')" title="Click to copy Contract ID">ID: ${this.escapeHtml(contract.contractId)} <span style="font-size: 10px; opacity: 0.7;">[COPY]</span></div>` : ''}
                    ${contract.lastDeployed ? `<div class="timestamp">Deployed: ${new Date(contract.lastDeployed).toLocaleString()}</div>` : ''}
                    ${functionsHtml}
                    <div class="contract-actions" data-is-built="${contract.hasWasm}">
                        <button class="btn" onclick="build('${this.escapeHtml(contract.path)}')">Build</button>
                        ${contract.hasWasm ? `<button class="btn" onclick="deploy('${this.escapeHtml(contract.path)}')">Deploy</button>` : ''}
                        ${contract.contractId ? `<button class="btn btn-secondary" onclick="simulate('${this.escapeHtml(contract.contractId)}')">Simulate</button>` : ''}
                        ${contract.contractId ? `<button class="btn btn-secondary" onclick="runInvoke('${this.escapeHtml(contract.contractId)}')">Run</button>` : ''}
                        ${contract.contractId ? `<button class="btn btn-secondary" onclick="contractInfo('${this.escapeHtml(contract.contractId)}')">Info</button>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    private renderDeployments(deployments: DeploymentRecord[]): string {
        if (deployments.length === 0) {
            return '<div class="empty-state">No deployments yet</div>';
        }

        return deployments.map(deployment => {
            const date = new Date(deployment.deployedAt);
            return `
                <div class="deployment-item">
                    <div class="contract-id clipboard-copy" onclick="copyToClipboard('${this.escapeHtml(deployment.contractId)}')" title="Click to copy Contract ID">
                        Contract ID: ${this.escapeHtml(deployment.contractId)} <span style="font-size: 10px;">[COPY]</span>
                    </div>
                    <div class="timestamp">${date.toLocaleString()}</div>
                    <div class="timestamp">Network: ${this.escapeHtml(deployment.network)} | Source: ${this.escapeHtml(deployment.source)}</div>
                </div>
            `;
        }).join('');
    }

    private escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
