import {
  BurgerIcon,
  ListIcon,
  ProfileIcon,
  Logo,
} from '@krgaa/react-developer-burger-ui-components';
import { clsx } from 'clsx';
import { NavLink, useLocation } from 'react-router-dom';

import type { TAppHeaderUIProps } from './type';

import styles from './app-header.module.css';

const getLinkClassName = ({ isActive }: { isActive: boolean }): string =>
  clsx(styles.link, isActive && styles.link_active);

export const AppHeaderUI = ({ userName }: TAppHeaderUIProps): React.JSX.Element => {
  const { pathname } = useLocation();
  const isConstructorRoute = pathname === '/' || pathname.startsWith('/ingredients/');

  return (
    <header className={styles.header}>
      <nav className={clsx(styles.menu, 'p-4')}>
        <div className={styles.menu_part_left}>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              getLinkClassName({ isActive: isActive || isConstructorRoute })
            }
          >
            {({ isActive }) => (
              <>
                <BurgerIcon
                  type={isActive || isConstructorRoute ? 'primary' : 'secondary'}
                />
                <p className="text text_type_main-default ml-2 mr-10">Конструктор</p>
              </>
            )}
          </NavLink>
          <NavLink to="/feed" className={getLinkClassName}>
            {({ isActive }) => (
              <>
                <ListIcon type={isActive ? 'primary' : 'secondary'} />
                <p className="text text_type_main-default ml-2">Лента заказов</p>
              </>
            )}
          </NavLink>
        </div>
        <NavLink to="/" className={styles.logo} aria-label="На главную">
          <Logo className="" />
        </NavLink>
        <div className={styles.link_position_last}>
          <NavLink to="/profile" className={getLinkClassName}>
            {({ isActive }) => (
              <>
                <ProfileIcon type={isActive ? 'primary' : 'secondary'} />
                <p className="text text_type_main-default ml-2">
                  {userName ?? 'Личный кабинет'}
                </p>
              </>
            )}
          </NavLink>
        </div>
      </nav>
    </header>
  );
};
