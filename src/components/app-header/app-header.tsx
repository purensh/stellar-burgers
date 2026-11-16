import { selectUser } from '@selectors/user';
import { AppHeaderUI } from '@ui';

import { useSelector } from '@services/store';

export const AppHeader = (): React.JSX.Element => {
  /* TODO: Получите имя пользователя из хранилища */
  const user = useSelector(selectUser);

  return <AppHeaderUI userName={user?.name} />;
};
