ROOT=`pwd`
FRONT="$ROOT/node-test-f"
SERVER="$ROOT/node-test"

cd $SERVER
npm install
rm -rf $SERVER/src/dist

cd $FRONT
npm run build
mv -f $FRONT/dist $SERVER/src

cd $SERVER
pm2 start npm --name=node-test -- run start

