const { connect } = require("mongoose");

function connectDB(url) {
    return connect(url);
}

module.exports = { connectDB }