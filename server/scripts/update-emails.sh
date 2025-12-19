source .env

set -e

DEFAULT_BRANCH=$NODE_ENV

if [ -z "$EMAIL_TEMPLATES_BRANCH" ]; then
  # variable is empty, use default one
  TARGET_BRANCH=$DEFAULT_BRANCH
else
  TARGET_BRANCH=$EMAIL_TEMPLATES_BRANCH
fi

echo "Using <$TARGET_BRANCH> branch to pull changes"

git submodule update --init --recursive --remote --merge
git submodule foreach "git stash && git reset --hard && git checkout $TARGET_BRANCH && git pull && yarn install"
