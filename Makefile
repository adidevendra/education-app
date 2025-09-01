run: decide
decide: ; python3 infra/decide.py codex.job.yaml
gpu-aws: ; python3 infra/aws_sagemaker.py codex.job.yaml
gpu-colab: ; python3 infra/colab_bootstrap.py codex.job.yaml
cpu-oracle: ; bash infra/oracle_arm_ingest.sh
tpu-gcp: ; python3 infra/gcp_tpu_vm.py codex.job.yaml
