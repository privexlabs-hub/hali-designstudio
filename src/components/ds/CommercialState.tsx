import type { CSSProperties } from 'react';
import { Icon } from './Icon';

export type StateFamily = 'suggested' | 'draft' | 'proposed' | 'awaiting' | 'agreed' | 'closed' | 'problem' | 'recorded';

const FAM: Record<StateFamily, { fg: string; bg: string; line: string }> = {
  suggested: { fg: 'var(--state-suggested-fg)', bg: 'var(--state-suggested-bg)', line: 'var(--state-suggested-line)' },
  draft: { fg: 'var(--state-draft-fg)', bg: 'var(--state-draft-bg)', line: 'var(--state-draft-line)' },
  proposed: { fg: 'var(--state-proposed-fg)', bg: 'var(--state-proposed-bg)', line: 'var(--state-proposed-line)' },
  awaiting: { fg: 'var(--state-awaiting-fg)', bg: 'var(--state-awaiting-bg)', line: 'var(--state-awaiting-line)' },
  agreed: { fg: 'var(--state-agreed-fg)', bg: 'var(--state-agreed-bg)', line: 'var(--state-agreed-line)' },
  closed: { fg: 'var(--state-closed-fg)', bg: 'var(--state-closed-bg)', line: 'var(--state-closed-line)' },
  problem: { fg: 'var(--state-problem-fg)', bg: 'var(--state-problem-bg)', line: 'var(--state-problem-line)' },
  recorded: { fg: 'var(--n-0)', bg: 'var(--n-800)', line: '1.5px solid var(--n-800)' },
};

/** [family, icon, agency label, client label] */
export const COMMERCIAL_STATES: Record<string, [StateFamily, string, string, string]> = {
  'suggested': ['suggested', 'sparkle', 'Suggested', 'Suggested'],
  'extracted': ['suggested', 'scan-text', 'Extracted · needs review', 'Being prepared'],
  'draft': ['draft', 'pencil-line', 'Draft', 'Being prepared'],
  'needs-review': ['draft', 'eye', 'Needs review', 'Being prepared'],
  'under-review': ['draft', 'search', 'Under review', 'With the agency'],
  'awaiting-authorisation': ['awaiting', 'shield', 'Awaiting authorisation', 'Being prepared'],
  'proposed': ['proposed', 'send', 'Proposed', 'Proposed'],
  'awaiting-client': ['awaiting', 'clock', 'Awaiting client decision', 'Your decision needed'],
  'awaiting-clarification': ['awaiting', 'message-circle-question', 'Awaiting clarification', 'Agency has a question'],
  'question-raised': ['awaiting', 'message-circle-question', 'Client asked a question', 'Question sent'],
  'included': ['agreed', 'check', 'Included in scope', 'Included'],
  'correction': ['agreed', 'wrench', 'Agency correction', 'Being corrected'],
  'approved': ['agreed', 'circle-check', 'Approved', 'Approved'],
  'agreed': ['agreed', 'file-check', 'Agreed', 'Agreed'],
  'verified': ['agreed', 'shield-check', 'Verified', 'Agreed'],
  'in-progress': ['agreed', 'loader', 'In progress', 'In progress'],
  'delivered': ['agreed', 'package-check', 'Delivered', 'Delivered'],
  'ready-to-invoice': ['awaiting', 'receipt', 'Ready to invoice', 'Delivered'],
  'invoiced': ['recorded', 'receipt', 'Invoiced', 'Invoiced'],
  'paid': ['recorded', 'banknote', 'Paid', 'Paid'],
  'invoice-unknown': ['draft', 'circle-help', 'Invoice status unknown', '—'],
  'declined': ['closed', 'circle-x', 'Declined', 'Declined'],
  'withdrawn': ['closed', 'undo-2', 'Withdrawn', 'Withdrawn'],
  'expired': ['closed', 'timer-off', 'Expired', 'Expired'],
  'superseded': ['closed', 'layers', 'Superseded', 'Replaced by newer version'],
  'disputed': ['problem', 'triangle-alert', 'Disputed', 'Under discussion'],
  'review-open': ['awaiting', 'eye', 'Review open', 'Ready for your review'],
  'feedback-received': ['draft', 'inbox', 'Feedback to triage', 'Feedback sent'],
  'feedback-accepted': ['agreed', 'check-check', 'Feedback accepted', 'Feedback received'],
  'round-not-used': ['closed', 'circle-slash', 'No round used', '—'],
  'covered': ['agreed', 'check', 'Covered revision', 'Included'],
  'unresolved': ['agreed', 'rotate-ccw', 'Unresolved item', 'Being fixed'],
  'already-included': ['closed', 'link', 'Already included', 'Already noted'],
  'question': ['draft', 'message-circle-question', 'Question', 'Question sent'],
  'new-scope': ['proposed', 'file-plus', 'Possible new scope', 'Being reviewed'],
  'deferred': ['closed', 'calendar-clock', 'Deferred', 'Noted for later'],
  'version-approved': ['agreed', 'badge-check', 'Approved version', 'Approved'],
  'approved-conditions': ['awaiting', 'list-checks', 'Approved · conditions open', 'Approved · finishing touches'],
  'condition-open': ['awaiting', 'circle-dot', 'Correction open', 'Being fixed · no cost'],
  'condition-done': ['agreed', 'circle-check', 'Correction done', 'Fixed'],
  'condition-waived': ['closed', 'circle-slash', 'Waived', 'No change needed'],
  'concern-raised': ['awaiting', 'flag', 'Concern raised', 'Concern sent'],
  'concern-responded': ['awaiting', 'message-square-reply', 'Waiting for client', 'Agency replied'],
  'concern-resolved': ['agreed', 'handshake', 'Concern resolved', 'Resolved'],
  'written-off': ['closed', 'circle-slash', 'Written off', 'Not charged'],
  'held': ['draft', 'pause', 'Held for next change order', 'With the agency'],
  'new-requirement': ['proposed', 'file-plus', 'New requirement', 'Being discussed with you'],
  'no-action': ['closed', 'message-square', 'No action', 'Noted'],
  'superseded-version': ['closed', 'layers', 'Superseded version', 'Earlier version']
};

export interface CommercialStateProps {
  state?: string;
  label?: string;
  audience?: 'agency' | 'client';
  size?: 'sm' | 'md';
  style?: CSSProperties;
}

export function CommercialState({ state = 'draft', label, audience = 'agency', size = 'md', style }: CommercialStateProps) {
  const d = COMMERCIAL_STATES[state] || COMMERCIAL_STATES.draft;
  const f = FAM[d[0]];
  const text = label || (audience === 'client' ? d[3] : d[2]);
  return (
    <span className="hds-state" data-state={state} data-size={size} style={{ color: f.fg, background: f.bg, border: f.line, ...style }}>
      <Icon name={d[1]} size={size === 'sm' ? 12 : 14} />
      {text}
    </span>
  );
}
