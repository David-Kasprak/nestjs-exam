<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

This NestJS project uses postgresql database to store data, and redis to manage accessTokens for users.

Find configuration in src/common/config/configuration.ts

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

---
---

## HOW TO USE (Docs)

Any request should begin with "/api" prefix.
Example: http://localhost:3000/api/user/list

There are 3 controller routs:
1. api/auth
2. api/user
3. api/post

Each route has a set of endpoints.

---

1. /auth has the following endpoints:
- /auth/register - HTTP Req Method: POST - creating new user;
EXPECTS the following request body: {
  "firstName": string,
  "email": string,
  "password": string
  }


- /auth/login - HTTP Req Method: POST - beginning session / authorizing to get accessToken; EXPECTS the following request body: {
  "email": string,
  "password": string
  }


- /auth/logout - HTTP Req Method: POST - ending session / deleting this user's accessToken from redis; EXPECTS only Bearer with accessToken: string, no body request needed;

---

2. /user has the following endpoints:
- /user/list - HTTP Req Method: GET - getting all registered users; EXPECTS Bearer with accessToken: string + the following query params: page?: number, limit?: number


- /user/find/byId - HTTP Req Method: GET - finding a user by id; EXPECTS Bearer with accessToken: string + the only query param - id: string


- /user/find/byEmail - HTTP Req Method: GET - finding a user by email; EXPECTS Bearer with accessToken: string + the only query param - email: string


- /user/filter - HTTP Req Method: GET - getting and filtering all registered users; EXPECTS Bearer with accessToken: string + the following query params: 

email?: string, createdAfter?: string (date), createdBefore?: string (date), firstName?: string, page?: number, limit?: number

- /user/update - HTTP Req Method: PUT - updating the existing registered user (only by owner); EXPECTS Bearer with accessToken: string + the following body request: {
  "firstName"?: string, "email"?: string
  }


- /user/delete - HTTP Req Method: DELETE - deleting the existing registered user (only by owner); EXPECTS only Bearer with accessToken: string

---

3. /post has the following endpoints:
- /post/create - HTTP Req Method: POST - EXPECTS Bearer with accessToken: string + the following body request: {
  "title": string,
  "body": string,
  "description"?: string
  }


- /post/user/find - HTTP Req Method: GET - getting all posts of user by id; EXPECTS the following query params: userId: string, page?: number, limit?: number


- /post/update - HTTP Req Method: PUT - updating the existing post (only by owner); EXPECTS Bearer with accessToken: string + the following body request: {
  "postId": string,
  "updatePostDto": {
  "title"?: string,
  "description"?: string,
  "body"?: string
  }
  }


- /post/delete - HTTP Req Method: DELETE - deleting the existing post (only by owner); EXPECTS Bearer with accessToken: string + the following body request: {
  "postId": string
  }


---
---

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
