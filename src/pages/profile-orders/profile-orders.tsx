import { selectIngredients, selectIngredientsLoading } from '@selectors/ingredients';
import { selectOrders, selectOrdersLoading } from '@selectors/orders';
import { getOrders } from '@slices/orders';
import { Preloader } from '@ui';
import { ProfileOrdersUI } from '@ui-pages';
import { useEffect } from 'react';

import { useDispatch, useSelector } from '@services/store';

export const ProfileOrders = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders);
  const isOrdersLoading = useSelector(selectOrdersLoading);
  const ingredients = useSelector(selectIngredients);
  const isIngredientsLoading = useSelector(selectIngredientsLoading);

  useEffect(() => {
    void dispatch(getOrders());
  }, [dispatch]);

  if (isOrdersLoading || isIngredientsLoading || !ingredients.length) {
    return <Preloader />;
  }

  return <ProfileOrdersUI orders={orders} />;
};
