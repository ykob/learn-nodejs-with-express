import express from "express";
import users from "./api/users/users.routes";

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/users", users);
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
