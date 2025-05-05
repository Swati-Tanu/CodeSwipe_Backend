require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cors = require("cors");
const http = require("http");

const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");

require("./utils/cronJob");

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const authRouter = require("./routes/authRouter");
const profileRouter = require("./routes/profileRouter");
const requestRouter = require("./routes/requestRouter");
const userRouter = require("./routes/userRouter");
const paymentRouter = require("./routes/paymentRouter");
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routes/chatRouter");

app.get("/home", (req, res) => {
  res.send("Welcome to Code Swipe!");
});

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);
app.use("/", chatRouter);

const server = http.createServer(app);
initializeSocket(server);

connectDB()
  .then(() => {
    console.log("DB connection established!");
    server.listen(3000, () => {
       console.log("Server listening to port 3000");
     });
  })
  .catch(() => {
    console.log("DB cannot be connected!");
  });
