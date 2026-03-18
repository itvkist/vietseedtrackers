## Available Script

In the project directory, you can run:

```
npm install
npm start
```

Runs the app in the development mode.<br />
Open [http://iai.uet.vnu.edu.vn:3000/](http://iai.uet.vnu.edu.vn:3000/) to view it in the browser.

update .env as .env.example

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

rerun docker:

```
docker-compose rm -f
docker-compose up -d --force-recreate koica-landing-page
docker-compose up -d --remove-orphans --force-recreate
```

or

```
docker-compose pull
docker-compose build --no-cache
docker-compose up --build -d
```
