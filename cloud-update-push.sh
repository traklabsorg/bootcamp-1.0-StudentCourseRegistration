echo 'Building the Docker image'
docker build -t channel-service:dev .
echo 'Tagging the Docker image'
docker tag channel-service:dev 938510084600.dkr.ecr.us-east-2.amazonaws.com/channel-service.dev:latest
echo 'Getting the credentials for aws with docker'
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 938510084600.dkr.ecr.us-east-2.amazonaws.com
echo 'Pushing the Image to AWS'
docker push 938510084600.dkr.ecr.us-east-2.amazonaws.com/channel-service.dev:latest

