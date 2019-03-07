
ROOT=`pwd`
FRONT="$ROOT/node-test-f"
SERVER="$ROOT/node-test"

cd $SERVER
rm -rf $SERVER/src/git
mkdir $SERVER/src/git
rm -rf $SERVER/src/gitdatas
touch $SERVER/src/gitdatas
rm -rf $SERVER/src/dist
npm install


cd $FRONT
npm install
npm run build
mv -f $FRONT/dist $SERVER/src

cd $SERVER
pm2 delete node-test
pm2 start npm --name=node-test -- run start

