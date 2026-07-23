import { UserRole, type User } from './types';

type Role = UserRole.ADMIN | UserRole.GOVERNMENT | UserRole.INVESTOR | UserRole.MINER;

const ALL_ROLES: Role[] = [
  UserRole.ADMIN,
  UserRole.GOVERNMENT,
  UserRole.INVESTOR,
  UserRole.MINER,
];

const CORE_ROUTES = ['/dashboard', '/messages', '/profile'];
const TRADE_ROUTES = ['/contracts', '/contract-detail', '/orders', '/transactions'];
const INVESTOR_ONLY_ROUTES = ['/contract-proposal', '/payment'];
const OPERATION_ROUTES = [
  '/mine-sites',
  '/production-reports',
  '/compliance',
  '/environmental-records',
];
const SHARED_DUE_DILIGENCE_ROUTES = [
  '/logistics-management',
  '/lab-results',
  '/mineral-passports',
  '/investor-opportunities',
  '/marketplace',
];
const MINER_ONLY_ROUTES = ['/listings', '/tasks'];
const ADMIN_ONLY_PREFIXES = ['/admin'];

const DASHBOARD_ROUTE_ROLES: Array<{ paths: string[]; roles: Role[] }> = [
  { paths: CORE_ROUTES, roles: ALL_ROLES },
  { paths: TRADE_ROUTES, roles: [UserRole.MINER, UserRole.INVESTOR] },
  { paths: INVESTOR_ONLY_ROUTES, roles: [UserRole.INVESTOR] },
  {
    paths: OPERATION_ROUTES,
    roles: [UserRole.ADMIN, UserRole.GOVERNMENT, UserRole.MINER],
  },
  {
    paths: SHARED_DUE_DILIGENCE_ROUTES,
    roles: ALL_ROLES,
  },
  { paths: ['/revenue-analytics'], roles: [UserRole.ADMIN, UserRole.GOVERNMENT, UserRole.MINER] },
  { paths: MINER_ONLY_ROUTES, roles: [UserRole.MINER] },
];

export function canAccessDashboardPath(user: User | null | undefined, pathname?: string | null) {
  if (!user?.role || !pathname) return false;
  const role = user.role as Role;

  if (ADMIN_ONLY_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return role === UserRole.ADMIN;
  }

  const matched = DASHBOARD_ROUTE_ROLES.find((entry) =>
    entry.paths.some((path) => pathname === path || pathname.startsWith(`${path}/`)),
  );

  return matched ? matched.roles.includes(role) : true;
}

export function filterAllowedNavItems<T extends { href: string }>(
  user: User | null | undefined,
  items: T[],
) {
  return items.filter((item) => canAccessDashboardPath(user, item.href));
}
