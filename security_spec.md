# Security Specification for Xdoc Healthcare App

## 1. Data Invariants
- A Token must have a valid `hospitalId`.
- Only the Hospital owner can modify Hospital profile data.
- Only the Patient who created a Token (or the Hospital owner) can view it.
- Hospital staff and doctors collections are manageable only by the Hospital owner.
- Users can only read/write their own profiles.

## 2. The "Dirty Dozen" Payloads (Denial Tests)

1. **Identity Spoofing**: Attempt to update another user's profile role to 'super_admin'.
   - Payload: `{"role": "super_admin"}` to `/users/another_uid`
2. **Orphaned Token**: Create a token with a non-existent `hospitalId`.
3. **Privilege Escalation**: Attempt to change hospital status to 'Open' by a non-owner.
4. **Token Fraud**: Create a token for someone else by providing a different `patientUid`.
5. **Unauthorized Staff Mod**: Add a doctor to a hospital you don't own.
6. **Ghost Update**: Update a token's status to 'Completed' as a patient.
7. **Resource Poisoning**: Use a 1MB string for `patientName`.
8. **ID Injection**: Create a hospital with a 1.5KB document ID.
9. **Email Spoofing**: List hospitals using an unverified email (if `email_verified` is enforced).
10. **State Shortcut**: Move a token status from 'Waiting' directly to 'Completed' without 'In Progress' (if strict state machines were implemented, though we'll focus on key ownership).
11. **Shadow Field**: Add a `isVerified: true` field to a hospital profile.
12. **PII Leak**: List all users as a regular patient.

## 3. Test Runner (Draft Logic)
The rules must pass these checks using `request.auth.uid`, `resource.data`, and `get()` lookups.

---

# DRAFT Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Global Deny
    match /{document=**} {
      allow read, write: if false;
    }

    // Helpers
    function isSignedIn() { return request.auth != null; }
    function isOwner(userId) { return isSignedIn() && request.auth.uid == userId; }
    function isVerified() { return isSignedIn() && request.auth.token.email_verified == true; }
    function incoming() { return request.resource.data; }
    function existing() { return resource.data; }
    function isValidId(id) { return id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$'); }

    // --- Users ---
    match /users/{userId} {
      allow get: if isOwner(userId);
      allow create: if isOwner(userId) && 
                      incoming().role in ['patient', 'hospital_admin'] &&
                      incoming().uid == request.auth.uid;
      allow update: if isOwner(userId) && 
                      incoming().diff(existing()).affectedKeys().hasOnly(['profile', 'updatedAt']);
    }

    // --- Hospitals ---
    function isHospitalOwner(hospitalId) {
      return isSignedIn() && get(/databases/$(database)/documents/hospitals/$(hospitalId)).data.uid == request.auth.uid;
    }

    match /hospitals/{hospitalId} {
      allow list: if true; // Public listing for discovery
      allow get: if true;
      allow create: if isSignedIn() && incoming().uid == request.auth.uid;
      allow update: if isSignedIn() && existing().uid == request.auth.uid && 
                      incoming().diff(existing()).affectedKeys().hasOnly(['status', 'hospitalName', 'ownerName', 'phone', 'city', 'address', 'area', 'type', 'specializations', 'facilities', 'openDays', 'startingFee', 'openingTime', 'closingTime']);
      
      // Subcollections
      match /doctors/{doctorId} {
        allow read: if true;
        allow write: if isHospitalOwner(hospitalId);
      }
      match /staff/{staffId} {
        allow read: if isHospitalOwner(hospitalId);
        allow write: if isHospitalOwner(hospitalId);
      }
    }

    // --- Tokens ---
    match /tokens/{tokenId} {
      function belongsToPatient() { return existing().patientUid == request.auth.uid; }
      
      allow list: if isSignedIn() && (
        resource.data.patientUid == request.auth.uid || 
        get(/databases/$(database)/documents/hospitals/$(resource.data.hospitalId)).data.uid == request.auth.uid
      );
      
      allow get: if isSignedIn() && (
        resource.data.patientUid == request.auth.uid || 
        get(/databases/$(database)/documents/hospitals/$(resource.data.hospitalId)).data.uid == request.auth.uid
      );

      allow create: if isSignedIn() && 
                      incoming().hospitalId is string && 
                      exists(/databases/$(database)/documents/hospitals/$(incoming().hospitalId));

      allow update: if isSignedIn() && (
        // Patient can cancel
        (belongsToPatient() && incoming().diff(existing()).affectedKeys().hasOnly(['status']) && incoming().status == 'Cancelled') ||
        // Hospital admin can manage
        (get(/databases/$(database)/documents/hospitals/$(existing().hospitalId)).data.uid == request.auth.uid)
      );
      
      allow delete: if isSignedIn() && (
        get(/databases/$(database)/documents/hospitals/$(existing().hospitalId)).data.uid == request.auth.uid
      );
    }
  }
}
```
