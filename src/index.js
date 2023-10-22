const express = require("express");
const indexroutes = require("./routes/index.js");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(indexroutes);

app.listen(5000, () => {
  console.log("server is listen on port", 5000);
});
