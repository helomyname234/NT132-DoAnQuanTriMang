const { Router } = require("express");
const { handleCreateBlog, handelBodyOfBlog, handelComment, deleteBlog } = require("../controllers/blog");
const multer = require("multer");
const path = require("path")

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, path.resolve(`./public/uploads/`))
//     },
//     filename: function (req, file, cb) {
//         const fileName = `${Date.now()} + ${file.originalname}`;
//         cb(null, fileName);
//     }
// })

const { storage } = require("../utils/cloudinary/cloud");

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, path.resolve(`./public/uploads/`))
//     },
//     filename: function (req, file, cb) {
//         const fileName = `${Date.now()} + ${file.originalname}`;
//         cb(null, fileName);
//     }
// })

const upload = multer({ storage: storage })


const blogRouter = new Router();


blogRouter.get("/addblog", (req, res) => {
    res.render("createblog", {
        user: req.user
    });
})

blogRouter.post("/addblog", upload.single("coverImageUrl"), handleCreateBlog);


blogRouter.get("/:id", handelBodyOfBlog),

    blogRouter.post("/comment/:id", handelComment)


blogRouter.get("/delete/:id", deleteBlog)

module.exports = blogRouter;