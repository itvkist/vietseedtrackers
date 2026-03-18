# DOCUMENTS

## Requirement

- [Node.js](https://nodejs.dev) v12.20 and above

## BUILD

```
npm install
npx directus start
```

- change role_id users.csv
- import csv to db
- change roles' permissions

## NOTE

- default admin login account:  
admin@directus.com/123

- fix upload img:  
`docker-compose exec -u root directus chown -R node:node /directus/database /directus/extensions /directus/uploads`

- screenshot:  
`docker-compose exec -u root directus npx directus schema snapshot --yes ./schema.yaml`
