
# REST API TYPESCRIPT MYSQL JWT

CRUD REST API with auth.

## Project Setting
Modules:
- typescript
- express
- jsonwebtoken

Dev Modules:
- ts-node-dev
- morgan
- mysql2
- bcryptjs
- @types/bcryptjs
- @types/Express
- @types/jsonwebtoken
- @types/morgan


## API Reference

You can get users and posts without necesity to bring a token, but to UPDATE, DELETE or POST you need to be registered and send the JWT in headers request, like "authorization" Bearer Token.

When create a post, the author is by default the username of the active session provided by our jwt.

#### Get USERS

```http
  GET /api/user
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `user_id` | `number` | id **automatically**|
| `username` | `string` | username UNIQUE|
| `email` | `string` |email UNIQUE |
| `password` | `string` | excrypted password |
| `created_at` | `TIMESTAMP` | current_timestamp **automatically**|

#### Get POSTS

```http
  GET /api/post  ||  GET /api/post/:id
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `post_id` | `number` | id **automatically**|
| `title` | `string` | titile |
| `post` | `string` | post content |
| `author` | `string` | uername got from token **automatically**|
| `created_at` | `TIMESTAMP` | current_timestamp **automatically** |


## Authors

- Github profile - [@emunoz-qsudaca](https://github.com/emunoz-qsudaca)

