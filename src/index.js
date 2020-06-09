const express = require("express");
const app = express();

const routes = require("./routes/routes.js");
app.use(express.json());
app.use("/", routes);

app.listen(3547, () => console.log("Starded API"));
