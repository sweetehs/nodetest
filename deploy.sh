ROOT=`pwd`
FRONT="$ROOT/node-test-f"
SERVER="$ROOT/node-test"

cd $SERVER
npm install
touch $SERVER/src/gitdatas
mkdir $SERVER/src/view/project

cd $FRONT
npm run build
mv -f $FRONT/dist $SERVER/src/view

# cd $SERVER
# pm2 start npm --name=node-test -- run start

