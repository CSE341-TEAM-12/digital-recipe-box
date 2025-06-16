const router = require('express').Router();
const cookbookController = require('../controllers/cookbookController');
const { authenticateUser } = require('../middleware/auth');
const { validateCookbook, validateObjectId } = require('../middleware/validation');

// @route   GET /cookbooks
// @desc    Get all cookbooks owned by the logged-in user
// @access  Protected
router.get('/', authenticateUser, cookbookController.getUserCookbooks);

// @route   GET /cookbooks/:id
// @desc    Get a single cookbook by ID (user must be owner)
// @access  Protected
router.get('/:id', authenticateUser, validateObjectId, cookbookController.getCookbookById);

// @route   POST /cookbooks
// @desc    Create a new cookbook
// @access  Protected
router.post('/', authenticateUser, validateCookbook, cookbookController.createCookbook);

module.exports = router;
