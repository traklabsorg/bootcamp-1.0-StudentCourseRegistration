echo 'Building the Docker image'
docker build -t groups-microservice:dev1 .
echo 'Tagging the Docker image'
docker tag groups-microservice:dev1 938510084600.dkr.ecr.us-east-2.amazonaws.com/group-microservice-dev:latest
echo 'Getting the credentials for aws with docker'
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 938510084600.dkr.ecr.us-east-2.amazonaws.com
echo 'Pushing the Image to AWS'
docker push 938510084600.dkr.ecr.us-east-2.amazonaws.com/group-microservice-dev:latest
