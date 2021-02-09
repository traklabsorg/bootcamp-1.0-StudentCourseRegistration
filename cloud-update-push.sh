echo 'Building the Docker image'
docker build -t channel-service:dev .
echo 'Tagging the Docker image'
docker tag channel-service:dev 938510084600.dkr.ecr.us-east-2.amazonaws.com/channel-service.dev:latest
echo 'Getting the credentials for aws with docker'
aws ecs get-login-password --region us-east-2 | docker login --username AWS --password-stdin 938510084600.dkr.ecr.us-east-2.amazonaws.com
echo 'Pushing the Image to AWS'
docker push 938510084600.dkr.ecr.us-east-2.amazonaws.com/channel-service.dev:latest
sleep 3
aws ecs update-service --cluster CHANNEL-DEV-CLUSTER --service CHANNEL-DEV-SERVICE --force-new-deployment
echo "waiting for ecs update for 10 seconds..."
sleep 10
echo "deployment successful!"
curl https://channels-api.dev.smrtp.io