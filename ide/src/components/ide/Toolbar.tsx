import { Play, Upload, TestTube, Settings, Network, Menu, X } from "lucide-react";
import { useState } from "react";

interface ToolbarProps {
  onCompile: () => void;
  onDeploy: () => void;
  onTest: () => void;
  isCompiling: boolean;
  network: string;
  onNetworkChange: (network: string) => void;
  saveStatus?: string;
}

export function Toolbar({ onCompile, onDeploy, onTest, isCompiling, network, onNetworkChange, saveStatus }: ToolbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-toolbar-bg border-b border-border">
      {/* Desktop */}
      <div className="hidden md:flex items-center justify-between px-3 py-1.5">
        <div className="flex items-center gap-1">
          <span className="text-primary font-semibold text-sm font-mono mr-2">Kit CANVAS </span>
          <button
            onClick={onCompile}
            disabled={isCompiling}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
            
            <Play className="h-3.5 w-3.5" />
            {isCompiling ? "Building..." : "Build"}
          </button>
          <button
            onClick={onDeploy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
            
            <Upload className="h-3.5 w-3.5" />
            Deploy
          </button>
          <button
            onClick={onTest}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
            
            <TestTube className="h-3.5 w-3.5" />
            Test
          </button>
          {saveStatus &&
          <span className="text-[10px] text-muted-foreground ml-2 font-mono animate-in fade-in">
              {saveStatus}
            </span>
          }
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Network className="h-3.5 w-3.5" />
            <select
              value={network}
              onChange={(e) => onNetworkChange(e.target.value)}
              className="bg-secondary border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
              
              <option value="testnet">Testnet</option>
              <option value="futurenet">Futurenet</option>
              <option value="mainnet">Mainnet</option>
              <option value="standalone">Standalone</option>
            </select>
          </div>
          <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile */}
      <div className="flex md:hidden items-center justify-between px-2 py-1.5">
        <span className="text-primary font-semibold text-xs font-mono">Kit CANVAS </span>
        <div className="flex items-center gap-1">
          {saveStatus &&
          <span className="text-[9px] text-muted-foreground font-mono">{saveStatus}</span>
          }
          <select
            value={network}
            onChange={(e) => onNetworkChange(e.target.value)}
            className="bg-secondary border border-border rounded px-1.5 py-0.5 text-[10px] text-foreground focus:outline-none">
            
            <option value="testnet">Testnet</option>
            <option value="futurenet">Futurenet</option>
            <option value="mainnet">Mainnet</option>
            <option value="standalone">Standalone</option>
          </select>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-muted-foreground hover:text-foreground">
            
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen &&
      <div className="md:hidden flex gap-1 px-2 pb-2 border-b border-border">
          <button
          onClick={() => {onCompile();setMobileMenuOpen(false);}}
          disabled={isCompiling}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium rounded bg-primary text-primary-foreground disabled:opacity-50">
          
            <Play className="h-3 w-3" />
            {isCompiling ? "..." : "Build"}
          </button>
          <button
          onClick={() => {onDeploy();setMobileMenuOpen(false);}}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium rounded bg-secondary text-secondary-foreground">
          
            <Upload className="h-3 w-3" />
            Deploy
          </button>
          <button
          onClick={() => {onTest();setMobileMenuOpen(false);}}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium rounded bg-secondary text-secondary-foreground">
          
            <TestTube className="h-3 w-3" />
            Test
          </button>
        </div>
      }
    </div>);

}
