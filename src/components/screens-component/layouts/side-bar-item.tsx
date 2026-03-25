


// src/constants/navItems.tsx
import React from 'react';
import {
  UserRound,
  Users,
  LayoutGrid,
  Settings,
  BarChart2,
  Phone,
} from 'lucide-react';
import { hasRole } from '@/lib/utils/hasRole';

export type NavLinkItem = {
  type?: 'link';
  path: string;
  label: string;
  icon?: React.ReactNode;
  pill?: boolean;
  visible?: boolean;
};

export type NavGroupItem = {
  type: 'group';
  label: string;
  icon?: React.ReactNode;
  children: Array<{
    path: string;
    label: string;
    icon?: React.ReactNode;
    pill?: boolean;
    visible?: boolean;
  }>;
};

export type NavItem = NavLinkItem | NavGroupItem;

const navItems: NavItem[] = [
  {
    type: 'link',
    path: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutGrid size={20} />,
  },
  {
    type: 'link',
    path: '/leads',
    label: 'Leads',
    icon: <UserRound size={20} />,
  },
  {
    type: 'link',
    path: '/team',
    label: 'Team',
    icon: <Users size={20} />,
    visible: hasRole(['Admin']),
  },
  {
    type: 'link',
    path: '/settings',
    label: 'Settings',
    icon: <Settings size={20} />,
    visible: hasRole(['Admin']),
  },
  // Reports Group
  {
    type: 'group',
    label: 'Reports',
    icon: <BarChart2 size={20} />,
    children: [
      {
        path: '/lead-funnel-report',
        label: 'Lead Funnel Report',
        visible: hasRole(['Admin']),
      },
      {
        path: '/revenue-forecast-report',
        label: 'Revenue Forecast report',
        visible: hasRole(['Admin']),
      },
    ],
  },
  {
    type: 'link',
    path: '/call-logs',
    label: 'Team Call Logs',
    icon: <Phone size={20} />,
    visible: hasRole(['Admin']),
  },
];

/**
 * FINAL FILTER:
 * - Hide link items when visible === false
 * - For groups: filter children by visible
 * - If group has 0 visible children → hide entire group
 */
const filteredNavItems: NavItem[] = navItems
  .map((item) => {
    // =======================
    // Case 1: Simple LINK item
    // =======================
    if (item.type !== 'group') {
      if (item.visible === false) return null;
      return item;
    }

    // =======================
    // Case 2: GROUP item
    // =======================
    const group = item as NavGroupItem;

    // Filter children who are visible
    const visibleChildren = group.children.filter(
      (child) => child.visible !== false
    );

    // Remove entire group if no visible children
    if (visibleChildren.length === 0) return null;

    return {
      ...group,
      children: visibleChildren,
    };
  })
  .filter(Boolean) as NavItem[];

export { navItems, filteredNavItems };
