const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

router.use(authMiddleware);

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
