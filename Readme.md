*This ReadMe Should be updated with the expectations shortly after being launches for issue workk*

## How to run:
### Pre-reqs
* Python (tested on 3.13), 
* Node (tested on version 20.19) 
### Backend 
* CD into `dggcrm`
* run `python manage.py runserver 8080`
    * The program will not work given a different port (8080)

### Frontend 
* Go to application folder
* run `npm install` to install dependencies
* run `npm run dev` to start the program

### Docker

If you prefer, it's also possible to bring up the dev stack using docker. You can run the following from the root of this repo:

```
docker compose -f docker-compose.dev.yaml up
```

This will build and deploy the frontend, as well as automatically populate the DB with test data.

Updating docker-compose.dev.yaml to have `RUN_CREATE_DB=0` will skip the test data DB population.

If you run into build issues, you may need to tear down and rebuild the containers:

```
docker compose -f docker-compose.dev.yaml down -v
docker compose -f docker-compose.dev.yaml build --no-cache
docker compose -f docker-compose.dev.yaml up
```