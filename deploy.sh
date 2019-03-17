pm2 delete node-test
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
touch $SERVER/src/gitdatas
mkdir $SERVER/src/git
mkdir $SERVER/src/view
mkdir $SERVER/src/view/project
rm -rf $SERVER/src/view/dist
mkdir $SERVER/src/view/dist


cd $FRONT
npm install
npm run build
mv -f $FRONT/dist $SERVER/src/view

cd $SERVER
pm2 delete node-test
pm2 start npm --name=node-test -- run start

