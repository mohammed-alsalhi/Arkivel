# Editorial Governance

Arkivel v4.83.0 deepens editorial governance for release-blocking review work.

## Review Requests

Review requests now support due dates, required reviewer ids, approval thresholds, cycle counts, and decision notes. Status transitions are constrained so closed approvals cannot be moved back into change request states without opening a new review.

## Claim Queues

Claim reviews can carry evidence and expiration dates. Governance queues group claims by `disputed`, `needs_source`, `stale`, `rejected`, and `unreviewed`.

## Verification Stamps

Article verification stamps now include reviewer id, evidence, and expiration metadata:

- `lastVerifiedAt`
- `lastVerifiedById`
- `verificationEvidence`
- `verificationExpiresAt`

Expired verification stamps count toward renewal risk.

## Ownership And Escalation

Ownership signals come from article authors/co-authors, assigned reviewers, verification reviewers, and category/space governance owners and reviewers. Template and marketplace author metadata remains the escalation path for reusable packs.

## Dashboard Summary

Admins can read `/api/admin/editorial-governance/summary` for release blockers, editorial risk, claim queues, verification renewals, and owner gaps.

