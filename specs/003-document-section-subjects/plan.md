# Plan: Document section subject compatibility

Spec: [spec.md](spec.md)
Status: Implemented; hosted integration pending

Use a pure display helper receiving a subject record, reading sectionTitle and
falling back to the legacy key/name when missing. Unknown IDs receive generic
metadata; service catalog determines available subjects. Replace unsafe dictionary
indexing in presentation templates. No store or HTTP behavior changes are needed.
Use the producer-generated vendored contract 0.0.20. Tests cover an arbitrary Rust
ID through rendered discovery and start requests plus existing journey regressions.
No constitution deviations, data migration, publication or deployment.

## Technical Context

**Language/Version**: TypeScript ~5.9.3 / Angular 21.1
**Primary Dependencies**: Angular Material, RxJS, generated assessment DTOs
**Storage**: Service-owned data; scoped unsaved form/view state
**Project Type**: Federated standalone Angular remote
