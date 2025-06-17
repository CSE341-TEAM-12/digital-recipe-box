const router = require("express").Router();

// #swagger.tags = ['General']
// #swagger.summary = 'API Welcome Message'
// #swagger.description = 'Returns a welcome message for the Digital Recipe Box API. This endpoint can be used to check if the API is running and accessible.'
router.get("/", (req, res) => {
    // #swagger.responses[200] = { description: 'Welcome message returned successfully', schema: { type: 'string', example: 'Welcome to Digital Recipe Box API' } }
    res.send("Welcome to Digital Recipe Box API")
})

// API Routes
router.use('/recipes', require('./recipe'));
router.use('/cookbooks', require('./cookbook'));
router.use('/reviews', require('./review'));

module.exports = router