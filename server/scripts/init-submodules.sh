#!/bin/bash
git submodule sync

git submodule update --init --remote --merge

git submodule foreach 'git stash && git reset --hard && git checkout dev && git pull'
