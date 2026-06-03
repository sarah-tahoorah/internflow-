const express = require('express');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { enforceDomain, validateInternAccess, validateTaskDomain } = require('../middleware/domainCheck');
const router = express.Router();
router.route('/')
  .get(protect, getTasks)
  .post(
    protect, 
    authorize('admin'), 
    enforceDomain,
    validateTaskDomain,
    validateInternAccess,
    createTask
  );
router.route('/:id')
  .get(protect, getTaskById)
  .put(
    protect, 
    authorize('admin'),
    enforceDomain,
    validateInternAccess,
    updateTask
  )
  .delete(protect, authorize('admin'), enforceDomain, deleteTask);
module.exports = router;