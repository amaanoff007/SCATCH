const express =require("express");
const app=express();

const cookieParser=require("cookie-parser")
const path=require("path");
const ownersRouter=require("./routes/ownersRouters");
const productsRouter=require("./routes/productsRouter");
const usersRouter=require("./routes/usersRouter");
//data base exported
const db=require("./config/mongoose-connection");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname,"public")));
app.set("view engine","ejs");

app.use("/owners", ownersRouter);
app.use("/users",usersRouter);
app.use("/products",productsRouter);

app.get("/",(req,res)=>{
    res.send("hey");
});

app.listen(4000);
