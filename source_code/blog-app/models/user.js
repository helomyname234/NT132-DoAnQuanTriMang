const { Schema, model } = require("mongoose");
const { createHmac, randomBytes, } = require('crypto');
const { type } = require("os");
const { createToken } = require("../services/authentication")

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    salt: {
        type: String,

    },

    password: {
        type: String,
        required: true,
    },

    profileImgUrl: {
        type: String,
        default: "/images/defaultProfile.jpg",
    },
    role: {
        type: String,
        enum: ["User", "Admin"],
        default: "User",
    },

    blogs: {
        type: Schema.Types.ObjectId,
        ref: "blog"
    }



}, { timestamps: true })



userSchema.pre("save", function (next) {

    const user = this;

    if (!user.isModified()) { return next(); }

    const salt = randomBytes(16).toString();

    const hashedPassword = createHmac('sha256', salt)
        .update(user.password)
        .digest("hex");

    this.salt = salt;
    this.password = hashedPassword;

    next();
})

userSchema.static("matchpasswordAndGenerateToken", async function (email, password) {

    const user = await this.findOne({ email });
    if (!user) { throw new Error("User not Found") };

    const salt = user.salt;
    const hashedpassword = user.password;

    const providedPasswordHashed = createHmac('sha256', salt)
        .update(password)
        .digest("hex");

    if (hashedpassword !== providedPasswordHashed) { throw new Error("Incorrect Password") }

    const token = createToken(user);

    return token;
});

const User = model("user", userSchema);

module.exports = User;