import express from "express";
import userController from "./controllers/user-controller";

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/users", userController);
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
