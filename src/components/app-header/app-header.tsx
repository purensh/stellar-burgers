import { selectUser } from '@selectors/user';
import { AppHeaderUI } from '@ui';
import { useMatch } from 'react-router-dom';

import { useSelector } from '@services/store';

export const AppHeader = (): React.JSX.Element => {
  const user = useSelector(selectUser);
  const isIngredientRoute = Boolean(useMatch('/ingredients/:id'));

  return <AppHeaderUI userName={user?.name} isConstructorActive={isIngredientRoute} />;
};
