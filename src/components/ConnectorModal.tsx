import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Smartphone,
  MessageSquare,
  Hash,
  Mail,
  QrCode,
  Key,
  Globe,
  Radio,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  PhoneCall,
  Check,
  Send,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { ConnectorConfig, ChannelType } from '../types.ts';

interface ConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectorId: ChannelType | null;
  connectors: ConnectorConfig[];
  onToggleConnector: (id: ChannelType) => void;
  onSimulateInbound: (channel: ChannelType) => void;
  onSaveConnectorConfig?: (id: ChannelType, config: Record<string, any>) => void;
  onSyncGmail?: () => void;
  isSyncingGmail?: boolean;
}

export const ConnectorModal: React.FC<ConnectorModalProps> = ({
  isOpen,
  onClose,
  connectorId,
  connectors,
  onToggleConnector,
  onSimulateInbound,
  onSaveConnectorConfig,
  onSyncGmail,
  isSyncingGmail = false,
}) => {
  const [activeTab, setActiveTab] = useState<'device' | 'api' | 'webhook'>('device');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [pairingSuccess, setPairingSuccess] = useState(false);
  const [isTestingSlack, setIsTestingSlack] = useState(false);
  const [slackTestResult, setSlackTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Form states with persisted defaults
  const [slackToken, setSlackToken] = useState('xoxb-982103829-8472910-48291029');
  const [slackDomain, setSlackDomain] = useState('acme-corp.slack.com');
  const [slackWebhook, setSlackWebhook] = useState('https://hooks.slack.com/services/T0123/B0456/XYZ789');

  const [whatsappPhoneId, setWhatsappPhoneId] = useState('109823471029341');
  const [whatsappToken, setWhatsappToken] = useState('EAABwzL1...[Meta Graph API Token]');
  const [whatsappVerifyToken, setWhatsappVerifyToken] = useState('oneline_ai_verify');

  const [smsGatewayNumber, setSmsGatewayNumber] = useState('+1 (800) 555-0199');
  const [smsDeviceName, setSmsDeviceName] = useState('Google Pixel 9 Pro');

  if (!isOpen || !connectorId) return null;

  const connector = connectors.find((c) => c.id === connectorId);
  if (!connector) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000';

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handlePairSimulate = () => {
    setPairingSuccess(true);
    setTimeout(() => {
      setPairingSuccess(false);
      if (!connector.connected) {
        onToggleConnector(connector.id);
      }
    }, 1200);
  };

  const handleTestSlackWebhook = async () => {
    setIsTestingSlack(true);
    setSlackTestResult(null);
    try {
      const res = await fetch('/api/connectors/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'slack',
          webhookUrl: slackWebhook,
          text: '🚀 Verification test from OneLine AI: Slack connector is live and responsive!',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSlackTestResult({
          success: true,
          message: data.message || 'Test message dispatched to Slack!',
        });
      } else {
        setSlackTestResult({
          success: false,
          message: data.error || 'Failed to dispatch to Slack webhook.',
        });
      }
    } catch (err: any) {
      setSlackTestResult({
        success: false,
        message: err.message || 'Connection error while contacting server.',
      });
    } finally {
      setIsTestingSlack(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {connector.id === 'slack' && <span className="text-amber-300 font-bold">#</span>}
              {connector.id === 'whatsapp' && <MessageSquare className="w-5 h-5 text-emerald-300" />}
              {connector.id === 'sms' && <Smartphone className="w-5 h-5 text-amber-300" />}
              {connector.id === 'email' && <Mail className="w-5 h-5 text-violet-300" />}
              {connector.id === 'call_transcript' && <PhoneCall className="w-5 h-5 text-indigo-300" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  {connector.name}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                    connector.connected
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      connector.connected ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                  <span>{connector.connected ? 'Connected' : 'Disconnected'}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {connector.accountIdentifier || connector.description}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Channel-Specific Configuration */}

          {/* 1. Google SMS / Messages */}
          {connector.id === 'sms' && (
            <div className="space-y-4">
              <div className="flex border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('device')}
                  className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === 'device'
                      ? 'border-violet-900 text-violet-900'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Google Messages Device Pair
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('api')}
                  className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === 'api'
                      ? 'border-violet-900 text-violet-900'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Live SMS Webhook / Twilio
                </button>
              </div>

              {activeTab === 'device' ? (
                <div className="space-y-3">
                  <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-start gap-3">
                    <QrCode className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-900">
                        Pair Android Google Messages
                      </h4>
                      <p className="text-[11px] text-amber-800 leading-relaxed mt-1">
                        1. Open the <strong>Google Messages</strong> app on your Android phone.<br />
                        2. Tap your profile icon &gt; <strong>Device pairing</strong>.<br />
                        3. Tap <strong>QR code scanner</strong> or open Google Messages on the web to link device.
                      </p>
                      <div className="mt-2.5">
                        <a
                          href="https://messages.google.com/web"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 underline hover:text-amber-950"
                        >
                          <span>Open Google Messages Web</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* QR Code Graphic Simulation */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center space-y-3">
                    <div className="w-36 h-36 bg-white border-2 border-slate-900 rounded-lg p-2.5 shadow-xs flex flex-col justify-between">
                      <div className="flex justify-between">
                        <div className="w-8 h-8 bg-slate-900 rounded-sm" />
                        <div className="w-8 h-8 bg-slate-900 rounded-sm" />
                      </div>
                      <div className="flex items-center justify-center text-[10px] font-mono text-slate-600 font-bold">
                        GOOGLE SMS
                      </div>
                      <div className="flex justify-between">
                        <div className="w-8 h-8 bg-slate-900 rounded-sm" />
                        <div className="w-4 h-4 bg-amber-500 rounded-full animate-ping" />
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Pairing Token: MSG-ANDROID-SYNC-2026
                    </span>

                    <button
                      type="button"
                      onClick={handlePairSimulate}
                      className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {pairingSuccess ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-200" />
                          <span>Paired Successfully!</span>
                        </>
                      ) : (
                        <>
                          <Radio className="w-4 h-4" />
                          <span>Verify & Pair Phone Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      SMS Gateway Phone Number
                    </label>
                    <input
                      type="text"
                      value={smsGatewayNumber}
                      onChange={(e) => setSmsGatewayNumber(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Live Inbound Webhook URL (POST)
                    </label>
                    <p className="text-[11px] text-slate-500 mb-1.5">
                      Configure Twilio, Vonage, or Android SMS Forwarder to POST incoming messages here:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${currentOrigin}/api/webhooks/sms`}
                        className="flex-1 text-xs px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg font-mono text-slate-600 select-all"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            `${currentOrigin}/api/webhooks/sms`,
                            'sms-hook'
                          )
                        }
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        {copiedKey === 'sms-hook' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. WhatsApp Business & Web */}
          {connector.id === 'whatsapp' && (
            <div className="space-y-4">
              <div className="flex border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('device')}
                  className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === 'device'
                      ? 'border-emerald-700 text-emerald-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  WhatsApp Web Link
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('api')}
                  className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === 'api'
                      ? 'border-emerald-700 text-emerald-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Meta Cloud API & Webhook
                </button>
              </div>

              {activeTab === 'device' ? (
                <div className="space-y-3">
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-start gap-3">
                    <MessageSquare className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950">
                        Link WhatsApp Account
                      </h4>
                      <p className="text-[11px] text-emerald-800 leading-relaxed mt-1">
                        1. Open WhatsApp on your phone.<br />
                        2. Tap Menu or Settings &gt; <strong>Linked Devices</strong> &gt; <strong>Link a Device</strong>.<br />
                        3. Scan the QR code or launch WhatsApp Web to connect.
                      </p>
                      <div className="mt-2.5">
                        <a
                          href="https://web.whatsapp.com"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 underline hover:text-emerald-900"
                        >
                          <span>Open WhatsApp Web</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center space-y-3">
                    <div className="w-36 h-36 bg-white border-2 border-emerald-900 rounded-lg p-2.5 shadow-xs flex flex-col justify-between">
                      <div className="flex justify-between">
                        <div className="w-8 h-8 bg-emerald-800 rounded-sm" />
                        <div className="w-8 h-8 bg-emerald-800 rounded-sm" />
                      </div>
                      <div className="flex items-center justify-center text-[10px] font-mono text-emerald-700 font-bold">
                        WHATSAPP WEB
                      </div>
                      <div className="flex justify-between">
                        <div className="w-8 h-8 bg-emerald-800 rounded-sm" />
                        <div className="w-4 h-4 bg-emerald-500 rounded-full animate-ping" />
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Linked: +1 (415) 890-2341 (Business Care)
                    </span>

                    <button
                      type="button"
                      onClick={handlePairSimulate}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {pairingSuccess ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-200" />
                          <span>Connected Successfully!</span>
                        </>
                      ) : (
                        <>
                          <Radio className="w-4 h-4" />
                          <span>Confirm Device Linked</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Meta Cloud Webhook Callback URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${currentOrigin}/api/webhooks/whatsapp`}
                        className="flex-1 text-xs px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg font-mono text-slate-600 select-all"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            `${currentOrigin}/api/webhooks/whatsapp`,
                            'wa-hook'
                          )
                        }
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        {copiedKey === 'wa-hook' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Webhook Verify Token
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={whatsappVerifyToken}
                        className="flex-1 text-xs px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg font-mono text-slate-600"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(whatsappVerifyToken, 'wa-token')
                        }
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        {copiedKey === 'wa-token' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Phone Number ID
                    </label>
                    <input
                      type="text"
                      value={whatsappPhoneId}
                      onChange={(e) => setWhatsappPhoneId(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Meta Graph API Token
                    </label>
                    <input
                      type="password"
                      value={whatsappToken}
                      onChange={(e) => setWhatsappToken(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Slack Workspace */}
          {connector.id === 'slack' && (
            <div className="space-y-4">
              <div className="flex border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('api')}
                  className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === 'api'
                      ? 'border-violet-900 text-violet-900'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Slack Incoming Webhook
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('webhook')}
                  className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === 'webhook'
                      ? 'border-violet-900 text-violet-900'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Events API & Inbound Hook
                </button>
              </div>

              {activeTab === 'api' ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Your Slack Incoming Webhook URL
                    </label>
                    <p className="text-[11px] text-slate-500 mb-1.5">
                      Paste an Incoming Webhook from your Slack App to post notifications directly into Slack:
                    </p>
                    <input
                      type="text"
                      value={slackWebhook}
                      onChange={(e) => setSlackWebhook(e.target.value)}
                      placeholder="https://hooks.slack.com/services/..."
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleTestSlackWebhook}
                      disabled={isTestingSlack || !slackWebhook.startsWith('https://hooks.slack.com')}
                      className="px-3.5 py-1.5 bg-violet-900 hover:bg-violet-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Send className={`w-3.5 h-3.5 ${isTestingSlack ? 'animate-spin' : ''}`} />
                      <span>{isTestingSlack ? 'Sending...' : 'Send Live Test Ping to Slack'}</span>
                    </button>
                  </div>

                  {slackTestResult && (
                    <div
                      className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                        slackTestResult.success
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {slackTestResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <span>{slackTestResult.message}</span>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Slack Workspace URL
                    </label>
                    <input
                      type="text"
                      value={slackDomain}
                      onChange={(e) => setSlackDomain(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
                    />
                  </div>

                  <div className="p-3 bg-violet-50/70 border border-violet-100 rounded-lg text-xs text-violet-950 space-y-1">
                    <span className="font-bold block">Active Channel Subscriptions:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <span className="px-2 py-0.5 bg-white border border-violet-200 rounded font-mono text-[11px] font-semibold">
                        #infra-migration
                      </span>
                      <span className="px-2 py-0.5 bg-white border border-violet-200 rounded font-mono text-[11px] font-semibold">
                        #client-escalations
                      </span>
                      <span className="px-2 py-0.5 bg-white border border-violet-200 rounded font-mono text-[11px] font-semibold">
                        #engineering
                      </span>
                      <span className="px-2 py-0.5 bg-white border border-violet-200 rounded font-mono text-[11px] font-semibold">
                        #general
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Inbound Slack Webhook / Request URL
                    </label>
                    <p className="text-[11px] text-slate-500 mb-1.5">
                      In your Slack App settings (Event Subscriptions or Slash Commands), set the Request URL to:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${currentOrigin}/api/webhooks/slack`}
                        className="flex-1 text-xs px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg font-mono text-slate-600 select-all"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            `${currentOrigin}/api/webhooks/slack`,
                            'slack-hook'
                          )
                        }
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        {copiedKey === 'slack-hook' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. Google Workspace & Gmail */}
          {connector.id === 'email' && (
            <div className="space-y-4">
              <div className="p-4 bg-violet-50 border border-violet-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-violet-700" />
                    <span className="text-xs font-bold text-violet-950">
                      Google OAuth Authentication
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Connected: nrkamde333@gmail.com
                  </span>
                </div>
                <p className="text-xs text-violet-900 leading-relaxed">
                  Real Gmail synchronization is enabled with OAuth scope{' '}
                  <code className="text-[10px] bg-white px-1 py-0.5 rounded font-mono">
                    https://www.googleapis.com/auth/gmail.readonly
                  </code>
                  . When signing in, ensure you approve the checkbox to view email messages.
                </p>
              </div>

              {onSyncGmail && (
                <button
                  type="button"
                  onClick={onSyncGmail}
                  disabled={isSyncingGmail}
                  className="w-full py-2.5 px-4 bg-violet-900 hover:bg-violet-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncingGmail ? 'animate-spin' : ''}`} />
                  <span>{isSyncingGmail ? 'Syncing Gmail Inbox...' : 'Sync Recent Gmail Messages Now'}</span>
                </button>
              )}
            </div>
          )}

          {/* 5. VoIP Transcripts */}
          {connector.id === 'call_transcript' && (
            <div className="space-y-3">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1">
                <span className="text-xs font-bold text-indigo-950">
                  VoIP & Zoom Phone Transcription Bridge
                </span>
                <p className="text-xs text-indigo-800">
                  Ingests meeting recordings and telephony transcripts, parsing dialogue turns and action directives.
                </p>
              </div>
            </div>
          )}

          {/* Test Simulation Section */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Live Inbound Testing
              </span>
              <span className="text-[11px] text-slate-400">
                Simulate receiving an urgent incoming message through this connector
              </span>
            </div>

            <button
              type="button"
              onClick={() => onSimulateInbound(connector.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-violet-700" />
              <span>Simulate Ping</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onToggleConnector(connector.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              connector.connected
                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                : 'bg-emerald-700 text-white hover:bg-emerald-800'
            }`}
          >
            {connector.connected ? 'Disconnect Channel' : 'Enable & Connect Channel'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
