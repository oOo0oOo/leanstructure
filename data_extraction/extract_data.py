##
#  1. Extract data from Mathlib (using lean_dojo trace)
#  LeanDojo requires 3.11 or lower
##

OUT_PATH = "data/mathlib.json"

import json
from lean_dojo import LeanGitRepo, trace

# mathlib v4.13.0 ==> d731765
# v4.15.0-rc1 ==> 41ff1f7
repo = LeanGitRepo("https://github.com/leanprover-community/mathlib4", "41ff1f7")
print("Lean version:", repo.get_config("lean-toolchain")["content"])

# Lots of patience (2h+ on a new repo, first run)
traced_repo = trace(repo)

traced_theorems = traced_repo.get_traced_theorems()

# 140872 in v4.13.0, 145790 in v4.15.0-rc1
print(f"Found {len(traced_theorems)} theorems in the repo.")

# Dump everything to a json
serialized = []
num_missing_statements = 0
num_missing_premises = 0
for theorem in traced_theorems:
    try:
        prems = theorem.get_premise_full_names()
    except TypeError:
        num_missing_premises += 1
        continue

    # try:
    #     statement = theorem.get_theorem_statement()
    # except TypeError:
    #     num_missing_statements += 1
    #     continue

    # tactics = [
    #     (tact.state_before, tact.tactic, tact.get_annotated_tactic())
    #     for tact in theorem.get_traced_tactics()
    # ]

    serialized.append([
        theorem.theorem.full_name,
        prems,
        # statement,
        # tactics
    ])

print(f"Serialized theorems, discarted {num_missing_statements} from statements, {num_missing_premises} from premises, saving to file")

with open(OUT_PATH, "w") as f:
    json.dump(serialized, f, separators=(',', ':'))