const express = require("express");
const fs = require("fs").promises;
const app = express();

const routes = require("./routes/routes");
app.use(express.json());
app.use("/", routes);

app.listen(3547, () => console.log("Starded API"));
