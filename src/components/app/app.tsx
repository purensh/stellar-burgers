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
import { fetchIngredients } from '@slices/ingredients';
import { getUser } from '@slices/user';
import { clsx } from 'clsx';
import { useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';

import { useDispatch } from '@services/store';

import type { Location } from 'react-router-dom';

import '../../index.css';

// Класс .message сохранён на случай возврата старого экрана загрузки/ошибки.
// eslint-disable-next-line css-modules/no-unused-class
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

/* Маршруты показываются только когда ингредиенты загружены: без них не
   отрисовать ни конструктор, ни состав заказа. */
const App = (): React.JSX.Element => {
  const dispatch = useDispatch();
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
    </div>
  );
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
