/**
 * Removes sensitive fields (e.g. password) before sending user payloads back to the client.
 */
const sanitizeUser = (user) => {
  if (!user) return user;
  // eslint-disable-next-line no-unused-vars
  const { password, ...safe } = user;
  return safe;
};

module.exports = { sanitizeUser };
