const Blog = require("../models/blog");
const Comment = require("../models/comment")


async function handleCreateBlog(req, res) {
    const { tittle, body } = req.body;


    const blog = await Blog.create({
        tittle,
        body,
        coverImageUrl: req.file.path,
        createdBy: req.user._id,
    })

    return res.redirect(`/blog/${blog._id}`)
}

async function handelBodyOfBlog(req, res) {

    const blog = await Blog.findById(req.params.id).populate("createdBy");

    const comments = await Comment.find({ blogId: req.params.id })
        .populate("createdBy");

    return res.render("blog", {
        user: req.user,
        blog,
        comments,
    })
}


async function handelComment(req, res) {
    const comment = await Comment.create({
        content: req.body.content,
        blogId: req.params.id,
        createdBy: req.user._id
    })
    return res.redirect(`/blog/${req.params.id}`)

}

async function deleteBlog(req, res) {
    const blog = await Blog.findById(req.params.id).populate("createdBy");

    if (!blog) {
        return res.status(404).send("Blog not found");
    }

    await Blog.deleteOne({ _id: blog._id });
    res.redirect("/user/profile");

}

module.exports = { handleCreateBlog, handelBodyOfBlog, handelComment, deleteBlog };
