const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return success(res, {
    statusCode: 201,
    data: result,
    message: 'Registration successful',
  });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return success(res, {
    statusCode: 200,
    data: result,
    message: 'Login successful',
  });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  return success(res, { data: { user }, message: 'Current user' });
});

module.exports = { register, login, me };
