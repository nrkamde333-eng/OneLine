import { OfficeMessage, ConnectorConfig, ScheduledEvent, SeeLaterItem } from '../types.ts';

export const INITIAL_CONNECTORS: ConnectorConfig[] = [
  {
    id: 'email',
    name: 'Google Workspace & Gmail',
    description: 'OAuth-authenticated Gmail inbox, customer inquiries, and executive notices',
    connected: true,
    lastSync: Date.now() - 1000 * 60 * 3,
    unreadCount: 3,
    iconName: 'Mail',
    accountIdentifier: 'nrkamde333@gmail.com',
    syncStatus: 'synced',
    configDetails: {
      provider: 'Google Workspace',
      scope: 'https://www.googleapis.com/auth/gmail.readonly',
      autoSyncIntervalMinutes: 5,
    },
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business & Web',
    description: 'Active client steering groups, instant WhatsApp customer care, and partner chats',
    connected: true,
    lastSync: Date.now() - 1000 * 60 * 8,
    unreadCount: 2,
    iconName: 'MessageSquare',
    accountIdentifier: '+1 (415) 890-2341 (Cloud API)',
    syncStatus: 'synced',
    configDetails: {
      phoneNumberId: '109823471029341',
      businessAccount: 'Global Retail Steering Care',
      webhookUrl: 'https://ais-dev-wa4ec6dxfuybewt2iiompt-97379259357.asia-southeast1.run.app/api/webhooks/whatsapp',
      verifiedName: 'OneLine Client Support',
    },
  },
  {
    id: 'sms',
    name: 'Google SMS & Messages Gateway',
    description: 'Google Messages Android pairing, RCS customer alerts, and DevOps on-call pager',
    connected: true,
    lastSync: Date.now() - 1000 * 60 * 1,
    unreadCount: 2,
    iconName: 'Smartphone',
    accountIdentifier: 'Android Device Pair: Pixel 9 Pro (+1 800-555-0199)',
    syncStatus: 'synced',
    configDetails: {
      device: 'Google Pixel 9 Pro',
      carrier: 'Google Fi RCS Wireless',
      pairingStatus: 'paired',
      gatewayNumber: '+1 (800) 555-0199',
    },
  },
  {
    id: 'slack',
    name: 'Slack Workspace Connect',
    description: 'Engineering channels (#infra-migration, #engineering), client escalations, and mentions',
    connected: true,
    lastSync: Date.now() - 1000 * 60 * 5,
    unreadCount: 2,
    iconName: 'Slack',
    accountIdentifier: 'acme-corp.slack.com (#infra-migration, #client-escalations)',
    syncStatus: 'synced',
    configDetails: {
      workspace: 'Acme Corp HQ',
      workspaceUrl: 'https://acme-corp.slack.com',
      channels: ['#infra-migration', '#client-escalations', '#engineering', '#general'],
      botName: 'OneLine Bot',
    },
  },
  {
    id: 'call_transcript',
    name: 'VoIP & Phone Transcripts',
    description: 'Customer service recordings, Zoom steering reviews, and call minutes',
    connected: true,
    lastSync: Date.now() - 1000 * 60 * 25,
    unreadCount: 2,
    iconName: 'PhoneCall',
    accountIdentifier: 'Zoom Phone & SIP Trunk PBX',
    syncStatus: 'synced',
    configDetails: {
      provider: 'Zoom & Twilio Voice SIP',
      transcriptionModel: 'Gemini Audio Speech-to-Text',
    },
  },
];

