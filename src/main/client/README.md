First, start the REST API by running `./gradlew bootRun` from the project root.
Then change to `src/main/client` and run

```
npm run dev
```

The react app is now running here:
http://localhost:3006/app


TODO: https://github.com/spring-guides/gs-messaging-stomp-websocket

### Running a single test

```
npx vitest --run count -t basicCount
```
