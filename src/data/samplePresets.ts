import { SamplePreset } from '../types.ts';

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'db-migration',
    category: 'Engineering Announcement',
    title: 'Cloud Database Migration Window',
    description: 'Infrastructure update with scheduled maintenance and freeze window',
    content: `Team,

Please be advised that the Infrastructure & Reliability Engineering team will execute the planned Postgres Aurora cluster failover and schema migration (v4.12) this upcoming Saturday, October 18, between 02:00 UTC and 05:00 UTC.

During this 3-hour maintenance window:
- Write operations on the billing and user session databases will be temporarily queued in Redis buffers.
- Read-only replicas will remain accessible with an estimated latency increase of approximately 45ms.
- Any background Celery worker jobs scheduled to run during this window will be automatically paused at 01:45 UTC.

Action Items:
1. All squad leads must freeze non-critical production deployments starting Friday, October 17 at 18:00 UTC until Sunday, October 19 at 12:00 UTC.
2. Marcus Chen needs to verify read replica health checks by Friday 15:00 UTC and alert the war-room Slack channel #infra-migration.
3. Front-end teams must ensure maintenance notification banners are deployed to production staging by Thursday, October 16 at 17:00 UTC.

Note: In the event of schema rollback criteria being triggered (latency > 250ms for more than 5 consecutive minutes post-switchover), automated rollback will revert to snapshot 'aurora-snap-20261017-0100'. It remains unconfirmed whether downstream third-party webhook consumers need to whitelist the secondary proxy IP address.

Let me know if there are blocking concerns before Thursday's go/no-go standup.

Regards,
Elena Rostova
Principal Infrastructure Architect`,
  },
  {
    id: 'client-escalation',
    category: 'Client & Account Management',
    title: 'Enterprise Scope Expansion & Audit',
    description: 'Urgent contract change request and billing reconciliation email',
    content: `Hi David and the Delivery Squad,

Following up on our steering committee check-in yesterday with Global Retail Partners.

The client's VP of Operations, Sarah Jenkins, has formally requested that we incorporate the real-time inventory synchronization module into Milestone 2 instead of holding it for Q4. However, they are refusing to adjust the overall go-live date originally set for November 14, 2026.

To move forward without blowing our margin:
- We must submit an amended Statement of Work (SOW) reflecting the extra 120 engineering hours and the revised $24,500 line item by this Friday, October 17 at 5:00 PM EST.
- David must obtain written approval from Sarah Jenkins and their procurement director before any code is merged into the staging environment.
- Maya needs to review the contract clause regarding SLAs on third-party inventory API uptime by Wednesday at noon.

Please note that Sarah did not clarify whether the weekend user acceptance testing (UAT) will still be conducted by their London staff or outsourced to their Singapore operations center.

If we do not receive counter-signatures by Friday close of business, we are instructed by executive management to pause all active development on Sprint 4.

Best,
Jonathan Vance
Senior Client Partner`,
  },
  {
    id: 'policy-memo',
    category: 'Executive Policy Memo',
    title: 'Internal Tooling Consolidation & Security',
    description: 'Strategic internal memo with zero explicit deadlines (tests deadline fallback)',
    content: `MEMORANDUM

TO: All Engineering and Product Staff
FROM: Office of the Chief Technology Officer
SUBJECT: Enterprise Tooling Consolidation & Access Governance

Over the past three quarters, company-wide tool proliferation has resulted in overlapping license expenditures and increased data exposure vectors across fragmented SaaS vendors.

Effective immediately, the following policies are instituted:
- All ad-hoc diagramming software licenses will be terminated in favor of company-wide FigJam enterprise seats.
- Any repository storing staging configuration credentials must migrate to HashiCorp Vault. Storing secrets in repository environment files is strictly forbidden.
- Teams currently piloting experimental AI coding assistants must discontinue unapproved third-party extensions and utilize our vetted enterprise AI gateway.

Key Directives:
- Engineering Managers must audit their teams' current third-party SaaS subscriptions and submit cancellation receipts through the internal procurement portal.
- Tech leads must coordinate with InfoSec to conduct credential rotation for all shared service accounts.
- The IT Security guild should publish updated compliance documentation on the internal knowledge base.

We appreciate everyone's cooperation as we harden our compliance posture and streamline operational overhead.

Dr. Kenneth Patel
Chief Technology Officer`,
  },
  {
    id: 'incident-review',
    category: 'Incident Post-Mortem',
    title: 'Checkout Gateway Timeout Incident',
    description: 'Urgent incident recap with P0 action items and post-mortem schedule',
    content: `INCIDENT SUMMARY: INC-8821 Checkout Gateway Elevated 504 Timeouts

Severity: Sev-1
Incident Commander: Priya Sharma
Impact Window: Monday, October 13, 08:14 UTC – 09:42 UTC (88 minutes)
Revenue Impact: Estimated $38,200 in abandoned shopping carts

Summary of Events:
At 08:14 UTC, automated Datadog alerts detected a spike in HTTP 504 Gateway Timeouts on the /checkout/payment endpoint reaching a peak error rate of 14.8%. The root cause was identified as connection pool exhaustion on the legacy payment processor integration after an upstream gateway timeout retry storm.

Remediation & Action Items:
1. Liam O'Connor must increase the Redis timeout cache TTL from 500ms to 2000ms by 16:00 UTC today.
2. Priya Sharma will prepare the incident post-mortem draft and publish it to Notion by Tuesday, October 14 at 12:00 UTC.
3. The platform squad must implement exponential backoff with jitter on payment retry mechanisms before Thursday, October 16.
4. Formal post-mortem review meeting will be held on Wednesday, October 15 at 14:00 UTC in Google Meet room 'checkout-postmortem'.

Unresolved questions: It is currently unknown whether affected customers received automated error confirmation emails with single-use promotional recovery vouchers.

Thanks to everyone who joined the war room promptly.`,
  },
];
