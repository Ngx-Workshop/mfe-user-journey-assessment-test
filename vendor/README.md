# Generated assessment contracts
`tmdjr-service-nestjs-assessment-test-contracts-0.0.20.tgz` is an unreleased, generated producer package from `service-assessment-test/openapi.json`. It contains only the contract dist output and manifest. No DTOs were hand-written in this consumer.

To update: build the service (OpenAPI generation is DB-free), run its contracts gen/build scripts, then run `npm pack --ignore-scripts --pack-destination <learner>/vendor` inside the producer contracts folder. Install that archive from this consumer and commit its manifest, lockfile and archive together. The explicit ignore-scripts prevents packing from unexpectedly regenerating after the verified build.

Replace the file dependency with published 0.0.20 when the producer release is available. This task does not publish the package.
