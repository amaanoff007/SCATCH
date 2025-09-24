const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");   // correct
const flash = require("connect-flash");       // correct
require("dotenv").config();

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/usersRouter");
const ownersRouter = require("./routes/ownersRouters");
const productsRouter = require("./routes/productsRouter");

// Database connection
require("./config/mongoose-connection");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET || "defaultSecret",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/owners", ownersRouter);
app.use("/products", productsRouter);

app.listen(4000, () => console.log("Server running on port 4000"));
