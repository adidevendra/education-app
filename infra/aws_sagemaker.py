
import sys, yaml, sagemaker
from sagemaker.pytorch import PyTorch
spec = yaml.safe_load(open(sys.argv[1]))
role = "arn:aws:iam::ACCOUNT:role/service-role/SageMakerRole"  # TODO: replace
est = PyTorch(entry_point="train.py", role=role,
             framework_version="2.2", py_version="py310",
             instance_type="ml.p3.2xlarge", instance_count=1,
             hyperparameters={"epochs":10})
est.fit({"train":"s3://YOUR-BUCKET/train"})
print("Submitted SageMaker job.")
