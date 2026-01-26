import React from 'react';
import { Monitor, Smartphone, Shield, Brain, Bot, Database, Cloud, FileText, Activity, Zap, Server, Eye, MessageSquare } from 'lucide-react';

export default function SMSAArchitectureDiagram() {
  const LayerBox = ({ title, color, children, className = "" }) => (
    <div className={`rounded-xl border-2 ${color} p-4 ${className}`}>
      <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${color.includes('blue') ? 'text-blue-600' : color.includes('purple') ? 'text-purple-600' : color.includes('green') ? 'text-green-600' : color.includes('orange') ? 'text-orange-600' : color.includes('rose') ? 'text-rose-600' : color.includes('cyan') ? 'text-cyan-600' : 'text-gray-600'}`}>
        {title}
      </div>
      {children}
    </div>
  );

  const ComponentBox = ({ icon: Icon, title, subtitle, color = "bg-white" }) => (
    <div className={`${color} rounded-lg p-3 shadow-sm border border-gray-200 flex items-center gap-3 hover:shadow-md transition-shadow`}>
      <div className="p-2 bg-gray-100 rounded-lg">
        <Icon size={18} className="text-gray-700" />
      </div>
      <div>
        <div className="font-semibold text-sm text-gray-800">{title}</div>
        {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
      </div>
    </div>
  );

  const AgentBox = ({ title, color }) => (
    <div className={`${color} rounded-lg px-3 py-2 text-center shadow-sm`}>
      <div className="font-medium text-sm text-white">{title}</div>
    </div>
  );

  const Arrow = ({ direction = "down", className = "" }) => (
    <div className={`flex justify-center items-center ${className}`}>
      {direction === "down" && (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
          <path d="M12 4v16m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      {direction === "bidirectional" && (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
          <path d="M12 2v20M12 2l-4 4M12 2l4 4M12 22l-4-4M12 22l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">SMSA Express AI Assistant</h1>
          <p className="text-gray-600">Abstract System Architecture</p>
        </div>

        <div className="space-y-4">
          {/* Client Layer */}
          <LayerBox title="Client Layer" color="border-blue-300 bg-blue-50/50">
            <div className="flex justify-center gap-8">
              <ComponentBox icon={Monitor} title="Web Application" subtitle="ai.smsaexpress.com" />
              <ComponentBox icon={Smartphone} title="Mobile Application" subtitle="SMSA Mobile" />
            </div>
          </LayerBox>

          <Arrow direction="bidirectional" />

          {/* API Gateway */}
          <LayerBox title="Gateway Layer" color="border-slate-300 bg-slate-50/50">
            <div className="flex justify-center">
              <ComponentBox icon={Shield} title="API Gateway" subtitle="Auth • Rate Limiting • Routing" />
            </div>
          </LayerBox>

          <Arrow direction="bidirectional" />

          {/* Master Agent / Orchestration */}
          <LayerBox title="Master Agent - Core Orchestration" color="border-purple-300 bg-purple-50/50">
            <div className="grid grid-cols-3 gap-4">
              <ComponentBox icon={Zap} title="Intent Router" subtitle="Template Prompting • Classification" />
              <ComponentBox icon={Brain} title="AI Orchestrator" subtitle="Routing Decision • Coordination" />
              <ComponentBox icon={FileText} title="Context Assembly" subtitle="History • User Profile • Files" />
            </div>
            <div className="mt-3 text-center">
              <span className="inline-block bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-medium">
                Quadrailing AI: Chain-of-Thought (COT) • Single Shot
              </span>
            </div>
          </LayerBox>

          <Arrow direction="bidirectional" />

          {/* Specialized Agents */}
          <LayerBox title="Specialized Agents" color="border-green-300 bg-green-50/50">
            <div className="grid grid-cols-5 gap-3">
              <AgentBox title="Tracking Agent" color="bg-emerald-500" />
              <AgentBox title="Rates Agent" color="bg-teal-500" />
              <AgentBox title="Retail Centres" color="bg-cyan-500" />
              <AgentBox title="FAQ Agent" color="bg-sky-500" />
              <AgentBox title="Deepseek AI" color="bg-indigo-500" />
            </div>
            <div className="mt-4 flex justify-center">
              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Server size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">Agent Instructions Framework</span>
                </div>
                <div className="h-4 w-px bg-gray-300" />
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">Response Generator (FastAPI)</span>
                </div>
                <div className="h-4 w-px bg-gray-300" />
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">SSE Stream</span>
                </div>
              </div>
            </div>
          </LayerBox>

          <div className="grid grid-cols-2 gap-4">
            {/* Memory Layer */}
            <div>
              <Arrow direction="bidirectional" className="mb-4" />
              <LayerBox title="Memory Layer" color="border-orange-300 bg-orange-50/50">
                <div className="space-y-3">
                  <ComponentBox icon={Database} title="Vector Database" subtitle="Embeddings • Semantic Search" />
                  <ComponentBox icon={Database} title="MongoDB" subtitle="Users • Conversations • Messages" />
                </div>
              </LayerBox>
            </div>

            {/* External Services */}
            <div>
              <Arrow direction="bidirectional" className="mb-4" />
              <LayerBox title="External Services" color="border-rose-300 bg-rose-50/50">
                <div className="space-y-3">
                  <ComponentBox icon={Cloud} title="SMSA APIs" subtitle="Circuit Breaker • Retry • Cache" />
                  <ComponentBox icon={Brain} title="Deepseek AI" subtitle="Embeddings • Vision • Chat" />
                </div>
              </LayerBox>
            </div>
          </div>

          {/* Storage & Vision */}
          <div className="grid grid-cols-2 gap-4">
            <LayerBox title="File Storage" color="border-cyan-300 bg-cyan-50/50">
              <ComponentBox icon={FileText} title="S3 Bucket" subtitle="Conversations • Uploads • Context Files" />
            </LayerBox>
            <LayerBox title="Document Processing" color="border-violet-300 bg-violet-50/50">
              <ComponentBox icon={Eye} title="Vision API" subtitle="SAWB Processing • OCR • Extraction" />
            </LayerBox>
          </div>

          {/* Monitoring */}
          <LayerBox title="Monitoring & Observability" color="border-amber-300 bg-amber-50/50">
            <div className="flex justify-center">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Activity size={18} className="text-amber-600" />
                  <span className="font-semibold text-gray-800">Centralized Monitoring</span>
                </div>
                <div className="flex gap-6 text-sm text-gray-600">
                  <span>• Request/Response Logging</span>
                  <span>• Token Usage Tracking</span>
                  <span>• Latency per Agent</span>
                  <span>• Hallucination Detection</span>
                  <span>• Satisfaction Scores</span>
                </div>
              </div>
            </div>
          </LayerBox>
        </div>

        {/* Legend */}
        <div className="mt-8 flex justify-center">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Data Flow Legend</div>
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-gray-400"></div>
                <span className="text-gray-600">Bidirectional Communication</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-purple-100 border border-purple-300"></div>
                <span className="text-gray-600">Orchestration</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-100 border border-green-300"></div>
                <span className="text-gray-600">Agents</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-100 border border-orange-300"></div>
                <span className="text-gray-600">Storage</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-400">
          SMSA Express AI Assistant Architecture v1.0 • January 2025
        </div>
      </div>
    </div>
  );
}
