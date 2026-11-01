import os
import mimetypes
import time
import boto3

bucket = "course-registration-frontend-755272426779"
distribution_id = "E14ZIZ3MBDC0O4"
dist_dir = "/home/ubuntu/Dev/Cloud_AWS/frontend/dist"

s3 = boto3.client("s3", region_name="ap-southeast-1")
cf = boto3.client("cloudfront")

for root, _, files in os.walk(dist_dir):
    for f in files:
        full_path = os.path.join(root, f)
        rel_path = os.path.relpath(full_path, dist_dir).replace("\\", "/")
        content_type, _ = mimetypes.guess_type(full_path)
        if not content_type:
            content_type = "application/octet-stream"
        print(f"Uploading {rel_path} ({content_type})...")
        with open(full_path, "rb") as data:
            s3.put_object(
                Bucket=bucket,
                Key=rel_path,
                Body=data,
                ContentType=content_type
            )

print("Frontend sync to S3 complete!")

print("Creating CloudFront invalidation...")
res = cf.create_invalidation(
    DistributionId=distribution_id,
    InvalidationBatch={
        "Paths": {"Quantity": 1, "Items": ["/*"]},
        "CallerReference": str(time.time()),
    },
)
print("Invalidation created:", res["Invalidation"]["Id"])
