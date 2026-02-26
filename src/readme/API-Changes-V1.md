  What Changed & What You Need to Know                                                                                                                                              

  ---
  1. Identity vs. Profile IDs — The Most Important Concept

  The system uses two different kinds of UUIDs. You must not confuse them.

  ┌────────────┬───────────────────────────────────┬────────────────────────────────────┐
  │  ID Type   │        Where it comes from        │         What it identifies         │
  ├────────────┼───────────────────────────────────┼────────────────────────────────────┤
  │ userId     │ Login/register response (user.id) │ The account in the identity system │
  ├────────────┼───────────────────────────────────┼────────────────────────────────────┤
  │ patientId  │ GET /patients/me response (id)    │ The patient's care profile         │
  ├────────────┼───────────────────────────────────┼────────────────────────────────────┤
  │ providerId │ GET /providers/me response (id)   │ The provider's care profile        │
  └────────────┴───────────────────────────────────┴────────────────────────────────────┘

  Rule: After login, always fetch the user's profile and store both IDs. Use userId only for auth endpoints. Use patientId / providerId for everything else (offers, notifications, 
  analytics).

  ---
  2. Request Headers — Three Different Headers, Not One

  Previously everything used X-User-Id. Now there are three distinct headers:

  ┌───────────────┬────────────────────────────────┬────────────────────────────────────────┐
  │    Header     │         Value to send          │            When to send it             │
  ├───────────────┼────────────────────────────────┼────────────────────────────────────────┤
  │ X-User-Id     │ user.id from login             │ Logout, change password, 2FA endpoints │
  ├───────────────┼────────────────────────────────┼────────────────────────────────────────┤
  │ X-Provider-Id │ provider.id from /providers/me │ Creating an offer, sending an offer    │
  ├───────────────┼────────────────────────────────┼────────────────────────────────────────┤
  │ X-Patient-Id  │ patient.id from /patients/me   │ Accepting or rejecting an offer        │
  └───────────────┴────────────────────────────────┴────────────────────────────────────────┘

  ---
  3. Creating an Offer — Body Changed

  providerId is no longer in the request body. The provider is identified by the X-Provider-Id header. Only send patientId in the body.

  // POST /offers  (header: X-Provider-Id: <providerProfileId>)                                                                                                                     
  {
    "patientId": "<patientProfileId>",
    "message": "We have a room available for you.",
    "availabilityDetails": { "availableFrom": "2026-03-01" }
  }

  ---
  4. Notifications — Routes and Field Names Changed

  ┌───────────────────────────────────────────────┬───────────────────────────────────────────────┐
  │                      Old                      │                      New                      │
  ├───────────────────────────────────────────────┼───────────────────────────────────────────────┤
  │ GET /notifications/user/{userId}              │ GET /notifications/{recipientId}              │
  ├───────────────────────────────────────────────┼───────────────────────────────────────────────┤
  │ GET /notifications/user/{userId}/unread       │ GET /notifications/{recipientId}/unread       │
  ├───────────────────────────────────────────────┼───────────────────────────────────────────────┤
  │ GET /notifications/user/{userId}/unread/count │ GET /notifications/{recipientId}/unread/count │
  ├───────────────────────────────────────────────┼───────────────────────────────────────────────┤
  │ PUT /notifications/user/{userId}/read-all     │ PUT /notifications/{recipientId}/read-all     │
  └───────────────────────────────────────────────┴───────────────────────────────────────────────┘

  The userId field in notification responses is now recipientId (the profile UUID).

  When sending an email notification via POST /notifications, you must also include recipientEmail in the body — the backend cannot resolve it on your behalf for direct API calls. 

  ---
  5. Analytics Events — Route Changed

  ┌─────────────────────────────────────┬───────────────────────────────────────────┐
  │                 Old                 │                    New                    │
  ├─────────────────────────────────────┼───────────────────────────────────────────┤
  │ GET /analytics/events/user/{userId} │ GET /analytics/events/profile/{profileId} │
  └─────────────────────────────────────┴───────────────────────────────────────────┘

  The userId field in event log responses is now profileId.

  ---
  6. Recommended Login Flow

  1. POST /auth/login          → store accessToken, refreshToken, user.id (userId)
  2. GET  /patients/me         → store patient.id (patientId)   [if role is PATIENT/RELATIVE]
     or
     GET  /providers/me        → store provider.id (providerId)  [if role is *_PROVIDER]
  3. Use patientId/providerId for all subsequent API calls

  ---
  7. Quick Reference — Which ID Goes Where

  ┌──────────────────────┬──────────────────────────────────┬─────────────────────────┐
  │        Action        │           Header/Field           │        ID to use        │
  ├──────────────────────┼──────────────────────────────────┼─────────────────────────┤
  │ Logout               │ X-User-Id header                 │ userId                  │
  ├──────────────────────┼──────────────────────────────────┼─────────────────────────┤
  │ Change password      │ X-User-Id header                 │ userId                  │
  ├──────────────────────┼──────────────────────────────────┼─────────────────────────┤
  │ Create/send offer    │ X-Provider-Id header             │ providerId              │
  ├──────────────────────┼──────────────────────────────────┼─────────────────────────┤
  │ Accept/reject offer  │ X-Patient-Id header              │ patientId               │
  ├──────────────────────┼──────────────────────────────────┼─────────────────────────┤
  │ Get my notifications │ Path {recipientId}               │ patientId or providerId │
  ├──────────────────────┼──────────────────────────────────┼─────────────────────────┤
  │ Get my event logs    │ Path {profileId}                 │ patientId or providerId │
  ├──────────────────────┼──────────────────────────────────┼─────────────────────────┤
  │ Get my matches       │ Path {patientId} or {providerId} │ patientId or providerId │
  ├──────────────────────┼──────────────────────────────────┼─────────────────────────┤
  │ Get my offers        │ Path {patientId} or {providerId} │ patientId or providerId │
  ├──────────────────────┼──────────────────────────────────┼─────────────────────────┤
  │ Get my subscription  │ Path {providerId}                │ providerId              │
  └──────────────────────┴──────────────────────────────────┴─────────────────────────┘