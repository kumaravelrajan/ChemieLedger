# Probably needs to be called with sudo!
echo "Stopping and removing all containers..."
docker rm -f $(docker ps -a -q)
echo "Removing all files from /tmp/hyperledger ..."
find /tmp/hyperledger -type f -delete