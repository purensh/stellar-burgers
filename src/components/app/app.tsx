import {
  AppHeader,
  IngredientDetails,
  Modal,
  OrderInfo,
  ProtectedRoute,
} from '@components';
import {
  ConstructorPage,
  Feed,
  ForgotPassword,
  Login,
  NotFound404,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword,
} from '@pages';
import {
  selectIngredients,
  selectIngredientsError,
  selectIngredientsLoading,
} from '@selectors/ingredients';
import { fetchIngredients } from '@slices/ingredients';
import { getUser } from '@slices/user';
import { Preloader } from '@ui';
import { clsx } from 'clsx';
import { useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

import type { AppContentProps } from './type';
import type { Location } from 'react-router-dom';

import '../../index.css';

import styles from './app.module.css';

type TLocationState = {
  background?: Location;
};

type TOrderDetailsModalProps = {
  onClose: () => void;
};

const formatOrderNumber = (number: string): string => `#${number.padStart(6, '0')}`;

const OrderDetailsModal = ({ onClose }: TOrderDetailsModalProps): React.JSX.Element => {
  const { number } = useParams<{ number: string }>();

  return (
    <Modal title={number ? formatOrderNumber(number) : ''} onClose={onClose}>
      <OrderInfo />
    </Modal>
  );
};

const App = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const ingredients = useSelector(selectIngredients);
  const isIngredientsLoading = useSelector(selectIngredientsLoading);
  const ingredientsError = useSelector(selectIngredientsError);
  const location = useLocation();
  const navigate = useNavigate();
  const background = (location.state as TLocationState | null)?.background;

  useEffect(() => {
    void dispatch(getUser());
    void dispatch(fetchIngredients());
  }, [dispatch]);

  const closeModal = (): void => {
    void navigate(-1);
  };

  return (
    <div className={styles.app}>
      <AppHeader />
      <AppContent
        ingredients={ingredients}
        isLoading={isIngredientsLoading}
        error={ingredientsError ? { message: ingredientsError } : null}
      >
        <Routes location={background ?? location}>
          <Route path="/" element={<ConstructorPage />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/ingredients/:id" element={<IngredientDetailsPage />} />
          <Route path="/feed/:number" element={<OrderDetailsPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/orders" element={<ProfileOrders />} />
            <Route path="/profile/orders/:number" element={<OrderDetailsPage />} />
          </Route>
          <Route path="*" element={<NotFound404 />} />
        </Routes>

        {background && (
          <Routes>
            <Route
              path="/ingredients/:id"
              element={
                <Modal title="Детали ингредиента" onClose={closeModal}>
                  <IngredientDetails />
                </Modal>
              }
            />
            <Route
              path="/feed/:number"
              element={<OrderDetailsModal onClose={closeModal} />}
            />
            <Route element={<ProtectedRoute />}>
              <Route
                path="/profile/orders/:number"
                element={<OrderDetailsModal onClose={closeModal} />}
              />
            </Route>
          </Routes>
        )}
      </AppContent>
    </div>
  );
};

/* Маршруты показываются только когда ингредиенты загружены: без них не
   отрисовать ни конструктор, ни состав заказа. */
const AppContent = ({
  ingredients,
  isLoading,
  error,
  children,
}: AppContentProps & { children: React.ReactNode }): React.JSX.Element => {
  if (isLoading) {
    return <Preloader />;
  }

  if (error) {
    return (
      <p className={clsx(styles.message, 'text', 'text_type_main-medium')}>
        Не удалось загрузить ингредиенты
        {error.message ? `: ${error.message}` : '.'}
      </p>
    );
  }

  if (!ingredients.length) {
    return (
      <p className={clsx(styles.message, 'text', 'text_type_main-medium')}>
        Нет ингредиентов
      </p>
    );
  }

  return <>{children}</>;
};

const IngredientDetailsPage = (): React.JSX.Element => (
  <main className={styles.detailPageWrap}>
    <h1 className={clsx(styles.detailHeader, 'text', 'text_type_main-large')}>
      Детали ингредиента
    </h1>
    <IngredientDetails />
  </main>
);

const OrderDetailsPage = (): React.JSX.Element => {
  const { number } = useParams<{ number: string }>();

  return (
    <main className={styles.detailPageWrap}>
      {number && (
        <h1 className={clsx(styles.detailHeader, 'text', 'text_type_main-large')}>
          {formatOrderNumber(number)}
        </h1>
      )}
      <OrderInfo />
    </main>
  );
};

export default App;
