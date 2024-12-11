##
#  2. Convert data to minimal JSON
##

import json
from collections import Counter


PATH = "data/mathlib.json"
OUT_PATH = "../math-vis/static/data.json"


with open(PATH, "r") as f:
    data = json.load(f)

print(len(data), "theorems in the mathlib")

# Find all unique premises and proof premises
TO_REMOVE = [
    "Mathlib.",
    "«.lake».packages.lean4.src.lean.",
    "«.lake».packages.",
]

def clean_premise(p):
    # Mainly remove _private. prefixes
    if p.startswith("_private."):
        for r in TO_REMOVE:
            p = p.replace("_private." + r, "")
    return p

thm_premises = []
for theorem in data:
    if theorem[0] and all(theorem[1]):
        thm_premises.append(theorem[0])
        thm_premises.extend(theorem[1])

thm_premises = [clean_premise(p) for p in thm_premises]
unique_premises = list(set(thm_premises))
print(f"Num/Unique premises: {len(thm_premises)}/{len(unique_premises)}")

# Sort by frequency
premises_freq = Counter(thm_premises)
sorted_premises = sorted(premises_freq.items(), key=lambda x: x[1], reverse=True)

# Index premises
premises = [p for p, _ in sorted_premises]
p_to_i = {p: i for i, p in enumerate(premises)}

indexed = {}
for theorem in data:
    if not theorem[0] or not all(theorem[1]):
        continue
    tid = p_to_i[clean_premise(theorem[0])]
    indexed[tid] = list(set([p_to_i[clean_premise(p)] for p in theorem[1]]))

flattened = [indexed.get(i, []) for i in range(len(premises))]

# Only keep premises that have any incoming or outgoing edges
used_premises = set()
for i, p in enumerate(flattened):
    if p:
        used_premises.add(i)
        used_premises.update(p)

# Compare length of used_premises to all premises
print(f"Num/Used premises: {len(premises)}/{len(used_premises)}")

used_premises = [p for i, p in enumerate(premises) if i in used_premises]
used_p_to_i = {p: i for i, p in enumerate(used_premises)}

indexed = {}
for theorem in data:
    if not theorem[0] or not all(theorem[1]):
        continue
    cleaned_premise = clean_premise(theorem[0])
    if cleaned_premise not in used_p_to_i:
        continue
    tid = used_p_to_i[cleaned_premise]
    cleaned = [clean_premise(p) for p in theorem[1]]
    if all(p in used_p_to_i for p in cleaned):
        indexed[tid] = list(set([used_p_to_i[p] for p in cleaned]))

flattened = [indexed.get(i, []) for i in range(len(used_premises))]
premises = used_premises

# Extract "tokens" (split at .)
tokens = [t for tt in premises for t in tt.split(".")]
token_freq = Counter(tokens)
sorted_tokens = sorted(token_freq.items(), key=lambda x: x[1], reverse=True)
tokens = [t for t, _ in sorted_tokens]

# Index tokens in premises
t_to_i = {t: i for i, t in enumerate(tokens)}
indexed_tokens = [[t_to_i[t] for t in tt.split(".")] for tt in premises]
print(f"Num tokens: {len(indexed_tokens)}")

# Graph stats
lens = [len(p) for p in flattened]
num_edges = sum(lens)
print(f"Num premises: {len(premises)}")
print(f"Num edges: {num_edges}")
print(f"Average edges per premise: {num_edges/len(premises):.2f}")

# Save to file
processed = {
    "tokens": tokens,  # [str]
    "types": indexed_tokens,  # [[int]]
    "premises": flattened,  # [[int]]
}

print(f"Saving {len(processed['types'])} types to {OUT_PATH}")
with open(OUT_PATH, "w") as f:
    json.dump(processed, f, separators=(',', ':'))