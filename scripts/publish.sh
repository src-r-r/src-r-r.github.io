#!/bin/bash

SOURCE=${BASH_SOURCE[0]}
while [ -L "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  HERE=$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )
  SOURCE=$(readlink "$SOURCE")
  [[ $SOURCE != /* ]] && SOURCE=$HERE/$SOURCE # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
HERE=$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )

PROJECT=$(realpath ${HERE}/..)
STATIC=${PROJECT}/static
OUTPUT=${PROJECT}/output
NODE_MODULES=${PROJECT}/node_modules
SASS=${NODE_MODULES}/.bin/sass
PNPM=$(which pnpm)

### Git settings
REPO=git@github.com:src-r-r/src-r-r.github.io.git
THIS_BRANCH="staging"
PUBLISH_BRANCH="gh-pages"


echo "# Building 11ty site"
cd ${PROJECT} && echo ${PNPM} run build

echo "# Copying JavaScript"

for js in $(find ${STATIC} -iname '*.js'); do
    DIRNAME=$(dirname $js)
    RELDIRNAME=$(realpath ${DIRNAME} --relative-to ${PROJECT})
    RELPATH=$(realpath $js --relative-to ${PROJECT})
    # echo ${REALDIRNAME}
    ABSPATH=${OUTPUT}/${RELPATH}
    mkdir -p ${OUTPUT}/${RELDIRNAME}
    cp -R $js ${ABSPATH}
    echo " >" mkdir -p ${OUTPUT}/${RELDIRNAME}
    echo " >" cp -R $js ${ABSPATH}
done

echo "# Building Sass"
cd ${PROJECT} && ${PNPM} run build:sass

NOW=$(date +"%Y/%m/%d")

cd ${OUTPUT}
echo "> " git remote add pages ${REPO} ||:
git remote add pages ${REPO} ||:
echo "> " git checkout -b ${THIS_BRANCH} ||:
git checkout -b ${THIS_BRANCH} ||:
echo "> " git checkout ${THIS_BRANCH} ||:
git checkout ${THIS_BRANCH} ||:
echo "> " git commit -am "Revision ${NOW}"
git commit -am "Revision ${NOW}"
echo "> " git push -u pages ${PUBLISH_BRANCH} -f
git push -u pages ${PUBLISH_BRANCH} -f