const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const RedisStore = require('connect-redis')(session);
const flash = require("connect-flash");
const { redisClient } = require("./config/redis-config");
require("dotenv").config();

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/usersRouter");
const ownersRouter = require("./routes/ownersRouters");
const productsRouter = require("./routes/productsRouter");
const healthRouter = require("./routes/healthRouter");
const authStatus = require("./middlewares/authStatus");
const { loadUserCart, migrateCartFromSession } = require("./middlewares/cartMiddleware");

// Database connection
require("./config/mongoose-connection");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Redis session store
app.use(session({
    store: new RedisStore({ 
        client: redisClient,
        prefix: 'scatch:sess:'
    }),
    secret: process.env.EXPRESS_SESSION_SECRET || "defaultSecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(flash());

// Apply authentication status middleware globally
app.use(authStatus);

// Apply cart middleware globally
app.use(migrateCartFromSession);
app.use(loadUserCart);

// Make authentication status available to all EJS views
app.use(function(req, res, next) {
  res.locals.isAuthenticated = req.isAuthenticated;
  res.locals.isOwnerAuthenticated = req.isOwnerAuthenticated;
  res.locals.user = req.user;
  res.locals.owner = req.owner;
  res.locals.userType = req.userType;
  next();
});

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
 
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/owners", ownersRouter);
// app.use("/products", productsRouter);
app.use("/product", productsRouter);
app.use("/api", healthRouter);

app.listen(4000, () => console.log("Server running on port 4000"));