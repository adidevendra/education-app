import sys, yaml, subprocess

spec = yaml.safe_load(open(sys.argv[1]))
req = spec["requirements"]
pref = spec.get("preferences", {})

gpu  = bool(req.get("gpu"))
tpu  = bool(req.get("tpu"))
hint = pref.get("provider_hint", "auto")

if tpu:
    cmd = ["make", "tpu-gcp"]
elif gpu:
    if hint in ("aws", "auto"):
        cmd = ["make", "gpu-aws"]
    elif hint == "colab":
        cmd = ["make", "gpu-colab"]
    else:
        cmd = ["make", "gpu-aws"]
else:
    cmd = ["make", "cpu-oracle"]

print("→", " ".join(cmd))
subprocess.check_call(cmd)

