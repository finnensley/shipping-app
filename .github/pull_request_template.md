## Summary

Describe the user-facing change and any backend or schema impact.

## Environment Impact

- [ ] Local only
- [ ] Preview environment affected
- [ ] Production environment affected
- [ ] Database schema changed
- [ ] New environment variables required

## Pre-Merge Checklist

- [ ] `npm run build` passes locally
- [ ] Relevant tests were run locally
- [ ] Preview deployment was opened and smoke-tested
- [ ] Auth flow works in the target environment
- [ ] Orders load correctly
- [ ] Packing flow still works
- [ ] Easyship rate lookup still works if shipping code changed
- [ ] Easyship shipment or label flow still works if shipping code changed
- [ ] No production credentials were added to the branch

## Notes For Reviewers

Call out anything risky, incomplete, or intentionally deferred.
