
import subprocess
ZONE="us-central2-b"; NAME="tpu-1"; TYPE="v4-8"; IMAGE="tpu-vm-v4-base"
subprocess.check_call(["gcloud","alpha","compute","tpus","tpu-vm","create",NAME,
  f"--zone={ZONE}", f"--accelerator-type={TYPE}", f"--version={IMAGE}"])
subprocess.check_call(["gcloud","alpha","compute","tpus","tpu-vm","ssh",NAME,"--zone",ZONE,"--worker=all","--command",
  "python3 -m pip install -U 'jax[tpu]' -f https://storage.googleapis.com/jax-releases/libtpu_releases.html && python3 -m pip install flax orbax-checkpoint && echo READY"])
print("TPU VM ready.")
