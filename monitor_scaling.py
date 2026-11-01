import time
import datetime
import boto3

ecs = boto3.client("ecs", region_name="ap-southeast-1")
cw = boto3.client("cloudwatch", region_name="ap-southeast-1")
elbv2 = boto3.client("elbv2", region_name="ap-southeast-1")

CLUSTER = "course-registration-cluster"
SERVICE = "course-registration-backend-service"
TG_NAME = "course-registration-tg"

tg_arn = elbv2.describe_target_groups(Names=[TG_NAME])["TargetGroups"][0]["TargetGroupArn"]

print("=" * 60)
print("🚀 Bắt đầu theo dõi Auto Scaling ECS Fargate & CloudWatch")
print("=" * 60)

start = time.time()
last_desired = None

while True:
    now_str = datetime.datetime.now().strftime("%H:%M:%S")
    
    # 1. ECS Service
    srv = ecs.describe_services(cluster=CLUSTER, services=[SERVICE])["services"][0]
    running = srv["runningCount"]
    desired = srv["desiredCount"]
    
    # 2. ALB Targets
    th = elbv2.describe_target_health(TargetGroupArn=tg_arn)["TargetHealthDescriptions"]
    healthy_count = sum(1 for t in th if t["TargetHealth"]["State"] == "healthy")
    total_targets = len(th)
    
    # 3. CPU Utilization (Last 5 mins)
    end_time = datetime.datetime.now(datetime.timezone.utc)
    start_time = end_time - datetime.timedelta(minutes=5)
    metric = cw.get_metric_data(
        MetricDataQueries=[
            {
                "Id": "cpu",
                "MetricStat": {
                    "Metric": {
                        "Namespace": "AWS/ECS",
                        "MetricName": "CPUUtilization",
                        "Dimensions": [
                            {"Name": "ClusterName", "Value": CLUSTER},
                            {"Name": "ServiceName", "Value": SERVICE},
                        ],
                    },
                    "Period": 60,
                    "Stat": "Average",
                },
            }
        ],
        StartTime=start_time,
        EndTime=end_time,
    )
    
    cpu_vals = metric["MetricDataResults"][0]["Values"]
    last_cpu = f"{cpu_vals[0]:.1f}%" if cpu_vals else "N/A"
    
    status_msg = f"[{now_str}] CPU: {last_cpu:>6} | Desired: {desired} | Running: {running} | ALB Healthy: {healthy_count}/{total_targets}"
    
    if last_desired is not None and desired > last_desired:
        status_msg += f"  🔥 [SCALE-OUT TRIGGERED!] {last_desired} -> {desired} tasks"
    elif last_desired is not None and desired < last_desired:
        status_msg += f"  ❄️ [SCALE-IN TRIGGERED!] {last_desired} -> {desired} tasks"
    
    print(status_msg)
    last_desired = desired
    
    time.sleep(10)
