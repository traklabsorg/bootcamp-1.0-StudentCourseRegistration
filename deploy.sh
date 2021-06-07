docker pull $IMAGE
docker run --network="host" -it -d -p 3002:3002 $IMAGE
