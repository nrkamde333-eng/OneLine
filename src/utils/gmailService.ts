import { OfficeMessage } from '../types.ts';
import { clearCachedToken } from './firebaseAuth.ts';

interface GmailMessageHeader {
  name: string;
  value: string;
}

interface GmailMessagePart {
  partId?: string;
  mimeType?: string;
  filename?: string;
  headers?: GmailMessageHeader[];
  body?: {
    size?: number;
    data?: string;
  };
  parts?: GmailMessagePart[];
}

interface GmailMessageDetail {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  internalDate?: string;
  payload?: {
    headers: GmailMessageHeader[];
    body?: {
      size?: number;
      data?: string;
    };
    parts?: GmailMessagePart[];
  };
}

/**
 * Decode Base64URL string to readable UTF-8 text
 */
function decodeBase64Url(data?: string): string {
  if (!data) return '';
  try {
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    const binStr = atob(base64);
    const bytes = Uint8Array.from(binStr, (ch) => ch.charCodeAt(0));
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    try {
      return atob(data.replace(/-/g, '+').replace(/_/g, '/'));
    } catch {
      return '';
    }
  }
}

/**
 * Recursively extract plain text body from Gmail parts tree
 */
function extractBodyText(part?: GmailMessagePart): string {
  if (!part) return '';

  if (part.mimeType === 'text/plain' && part.body?.data) {
    return decodeBase64Url(part.body.data);
  }

  if (part.parts && part.parts.length > 0) {
    // Try to find plain text part first
    for (const subPart of part.parts) {
      if (subPart.mimeType === 'text/plain' && subPart.body?.data) {
        return decodeBase64Url(subPart.body.data);
      }
    }
    // Then try nested parts
    for (const subPart of part.parts) {
      const text = extractBodyText(subPart);
      if (text) return text;
    }
    // Fallback to text/html
    for (const subPart of part.parts) {
      if (subPart.mimeType === 'text/html' && subPart.body?.data) {
        const html = decodeBase64Url(subPart.body.data);
        return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      }
    }
  }

  if (part.mimeType === 'text/html' && part.body?.data) {
    const html = decodeBase64Url(part.body.data);
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  if (part.body?.data) {
    return decodeBase64Url(part.body.data);
  }

  return '';
}

/**
 * Parse sender header into display name and email address
 */
function parseSender(fromHeader: string): { name: string; email: string } {
  if (!fromHeader) return { name: 'Unknown Sender', email: '' };

  const match = fromHeader.match(/^(.*?)\s*<(.+?)>$/);
  if (match) {
    const name = match[1].replace(/["']/g, '').trim();
    const email = match[2].trim();
    return {
      name: name || email,
      email,
    };
  }

  const clean = fromHeader.replace(/["']/g, '').trim();
  return {
    name: clean,
    email: clean.includes('@') ? clean : '',
  };
}

/**
 * Fetch Gmail user profile
 */
export async function fetchGmailProfile(
  accessToken: string
): Promise<{ emailAddress: string; messagesTotal: number; threadsTotal: number }> {
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    let parsed: any = null;
    try {
      parsed = JSON.parse(errText);
    } catch {
      // ignore
    }
    const msg = parsed?.error?.message || errText;
    if (
      res.status === 403 &&
      (msg.toLowerCase().includes('scope') ||
        msg.toLowerCase().includes('insufficient') ||
        msg.toLowerCase().includes('permission'))
    ) {
      clearCachedToken();
      throw new Error(
        'Insufficient permissions: Access to Gmail was not granted. Please sign in again and select the checkbox "View your email messages and settings".'
      );
    }
    throw new Error(`Gmail API error (${res.status}): ${msg}`);
  }

  const data = await res.json();
  return {
    emailAddress: data.emailAddress || '',
    messagesTotal: data.messagesTotal || 0,
    threadsTotal: data.threadsTotal || 0,
  };
}

/**
 * Fetch real inbox messages from Gmail API using OAuth access token
 */
export async function fetchGmailInboxMessages(
  accessToken: string,
  maxResults = 12
): Promise<OfficeMessage[]> {
  // 1. List message IDs from INBOX
  const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=in:inbox`;
  const listRes = await fetch(listUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!listRes.ok) {
    const errorText = await listRes.text();
    let parsedJson: any = null;
    try {
      parsedJson = JSON.parse(errorText);
    } catch {
      // ignore
    }

    const message = parsedJson?.error?.message || errorText;
    const isInsufficientScope =
      listRes.status === 403 &&
      (message.toLowerCase().includes('scope') ||
        message.toLowerCase().includes('insufficient') ||
        message.toLowerCase().includes('permission'));

    if (isInsufficientScope) {
      clearCachedToken();
      throw new Error(
        'Insufficient permissions: Access to your Gmail messages was not granted. Please sign in again and check the permission box for "View your email messages and settings" in Google authorization.'
      );
    }

    throw new Error(`Failed to list Gmail inbox (${listRes.status}): ${message}`);
  }

  const listData = await listRes.json();
  const messageItems: Array<{ id: string; threadId: string }> = listData.messages || [];

  if (messageItems.length === 0) {
    return [];
  }

  // 2. Fetch details for each message (fetch in parallel)
  const officeMessages: OfficeMessage[] = [];

  const detailPromises = messageItems.map(async (item) => {
    try {
      const detailRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}?format=full`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        }
      );

      if (!detailRes.ok) {
        return null;
      }

      const detail: GmailMessageDetail = await detailRes.json();
      const headers = detail.payload?.headers || [];

      const getHeader = (name: string) =>
        headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

      const subject = getHeader('Subject') || '(No Subject)';
      const fromHeader = getHeader('From');
      const dateHeader = getHeader('Date');
      const senderInfo = parseSender(fromHeader);

      let body = extractBodyText(detail.payload as GmailMessagePart);
      if (!body.trim()) {
        body = detail.snippet || '(No message preview available)';
      }

      let timestamp = Date.now();
      if (detail.internalDate) {
        timestamp = parseInt(detail.internalDate, 10);
      } else if (dateHeader) {
        const parsed = Date.parse(dateHeader);
        if (!isNaN(parsed)) timestamp = parsed;
      }

      const isUnread = Boolean(detail.labelIds?.includes('UNREAD'));

      const officeMsg: OfficeMessage = {
        id: `gmail-${detail.id}`,
        channel: 'email',
        sender: senderInfo.name,
        senderContact: senderInfo.email,
        timestamp,
        subject,
        rawText: body.trim(),
        status: isUnread ? 'unread' : 'distilled',
      };

      return officeMsg;
    } catch (err) {
      console.warn(`Error fetching Gmail message ${item.id}:`, err);
      return null;
    }
  });

  const results = await Promise.all(detailPromises);
  for (const item of results) {
    if (item) {
      officeMessages.push(item);
    }
  }

  // Sort descending by timestamp (newest first)
  officeMessages.sort((a, b) => b.timestamp - a.timestamp);

  return officeMessages;
}
