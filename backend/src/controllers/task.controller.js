const taskService = require('../services/task.service');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

const listTasks = asyncHandler(async (req, res) => {
  const data = await taskService.list(req.user, req.query);
  return success(res, { data, message: 'Tasks fetched' });
});

const getTask = asyncHandler(async (req, res) => {
  const task = await taskService.getById(req.user, req.params.id);
  return success(res, { data: task, message: 'Task fetched' });
});

const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.create(req.user, req.body);
  return success(res, { statusCode: 201, data: task, message: 'Task created' });
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.update(req.user, req.params.id, req.body);
  return success(res, { data: task, message: 'Task updated' });
});

const deleteTask = asyncHandler(async (req, res) => {
  await taskService.remove(req.user, req.params.id);
  return success(res, { statusCode: 200, data: null, message: 'Task deleted' });
});

module.exports = { listTasks, getTask, createTask, updateTask, deleteTask };