export const INITIAL_OFFICE_MESSAGES: OfficeMessage[] = [
  // 1. Emails
  {
    id: 'email-1',
    channel: 'email',
    sender: 'Elena Rostova (Principal Infrastructure Architect)',
    senderContact: 'elena.r@enterprise.internal',
    timestamp: Date.now() - 1000 * 60 * 15,
    subject: 'URGENT: Q3 Cloud Database Migration & Weekend Freeze Notice',
    rawText: `Team,

Please be advised that the Infrastructure & Reliability Engineering team will execute the planned Postgres Aurora cluster failover and schema migration (v4.12) this upcoming Saturday, October 18, between 02:00 UTC and 05:00 UTC.

During this 3-hour maintenance window:
- Write operations on billing and user session databases will be temporarily queued in Redis buffers.
- Read-only replicas will remain accessible with an estimated latency increase of approximately 45ms.
- Any background Celery worker jobs scheduled to run during this window will be automatically paused at 01:45 UTC.

Action Items:
1. All squad leads must freeze non-critical production deployments starting Friday, October 17 at 18:00 UTC until Sunday, October 19 at 12:00 UTC.
2. Marcus Chen needs to verify read replica health checks by Friday 15:00 UTC and alert the war-room Slack channel #infra-migration.
3. Front-end teams must ensure maintenance notification banners are deployed to production staging by Thursday, October 16 at 17:00 UTC.

Note: In the event of schema rollback criteria being triggered (latency > 250ms for more than 5 consecutive minutes post-switchover), automated rollback will revert to snapshot 'aurora-snap-20261017-0100'. It remains unconfirmed whether downstream third-party webhook consumers need to whitelist the secondary proxy IP address.

Let me know if there are blocking concerns before Thursday's go/no-go standup.`,
    status: 'distilled',
  },
  {
    id: 'email-2',
    channel: 'email',
    sender: 'Jonathan Vance (Senior Client Partner)',
    senderContact: 'jonathan.vance@agency.com',
    timestamp: Date.now() - 1000 * 60 * 95,
    subject: 'Contract Escalation: Milestone 2 Inventory Module & SLA Review',
    rawText: `Hi David and the Delivery Squad,

Following up on our steering committee check-in yesterday with Global Retail Partners.

The client's VP of Operations, Sarah Jenkins, has formally requested that we incorporate the real-time inventory synchronization module into Milestone 2 instead of holding it for Q4. However, they are refusing to adjust the overall go-live date originally set for November 14, 2026.

To move forward without blowing our margin:
- We must submit an amended Statement of Work (SOW) reflecting the extra 120 engineering hours and the revised $24,500 line item by this Friday, October 17 at 5:00 PM EST.
- David must obtain written approval from Sarah Jenkins and their procurement director before any code is merged into the staging environment.
- Maya needs to review the contract clause regarding SLAs on third-party inventory API uptime by Wednesday at noon.

Please note that Sarah did not clarify whether the weekend user acceptance testing (UAT) will still be conducted by their London staff or outsourced to their Singapore operations center.

If we do not receive counter-signatures by Friday close of business, we are instructed by executive management to pause all active development on Sprint 4.`,
    status: 'unread',
  },
  {
    id: 'email-3',
    channel: 'email',
    sender: 'Enterprise Billing & Procurement Support',
    senderContact: 'billing-support@vendor-portal.com',
    timestamp: Date.now() - 1000 * 60 * 220,
    subject: 'Action Required: Annual Software License Renewal Notice',
    rawText: `Dear Account Administrator,

Your enterprise subscription for Cloud Monitoring & Telemetry (Seats: 45) will expire on October 25, 2026.

To maintain continuous service:
1. Please confirm purchase order PO-88912 through the vendor portal before Wednesday, October 21 at 17:00 CET.
2. Update credit card authorization or attach wire transfer remittance advice.

Failure to renew before the deadline will transition your tenant to read-only status.`,
    status: 'unread',
  },

  // 2. WhatsApp Chats
  {
    id: 'wa-1',
    channel: 'whatsapp',
    sender: 'Sarah Jenkins (VP Ops, Global Retail)',
    senderContact: '+1 (415) 890-2341 · WhatsApp Business',
    timestamp: Date.now() - 1000 * 60 * 12,
    subject: 'Group: [Global Retail Steering & Delivery]',
    rawText: `Sarah: Hey team! Quick ping on the Milestone 2 inventory module. We just spoke with our executive board. We need that amended SOW by Friday 5 PM EST sharp with the $24.5k budget line item.

Sarah: Also David, please make sure procurement gets the sign-off document before anything hits staging.

Sarah: Regarding weekend UAT: London operations might be short-staffed, so we might route testing to our Singapore team. We will look after that decision on Monday after the contract is countersigned. Thanks!`,
    status: 'unread',
  },
  {
    id: 'wa-2',
    channel: 'whatsapp',
    sender: 'Liam O\'Connor (Lead Site Reliability Engineer)',
    senderContact: '+44 20 7946 0912 · WhatsApp DevOps War Room',
    timestamp: Date.now() - 1000 * 60 * 35,
    subject: 'Group: [DevOps On-Call Incident Response]',
    rawText: `Liam: War room check-in for the Saturday database failover. I will be enforcing the deploy freeze starting Friday at 18:00 UTC. 

Liam: Front-end squad leads, don't forget the maintenance notification banner must be deployed to staging by Thursday 17:00 UTC!

Liam: Someone still needs to verify if our payment webhook gateway needs secondary IP whitelisting. Marcus, can you check that tomorrow?`,
    status: 'unread',
  },

  // 3. SMS & Text Alerts
  {
    id: 'sms-1',
    channel: 'sms',
    sender: 'DevOps PagerDuty Alert (INC-8821)',
    senderContact: '+1 (800) 555-0199',
    timestamp: Date.now() - 1000 * 60 * 4,
    subject: 'CRITICAL ALERT: Aurora Cluster Migration Window',
    rawText: `URGENT OPS ALERT: Scheduled Aurora Postgres cluster migration planned for Saturday, Oct 18 (02:00-05:00 UTC).
- Liam: freeze all production deploys by Friday 18:00 UTC.
- Marcus Chen: verify replica health by Friday 15:00 UTC.
- Front-end banner must go live Thursday 17:00 UTC.
Rollback triggers if latency > 250ms for 5 mins. Webhook proxy whitelist status is currently UNKNOWN.`,
    status: 'unread',
  },
  {
    id: 'sms-2',
    channel: 'sms',
    sender: 'Customer Care Priority Desk',
    senderContact: '+1 (888) 421-9900',
    timestamp: Date.now() - 1000 * 60 * 65,
    subject: 'VIP Support Ticket #9941',
    rawText: `SMS TICKET: Client VIP Enterprise reported checkout 504 errors on payment gateway. Priya Sharma is incident commander.Liam O'Connor must increase Redis timeout cache TTL to 2000ms by 16:00 UTC today. Formal post-mortem scheduled Wednesday Oct 15 at 14:00 UTC.`,
    status: 'unread',
  },

  // 4. VoIP & Call Transcripts
  {
    id: 'call-1',
    channel: 'call_transcript',
    sender: 'Dr. Kenneth Patel (CTO Executive Review)',
    senderContact: 'Zoom Meeting Room #412-881 (Duration: 18m 42s)',
    timestamp: Date.now() - 1000 * 60 * 50,
    subject: 'Call Transcript: Tooling Consolidation & Security Vault Policy',
    rawText: `[00:02] Kenneth Patel: "Thanks everyone for hopping on the emergency review. Over the past three quarters, company-wide tool proliferation has resulted in excessive expenditures. Effective immediately, all ad-hoc diagramming software licenses will be terminated in favor of company-wide FigJam enterprise seats."

[04:15] Kenneth Patel: "Second item: any repository storing staging configuration credentials must migrate to HashiCorp Vault. Storing secrets in repository environment files is strictly forbidden. Tech leads must coordinate with InfoSec to conduct credential rotation today."

[08:30] Kenneth Patel: "Engineering Managers must audit their teams' third-party SaaS subscriptions and submit cancellation receipts through the internal procurement portal before Monday morning."`,
    status: 'unread',
  },
  {
    id: 'call-2',
    channel: 'call_transcript',
    sender: 'Customer Support Escalation Check-in',
    senderContact: 'Recorded Phone Line · Agent: David Ross (Duration: 11m 15s)',
    timestamp: Date.now() - 1000 * 60 * 140,
    subject: 'Call Transcript: Enterprise Client Checkout Downtime Review',
    rawText: `[00:05] David Ross: "Hello Sarah, following up on the payment timeouts reported this morning."

[02:10] Sarah Jenkins: "Yes David, we estimated approximately $38,000 in abandoned carts during the 88-minute window. We need your platform squad to implement exponential backoff on payment retries before Thursday, October 16."

[06:20] David Ross: "Understood. Priya Sharma is drafting the formal post-mortem for review on Wednesday at 14:00 UTC, and Liam is bumping the Redis timeout cache TTL to 2000ms today."`,
    status: 'unread',
  },

  // 5. Slack Workspace Channels
  {
    id: 'slack-1',
    channel: 'slack',
    sender: 'Marcus Chen (#infra-migration)',
    senderContact: 'acme-corp.slack.com/#infra-migration',
    timestamp: Date.now() - 1000 * 60 * 18,
    subject: '#infra-migration: Saturday Postgres Aurora Failover & Checklist',
    rawText: `@channel Marcus Chen: Quick sync on this weekend's Aurora database failover:
- Liam confirmed deployment freeze starts Friday 18:00 UTC.
- I will run read-replica latency benchmarks by Friday 15:00 UTC and drop the Grafana metrics dashboard link here.
- Frontend squad: ping @elena when the maintenance notification banner is merged to staging (deadline: Thursday 17:00 UTC).
- Reminder: automatic rollback triggers if p99 latency > 250ms for 5 mins. Please check if webhook proxy secondary IP is added to the allowlist before Friday standup.`,
    status: 'unread',
  },
  {
    id: 'slack-2',
    channel: 'slack',
    sender: 'Sarah Jenkins (#client-escalations)',
    senderContact: 'acme-corp.slack.com/#client-escalations',
    timestamp: Date.now() - 1000 * 60 * 70,
    subject: '#client-escalations: Global Retail Milestone 2 SOW Update',
    rawText: `@here Sarah Jenkins posted in client slack:
"Team, executive committee approved the inventory sync scope change, but our procurement team strictly requires the amended SOW reflecting the $24,500 line item by Friday Oct 17 at 5 PM EST. David, please send the DocuSign link directly to our procurement director."
David Ross: Acknowledged, working on the draft with legal right now. Will route before Thursday afternoon.`,
    status: 'unread',
  },
];

