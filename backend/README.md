# Backend README

## Requirements

- [Node.js](https://nodejs.dev) v12.20 and above

## Installation

```bash
npm install
npx directus start
```

If `data.db` is not present, run `init.sh`:

- Change `role_id` in `users.csv`
- Import CSV to database
- Change roles' permissions

## Notes

- **Default admin login account**:  
  `admin@directus.com/123`

- **Fix upload images**:  
  ```bash
  docker-compose exec -u root directus chown -R node:node /directus/database /directus/extensions /directus/uploads
  ```

- **Create schema snapshot**:  
  ```bash
  docker-compose exec -u root directus npx directus schema snapshot --yes ./schema.yaml
  ```
