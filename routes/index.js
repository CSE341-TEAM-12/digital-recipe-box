const router = require("express").Router();

router.get("/", (req, res) => {
    res.send("Welcome to Digital Recipe Box")
})


module.exports = router