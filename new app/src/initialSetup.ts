import connect from "./database";

const initialSetup = async () => {
  const conn = await connect();
  try {
    await conn
      .query(
        "CREATE TABLE user(user_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, username VARCHAR(20) NOT NULL UNIQUE, email VARCHAR(30) NOT NULL UNIQUE, password VARCHAR(100) NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)"
      )
      .then((data) => console.log(`Table USER created succesffully: ${data}`))
      .catch((err) =>
        console.log(`Table USER cannot be created. Error: ${err.message}`)
      );
    await conn
      .query(
        "CREATE TABLE post(post_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, title VARCHAR(100) NOT NULL UNIQUE, post VARCHAR(1000) NOT NULL, author VARCHAR(50) NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)"
      )
      .then((data) => console.log(`Table POST created succesffully: ${data}`))
      .catch((err) =>
        console.log(`Table POST cannot be created. Error: ${err.message}`)
      );

    await conn
      .query(
        "INSERT INTO user (username, email, password) VALUES('admin', 'admin@system.com', '0000')"
      )
      .then((_data) =>
        console.log(
          `username: admin, email: admin@system.cl, password: 0000. Created successfully`
        )
      )
      .catch((err) =>
        console.log(`User ADMIN cannot be created. Error: ${err.message}`)
      );
  } catch (error) {
    return console.log(error);
  }
};

export default initialSetup;
