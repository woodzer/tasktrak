WORKING_DIRECTORY=`pwd`
DEPLOY_LOG_FILE=`pwd`/deploy.log
TIMESTAMP=`date +"_%Y%m%d-%H%M%S"`

if [ -f $DEPLOY_LOG_FILE ]; then
  rm $DEPLOY_LOG_FILE
fi
touch $DEPLOY_LOG_FILE
echo "Deployment timestamp: $TIMESTAMP"
echo "Deployment timestamp: $TIMESTAMP" > $DEPLOY_LOG_FILE

# Load an environment file if one is available.
if [ -f ./.env ]; then
  echo "Loading environment settings."
  . ./.env
fi

# Pull latest master (assumes this is a Git repository).
echo "Pulling latest master version from Git."
git pull origin master >> $DEPLOY_LOG_FILE 2>&1
if [ "$?" -ne "0" ]; then
  echo "Pull of latest master for repository failed."
  exit -1
fi

# Create the deployment archive.
ARCHIVE_NAME="$DEPLOYMENT_ARCHIVE_PREFIX$TIMESTAMP.tgz"
ARCHIVE_PATH="$WORKING_DIRECTORY/$ARCHIVE_NAME"
echo "Creating a deployment archive with the name '$ARCHIVE_PATH'."
cd $DEPLOYMENT_ARCHIVE_ROOT
tar czf $ARCHIVE_PATH * >> $DEPLOY_LOG_FILE 2>&1
cd $WORKING_DIRECTORY
if [ $? -ne 0 ]; then
  echo "Creation of deployment archive $ARCHIVE_PATH failed."
  exit -1
fi

# Copy the deployment archive to the server (requires SSH permissions).
echo "Copying deployment archive"
scp $ARCHIVE_PATH $DEPLOYMENT_USER@$DEPLOYMENT_HOST:$DEPLOYMENT_FOLDER/$ARCHIVE_NAME >> $DEPLOY_LOG_FILE 2>&1
if [ $? -ne 0 ]; then
  echo "Creation of deployment archive $ARCHIVE_PATH failed."
  exit -1
fi

# Create the deployment folder on the remote server.
FOLDER_NAME=$DEPLOYMENT_ARCHIVE_PREFIX$TIMESTAMP
FOLDER_PATH=$DEPLOYMENT_FOLDER/$FOLDER_NAME
echo "Creating the $FOLDER_NAME in the $DEPLOYMENT_FOLDER on the server."
ssh -i $DEPLOYMENT_IDENTITY_FILE $DEPLOYMENT_USER@$DEPLOYMENT_HOST mkdir $FOLDER_PATH >> $DEPLOY_LOG_FILE 2>&1

echo "Unpacking the deployment files into the deployment folder."
ssh -i $DEPLOYMENT_IDENTITY_FILE $DEPLOYMENT_USER@$DEPLOYMENT_HOST "cd $FOLDER_PATH; pwd; tar xzf $DEPLOYMENT_FOLDER/$ARCHIVE_NAME" >> $DEPLOY_LOG_FILE 2>&1

# Move the new copy into place on the server.
INSTALL_FOLDER=/var/www/$DEPLOYMENT_DOMAIN/html
BACKUP_FOLDER=$INSTALL_FOLDER.$TIMESTAMP
echo "Slotting deployment into place (may stop to require password entry)."
ssh -t -i $DEPLOYMENT_IDENTITY_FILE $DEPLOYMENT_USER@$DEPLOYMENT_HOST "sudo systemctl stop nginx; sudo mv $INSTALL_FOLDER $BACKUP_FOLDER; sudo mv $FOLDER_PATH $INSTALL_FOLDER; sudo rm -rf $BACKUP_FOLDER; sudo systemctl start nginx" >> $DEPLOY_LOG_FILE 2>&1

# Cleanup time.
echo "Cleaning up."
rm $ARCHIVE_PATH 2> /dev/null
