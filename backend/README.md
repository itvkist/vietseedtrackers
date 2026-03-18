# Backend README

## Requirements

- [Node.js](https://nodejs.dev) v12.20 and above

## Installation

```bash
npm install
npx directus start
```

## Notes

- **Default admin login account**:  
  `admin@directus.com/123`

- **To add new users**:  
  Open Directus at http://localhost:8055, log in with the default admin account, then add users in the Users directory.

- **Fix upload images**:  
  ```bash
  docker-compose exec -u root directus chown -R node:node /directus/database /directus/extensions /directus/uploads
  ```

- **Create schema snapshot**:  
  ```bash
  docker-compose exec -u root directus npx directus schema snapshot --yes ./schema.yaml
  ```
