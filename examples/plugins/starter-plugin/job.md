# Job Contract

- Job id: `starter-refresh`
- Schedule: `manual`
- Required permission: `job:execute`
- Failure handling: job runs should emit `plugin.job_run` audit events and report recoverable errors through plugin health metadata.
