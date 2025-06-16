const router = require("express").Router();

router.get("/", (req, res) => {
    res.send("Welcome to Digital Recipe Box API")
})

// API Routes
router.use('/recipes', require('./recipe'));
router.use('/cookbooks', require('./cookbook'));
router.use('/reviews', require('./review'));

module.exports = router