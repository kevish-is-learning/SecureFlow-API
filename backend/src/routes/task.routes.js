const { Router } = require('express');
const taskController = require('../controllers/task.controller');
const validate = require('../middleware/validate');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const {
  createTaskSchema,
  updateTaskSchema,
  idParamSchema,
  listQuerySchema,
} = require('../validators/task.validator');

const router = Router();

router.use(verifyToken);

/**
 * @openapi
 * /tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: List tasks (own for USER, all for ADMIN)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: completed
 *         schema: { type: string, enum: [true, false] }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated list of tasks
 */
router.get(
  '/',
  authorizeRoles('USER', 'ADMIN'),
  validate(listQuerySchema),
  taskController.listTasks
);

/**
 * @openapi
 * /tasks/{id}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get a task by id
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Task }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get(
  '/:id',
  authorizeRoles('USER', 'ADMIN'),
  validate(idParamSchema),
  taskController.getTask
);

/**
 * @openapi
 * /tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Create a task
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskInput'
 *     responses:
 *       201: { description: Task created }
 *       400: { $ref: '#/components/responses/BadRequest' }
 */
router.post(
  '/',
  authorizeRoles('USER', 'ADMIN'),
  validate(createTaskSchema),
  taskController.createTask
);

/**
 * @openapi
 * /tasks/{id}:
 *   put:
 *     tags: [Tasks]
 *     summary: Update a task
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskUpdateInput'
 *     responses:
 *       200: { description: Task updated }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.put(
  '/:id',
  authorizeRoles('USER', 'ADMIN'),
  validate(updateTaskSchema),
  taskController.updateTask
);

/**
 * @openapi
 * /tasks/{id}:
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete a task
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Task deleted }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.delete(
  '/:id',
  authorizeRoles('USER', 'ADMIN'),
  validate(idParamSchema),
  taskController.deleteTask
);

module.exports = router;
