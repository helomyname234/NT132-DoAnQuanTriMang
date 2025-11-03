require('dotenv').config()
const express = require("express");
const ejs = require("ejs")
const path = require("path");
const { connectDB } = require("./mongoDBconnect");
const userRouter = require("./routes/user");
const blogRouter = require("./routes/blog");
const cookieParser = require("cookie-parser");
const { checkForAuthentication } = require("./middlewares/authentication");
const blog = require("./models/blog")

const app = express();
const PORT = process.env.PORT || 8000;

connectDB(process.env.MONGO_URL).then(() => {
    console.log("MongoDb Connected Successfully")
}).catch((err) => { console.log(err) });

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthentication("token"));
app.use(express.static(path.resolve("./public")))

app.get("/", async (req, res) => {
    const allBlog = await blog.find({})
    res.render("homepage", {
        user: req.user,
        Blog: allBlog,
    });
})
app.use("/user", userRouter);

app.use("/blog", blogRouter);

app.listen(PORT, () => { console.log("Server Started at PORT", PORT) });