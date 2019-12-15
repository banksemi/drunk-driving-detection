import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'Dashboard',
    icon: 'home-outline',
    link: '/pages/dashboard',
    home: true,
  },
  {
    title: '내 상태 보기',
    icon: 'clipboard-outline',
    expanded: true,
    children: [
      {
        title: '가이드',
        link: '/pages/guide',
      },
      {
        title: '내 프로필',
        link: '/pages/application',
      },
    ],
  },
  {
    title: 'Setting',
    icon: "options-2-outline",
    link: '/pages/setting'
  },
];
