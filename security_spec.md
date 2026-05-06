# Security Specification - Xdoc Healthcare

## Data Invariants
1. **User Ownership**: A user document can only be written by the user themselves.
2. **Hospital Ownership**: Only the hospital admin (owner) can write to their hospital profile, doctors, and staff subcollections.
3. **Token Relations**: A token must have a valid `hospitalId`.
4. **Role Integrity**: Users cannot change their own `role` after creation.
5. **Token Lifecycle**: Patients can only create tokens and update status to 'Cancelled'. Hospitals can update status of tokens assigned to them.

## The "Dirty Dozen" Payloads

1. **Identity Spoofing**: Attempt to create a user document with a different UID than current auth.
2. **Privilege Escalation**: Attempt to update `role` to 'Admin' in user profile.
3. **Shadow Update**: Attempt to update hospital document with a `isVerified: true` field not in schema.
4. **Resource Poisoning**: Use 2KB string as `hospitalId` in subcollection path.
5. **Relationship Break**: Create a token with a `hospitalId` of a non-existent hospital.
6. **Immutable Break**: Change `createdAt` or `hospitalId` on an existing token.
7. **Cross-Tenant Write**: Hospital A tries to add a doctor to Hospital B's subcollection.
8. **Unauthorized List**: Anonymous user tries to list all `tokens`.
9. **Global User Leak**: Signed-in patient tries to list ALL documents in `users` (list queries must be secured).
10. **Terminal State Bypass**: Attempt to update a 'Completed' token back to 'Waiting'.
11. **Type Poisoning**: Sending `emergency247: "YES"` (string) instead of boolean.
12. **System Field Injection**: Attempt to write to `underReview` flag from client.

## Test Runner (Draft)
Verification will be done via manual inspection and logic guarantees in rules.
