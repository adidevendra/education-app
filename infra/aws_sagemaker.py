import os, sys, yaml, sagemaker
from sagemaker.pytorch import PyTorch

spec = yaml.safe_load(open(sys.argv[1]))
role   = os.getenv("SAGEMAKER_EXEC_ROLE_ARN", "arn:aws:iam::123456789012:role/service-role/SageMakerRole")  # <-- set in Secrets/Env
region = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
bucket = os.getenv("S3_BUCKET", "s3://your-bucket-name")  # <-- set in Secrets

sess = sagemaker.Session()
est = PyTorch(
    entry_point="train.py",
    role=role,
    framework_version="2.2",
    py_version="py310",
    instance_type="ml.p3.2xlarge",
    instance_count=1,
    hyperparameters={"epochs": 10},
)
est.fit({"train": f"{bucket}/train"})
print("Submitted SageMaker job.")

