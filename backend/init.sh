#!/bin/sh

npx directus bootstrap
npx directus schema apply ./schema.yaml -y
npx directus start
