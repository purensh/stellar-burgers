import { selectUser, selectUserError, selectUserLoading } from '@selectors/user';
import { clearUserError, loginUser } from '@slices/user';
import { LoginUI } from '@ui-pages';
import { type SyntheticEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

import type { Location } from 'react-router-dom';

type TLoginLocationState = {
  from?: Location;
};

export const Login = (): React.JSX.Element => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const user = useSelector(selectUser);
  const error = useSelector(selectUserError);
  const isLoading = useSelector(selectUserLoading);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as TLoginLocationState | null)?.from;
  const redirectPath = from ? `${from.pathname}${from.search}${from.hash}` : '/';

  useEffect(() => {
    dispatch(clearUserError());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      void navigate(redirectPath, { replace: true });
    }
  }, [navigate, redirectPath, user]);

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    void dispatch(loginUser({ email, password }))
      .unwrap()
      .catch(() => undefined);
  };

  return (
    <LoginUI
      errorText={error ?? ''}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
    />
  );
};
