const VALID_ROLES = ['PRESIDENT', 'HR', 'FINANCE', 'EMPLOYEE'];

const ROLE_ACCESS = {
  PRESIDENT: ['GENERAL', 'HR', 'FINANCE', 'EXEC'],
  HR:        ['GENERAL', 'HR'],
  FINANCE:   ['GENERAL', 'FINANCE'],
  EMPLOYEE:  ['GENERAL'],
};

function resolveRole(headerValue) {
  const role = (headerValue || '').toUpperCase().trim();
  return VALID_ROLES.includes(role) ? role : 'EMPLOYEE';
}

function accessLevelsForRole(role) {
  return ROLE_ACCESS[role] || ROLE_ACCESS.EMPLOYEE;
}

module.exports = { resolveRole, accessLevelsForRole, VALID_ROLES };
