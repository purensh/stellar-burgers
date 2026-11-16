import {
  selectIngredients,
  selectIngredientsError,
  selectIngredientsLoading,
} from '@selectors/ingredients';
import {
  selectOrderData,
  selectOrderDataLoading,
  selectOrdersError,
} from '@selectors/orders';
import { getOrderByNumber } from '@slices/orders';
import { OrderInfoUI, Preloader } from '@ui';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

import type { TIngredient } from '@utils-types';

export const OrderInfo = (): React.JSX.Element => {
  const { number } = useParams<{ number: string }>();
  const dispatch = useDispatch();
  const orderData = useSelector(selectOrderData);
  const ingredients = useSelector(selectIngredients);
  const isOrderDataLoading = useSelector(selectOrderDataLoading);
  const isIngredientsLoading = useSelector(selectIngredientsLoading);
  const orderError = useSelector(selectOrdersError);
  const ingredientsError = useSelector(selectIngredientsError);
  const orderNumber = Number(number);

  useEffect(() => {
    if (!Number.isFinite(orderNumber) || orderNumber <= 0) return;

    void dispatch(getOrderByNumber(orderNumber));
  }, [dispatch, orderNumber]);

  /* Готовим данные для отображения */
  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = Record<string, TIngredient & { count: number }>;

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1,
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total,
    };
  }, [orderData, ingredients]);

  if (!Number.isFinite(orderNumber) || orderNumber <= 0) {
    return <p className="text text_type_main-default">Заказ не найден</p>;
  }

  if (isOrderDataLoading || isIngredientsLoading) {
    return <Preloader />;
  }

  if (orderError) {
    return (
      <p className="text text_type_main-default">
        Не удалось загрузить заказ: {orderError}
      </p>
    );
  }

  if (ingredientsError) {
    return (
      <p className="text text_type_main-default">
        Не удалось загрузить ингредиенты: {ingredientsError}
      </p>
    );
  }

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