export const INITIAL_SCHEDULED_EVENTS: ScheduledEvent[] = [
  {
    id: 'event-1',
    title: 'Deploy Front-end Maintenance Notification Banners',
    dateStr: '2026-10-16',
    timeStr: '17:00 UTC',
    channel: 'sms',
    description: 'Ensure maintenance banners are live on production staging ahead of weekend migration.',
    isCompleted: false,
    priority: 'high',
  },
  {
    id: 'event-2',
    title: 'Marcus Chen Read Replica Health Check',
    dateStr: '2026-10-17',
    timeStr: '15:00 UTC',
    channel: 'sms',
    description: 'Verify read replica health checks and post confirmation to #infra-migration.',
    isCompleted: false,
    priority: 'high',
  },
  {
    id: 'event-3',
    title: 'Submit Amended SOW ($24.5k) to Sarah Jenkins',
    dateStr: '2026-10-17',
    timeStr: '17:00 EST',
    channel: 'whatsapp',
    description: 'Revised Statement of Work reflecting 120 engineering hours for Milestone 2.',
    isCompleted: false,
    priority: 'high',
  },
  {
    id: 'event-4',
    title: 'Production Deploy Freeze Enforced',
    dateStr: '2026-10-17',
    timeStr: '18:00 UTC',
    channel: 'email',
    description: 'All squad leads freeze non-critical production deployments until Sunday.',
    isCompleted: false,
    priority: 'high',
  },
  {
    id: 'event-5',
    title: 'Postgres Aurora Cluster Failover Window',
    dateStr: '2026-10-18',
    timeStr: '02:00–05:00 UTC',
    channel: 'sms',
    description: '3-hour scheduled maintenance window with Redis write buffer queues.',
    isCompleted: false,
    priority: 'high',
  },
];

