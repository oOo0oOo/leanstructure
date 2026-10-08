#!/bin/bash
# Deploy the Lean structure map to https://oli.show/leanstructure/. The build steps and the target live in ~/Code/infra/apps.toml
# (entry "leanstructure"); box checks the repo, builds, publishes a new release and
# rolls back if the site doesn't answer. Usage: $0 [--dry-run] [--force]
exec ~/Code/infra/box deploy leanstructure "$@"
