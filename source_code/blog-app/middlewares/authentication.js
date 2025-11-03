const { verifyToken } = require("../services/authentication")

function checkForAuthentication(cookieName) {
    return (req, res, next) => {
        const tokenCookieValue = req.cookies[cookieName];

        if (!tokenCookieValue) { return next(); }
        try {
            const userpayload = verifyToken(tokenCookieValue);
            req.user = userpayload;
        } catch (error) { }
        return next();


    }
}

module.exports = { checkForAuthentication }