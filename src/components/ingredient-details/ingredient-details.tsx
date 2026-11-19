import { selectIngredients, selectIngredientsLoading } from '@selectors/ingredients';
import { Preloader, IngredientDetailsUI } from '@ui';
import { useParams } from 'react-router-dom';

import { useSelector } from '@services/store';

export const IngredientDetails = (): React.JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const ingredients = useSelector(selectIngredients);
  const isIngredientsLoading = useSelector(selectIngredientsLoading);
  const ingredientData = ingredients.find((ingredient) => ingredient._id === id);

  if (isIngredientsLoading) {
    return <Preloader />;
  }

  if (!ingredientData) {
    return (
      <p className="text text_type_main-default text_color_inactive">
        Ингредиент не найден
      </p>
    );
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
