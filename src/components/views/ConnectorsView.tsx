import React from 'react';
import {
  Mail,
  MessageSquare,
  Smartphone,
  PhoneCall,
  Calendar,
  RefreshCw,
  Settings,
  Hash,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { ConnectorConfig, ChannelType } from '../../types.ts';

interface ConnectorsViewProps {
  connectors: ConnectorConfig[];
  onToggleConnector: (id: ChannelType) => void;
  onSimulateInbound: (channel: ChannelType) => void;
  onOpenConnectorModal: (id: ChannelType) => void;
  onSyncGmail?: () => void;
  isSyncingGmail?: boolean;
  userEmail?: string;
}

export const ConnectorsView: React.FC<ConnectorsViewProps> = ({
  connectors,
  onToggleConnector,
  onSimulateInbound,
  onOpenConnectorModal,
  onSyncGmail,
  isSyncingGmail = false,
  userEmail,
}) => {
  const getIcon = (id: ChannelType) => {
    switch (id) {
      case 'slack':
        return Hash;
      case 'whatsapp':
        return MessageSquare;
      case 'sms':
        return Smartphone;
      case 'call_transcript':
        return PhoneCall;
      case 'email':
      default:
        return Mail;
    }
  };

  const getChannelColor = (id: ChannelType) => {
    switch (id) {
      case 'slack':
        return { bg: 'bg-emerald-950 text-white', iconText: 'text-amber-300' };
      case 'whatsapp':
        return { bg: 'bg-emerald-100 text-emerald-800', iconText: 'text-emerald-700' };
      case 'sms':
        return { bg: 'bg-amber-100 text-amber-800', iconText: 'text-amber-700' };
      case 'email':
        return { bg: 'bg-violet-100 text-violet-800', iconText: 'text-violet-700' };
      case 'call_transcript':
      default:
        return { bg: 'bg-indigo-100 text-indigo-800', iconText: 'text-indigo-700' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Communication & Work Connectors Hub
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Active integrations for Google Workspace, Google SMS, WhatsApp Business, and Slack
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onSyncGmail && (
            <button
              type="button"
              onClick={onSyncGmail}
              disabled={isSyncingGmail}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-900 hover:bg-violet-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGmail ? 'animate-spin' : ''}`} />
              <span>{isSyncingGmail ? 'Syncing Gmail...' : 'Sync Gmail Now'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Connectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connectors.map((connector) => {
          const Icon = getIcon(connector.id);
          const color = getChannelColor(connector.id);

          return (
            <div
              key={connector.id}
              className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${color.bg} flex items-center justify-center font-bold shadow-xs`}>
                      <Icon className={`w-5 h-5 ${color.iconText}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {connector.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`flex items-center gap-1 text-[11px] font-semibold ${
                            connector.connected ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              connector.connected ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                          />
                          <span>{connector.connected ? 'Connected' : 'Disconnected'}</span>
                        </span>
                        <span className="text-[11px] text-slate-300">·</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {Math.round((Date.now() - connector.lastSync) / (1000 * 60))}m ago
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenConnectorModal(connector.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Configure connector settings & keys"
                    >
                      <Settings className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleConnector(connector.id)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                        connector.connected
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          : 'bg-violet-900 text-white hover:bg-violet-800'
                      }`}
                    >
                      {connector.connected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mt-2">
                  {connector.description}
                </p>

                {connector.accountIdentifier && (
                  <div className="mt-2.5 px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Identifier / Link:</span>
                    <span className="text-slate-800 font-mono font-semibold truncate max-w-[200px]">
                      {connector.accountIdentifier}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">
                  Unread: {connector.unreadCount} items
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onOpenConnectorModal(connector.id)}
                    className="text-slate-600 hover:text-slate-900 font-medium text-[11px] cursor-pointer"
                  >
                    Setup & Settings
                  </button>

                  <button
                    type="button"
                    onClick={() => onSimulateInbound(connector.id)}
                    disabled={!connector.connected}
                    className="flex items-center gap-1 text-violet-800 hover:text-violet-950 font-semibold disabled:opacity-40 cursor-pointer text-[11px]"
                    title="Simulate receiving a new inbound ping"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Simulate Ping</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Google Calendar Sync Card */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 shadow-xs">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Google Calendar & iCal Engine
                </h3>
                <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Integrated with {userEmail || 'Google Account'}</span>
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mt-2">
            Automatically maps dates, cutoffs, and deadlines extracted from Slack, WhatsApp, SMS, and Gmail into your calendar.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 font-mono flex items-center justify-between">
            <span>Direct ICS & Cal sync active</span>
            <span className="text-emerald-700 font-semibold">● Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