export const INITIAL_SEE_LATER_ITEMS: SeeLaterItem[] = [
  {
    id: 'later-1',
    title: 'Confirm London vs Singapore UAT Testing Team',
    reason: 'Client (Sarah Jenkins) did not clarify whether UAT will be handled by UK staff or outsourced center.',
    snoozedUntil: '2026-10-20',
    triageState: 'see_later',
    sourceChannel: 'whatsapp',
    createdAt: Date.now() - 1000 * 60 * 30,
    sourceQuote: 'Also, we haven\'t decided yet whether our London staff or Singapore outsourced team will run the weekend UAT.',
    priority: 'medium',
  },
  {
    id: 'later-2',
    title: 'Verify Downstream Webhook Secondary Proxy IP Whitelist',
    reason: 'Unconfirmed if external partners need new outbound IP whitelist entries before failover.',
    snoozedUntil: '2026-10-16',
    triageState: 'next_checked',
    sourceChannel: 'sms',
    createdAt: Date.now() - 1000 * 60 * 50,
    sourceQuote: 'Webhook proxy whitelist status is currently UNKNOWN.',
    priority: 'high',
  },
  {
    id: 'later-3',
    title: 'Review Third-Party Inventory API SLA Clause',
    reason: 'Maya to review SLA contractual limits once legal draft is delivered.',
    snoozedUntil: '2026-10-19',
    triageState: 'see_later',
    sourceChannel: 'email',
    createdAt: Date.now() - 1000 * 60 * 120,
    sourceQuote: 'Maya needs to review the contract clause regarding SLAs on third-party inventory API uptime.',
    priority: 'low',
  },
];
