import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'integrations', title: 'CSV Upload', href: paths.dashboard.integrations, icon: 'plugs-connected' },
  { key: 'settings', title: 'Threshold Input', href: paths.dashboard.settings, icon: 'gear-six' },
  { key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'customers', title: 'Customers', href: paths.dashboard.customers, icon: 'users' },
  { key: 'history', title: 'Results History', href: paths.dashboard.history, icon: 'x-square' },
  { key: 'account', title: 'Send Email', href: paths.dashboard.account, icon: 'user' },
  { key: 'error', title: 'Error', href: paths.errors.notFound, icon: 'x-square' },
] satisfies NavItemConfig[];

/*import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'integrations', title: 'CSV Upload', href: paths.dashboard.integrations, icon: 'plugs-connected' },
  { key: 'settings', title: 'Threshold Input', href: paths.dashboard.settings, icon: 'gear-six' },
  { key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'customers', title: 'Customers', href: paths.dashboard.customers, icon: 'users' },
  { key: 'account', title: 'Send Email', href: paths.dashboard.account, icon: 'user' },
  { key: 'error', title: 'Error', href: paths.errors.notFound, icon: 'x-square' },
] satisfies NavItemConfig[];*/
