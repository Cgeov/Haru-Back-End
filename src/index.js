import express from "express";
import router from "./routes/index.js";

const routes = router;

const app = express();

app.listen(5000);
app.use(routes)