import { AnalysisResult } from '../types.ts';
import { SAMPLE_PRESETS } from './samplePresets.ts';

export const INITIAL_DEMO_RESULT: AnalysisResult = {
  id: 'demo-aurora-migration',
  timestamp: Date.now() - 1000 * 60 * 15,
  originalText: SAMPLE_PRESETS[0].content,
  title: 'Postgres Cluster Failover & Schema Migration (v4.12)',
  oneSentenceSummary:
    'The Infrastructure team will perform a Postgres Aurora cluster migration this Saturday from 02:00 to 05:00 UTC, requiring an immediate non-critical production deployment freeze from Friday 18:00 UTC until Sunday 12:00 UTC.',
  keyFacts: [
    'Scheduled maintenance window runs Saturday, October 18 between 02:00 UTC and 05:00 UTC (3 hours total).',
    'Write operations on billing and user session databases will be temporarily queued in Redis buffers.',
    'Read-only replicas remain accessible with an estimated latency increase of ~45ms.',
    'Scheduled background Celery worker jobs will be paused automatically at 01:45 UTC.',
    'Automated rollback triggers if latency exceeds 250ms for more than 5 consecutive minutes post-switchover.',
  ],
  deadlines: {
    hasDeadline: true,
    deadlineSummary: 'Production deployment freeze begins Friday, Oct 17 at 18:00 UTC; migration window runs Saturday, Oct 18 from 02:00 to 05:00 UTC.',
    items: [
      {
        dateOrTime: 'Thursday, Oct 16, 17:00 UTC',
        description: 'Front-end maintenance notification banners must be deployed to staging.',
      },
      {
        dateOrTime: 'Friday, Oct 17, 15:00 UTC',
        description: 'Marcus Chen must complete read replica health verification.',
      },
      {
        dateOrTime: 'Friday, Oct 17, 18:00 UTC',
        description: 'Squad leads must initiate non-critical production deployment freeze.',
      },
      {
        dateOrTime: 'Saturday, Oct 18, 02:00–05:00 UTC',
        description: 'Postgres Aurora cluster failover and schema migration execution window.',
      },
    ],
  },
  ambiguities: [
    'Unconfirmed whether downstream third-party webhook consumers require whitelisting for the secondary proxy IP.',
    'Specific contact lead for the war-room Slack channel #infra-migration during off-hours is unassigned.',
  ],
  tasks: [
    {
      id: 'task-demo-1',
      task: 'Freeze non-critical production deployments',
      assignee: 'All Squad Leads',
      deadline: 'Friday, Oct 17 @ 18:00 UTC',
      priority: 'high',
      completed: false,
      sourceQuote: 'All squad leads must freeze non-critical production deployments starting Friday, October 17 at 18:00 UTC.',
      isSuggested: false,
    },
    {
      id: 'task-demo-2',
      task: 'Verify read replica health checks and alert #infra-migration',
      assignee: 'Marcus Chen',
      deadline: 'Friday, Oct 17 @ 15:00 UTC',
      priority: 'high',
      completed: false,
      sourceQuote: 'Marcus Chen needs to verify read replica health checks by Friday 15:00 UTC and alert the war-room Slack channel #infra-migration.',
      isSuggested: false,
    },
    {
      id: 'task-demo-3',
      task: 'Deploy maintenance notification banners to staging',
      assignee: 'Front-end Teams',
      deadline: 'Thursday, Oct 16 @ 17:00 UTC',
      priority: 'medium',
      completed: false,
      sourceQuote: 'Front-end teams must ensure maintenance notification banners are deployed to production staging by Thursday, October 16 at 17:00 UTC.',
      isSuggested: false,
    },
  ],
  suggestedNextSteps: [
    'Send an advance email advisory to downstream webhook consumers regarding the proxy IP change.',
    'Run a dry-run test of Redis write queuing in staging prior to Friday afternoon.',
    'Prepare an automated post-migration smoke test suite to verify billing write integrity immediately at 05:01 UTC.',
  ],
  evidenceSnippets: [
    'write operations on the billing and user session databases will be temporarily queued in Redis buffers.',
    'All squad leads must freeze non-critical production deployments starting Friday, October 17 at 18:00 UTC until Sunday, October 19 at 12:00 UTC.',
    'It remains unconfirmed whether downstream third-party webhook consumers need to whitelist the secondary proxy IP address.',
  ],
};
