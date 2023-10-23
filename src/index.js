const express = require("express");
const indexroutes = require("./routes/index.js");
const cors = require("cors");
const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(indexroutes);

app.listen(5000, () => {
  console.log("Server is listening on port 5000");
});
