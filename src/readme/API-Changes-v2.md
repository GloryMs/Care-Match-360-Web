  ---                                                                                                                                                                                 Frontend changes to implement
                                                                                                                                                                                    
  1. email field in profile responses                                                                                                                                               

  Both PatientProfileResponse and ProviderProfileResponse now include email. Display it (read-only) on the profile page — it's pre-filled from the identity service and not editable
   via PUT /patients / PUT /providers.

  2. Registration flow has changed — no more "Create Profile" page

  ┌───────────────────────────────────────────────────┬────────────────────────────────────────────────────┐
  │                     Old flow                      │                      New flow                      │
  ├───────────────────────────────────────────────────┼────────────────────────────────────────────────────┤
  │ Register → Verify → Login → Create Profile (POST) │ Register → Verify → Login → Complete Profile (PUT) │
  └───────────────────────────────────────────────────┴────────────────────────────────────────────────────┘

  After email verification, the backend automatically creates a basic profile (with only email set, all other fields null). So:
  - Remove the "Create Profile" form that called POST /patients or POST /providers                                                                                                  
  - After login, call GET /patients/me or GET /providers/me to fetch the existing profile
  - Check if required fields (e.g. age, region for patient; facilityName, address for provider) are null → redirect to a "Complete Your Profile" wizard that calls PUT /patients /  
  PUT /providers                                                                                                                                                                    

  3. Role → profile type mapping

  ┌──────────────────────┬──────────────────────┬──────────────┐
  │         Role         │ Profile type created │ providerType │
  ├──────────────────────┼──────────────────────┼──────────────┤
  │ PATIENT, RELATIVE    │ PatientProfile       │ —            │
  ├──────────────────────┼──────────────────────┼──────────────┤
  │ RESIDENTIAL_PROVIDER │ ProviderProfile      │ RESIDENTIAL  │
  ├──────────────────────┼──────────────────────┼──────────────┤
  │ AMBULATORY_PROVIDER  │ ProviderProfile      │ AMBULATORY   │
  ├──────────────────────┼──────────────────────┼──────────────┤
  │ ADMIN, SUPER_ADMIN   │ none                 │ —            │
  └──────────────────────┴──────────────────────┴──────────────┘
