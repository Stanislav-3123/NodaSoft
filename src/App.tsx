import React, { useState, useCallback, useMemo } from "react";

const URL = "https://jsonplaceholder.typicode.com/users";

type Company = {
  bs: string;
  catchPhrase: string;
  name: string;
};

type Address = {
  // Укажите здесь все необходимые поля и их типы
};

type User = {
  id: number;
  email: string;
  name: string;
  phone: string;
  username: string;
  website: string;
  company: Company;
  address: Address;
};

interface IButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

function Button({ onClick }: IButtonProps): JSX.Element {
  return (
    <button type="button" onClick={onClick}>
      get random user
    </button>
  );
}

interface IUserInfoProps {
  user: User | null;
}

function UserInfo({ user }: IUserInfoProps): JSX.Element | null {
  if (!user) return null;

  return (
    <table>
      <thead>
        <tr>
          <th>Username</th>
          <th>Phone number</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{user.name}</td>
          <td>{user.phone}</td>
        </tr>
      </tbody>
    </table>
  );
}

const UserInfoMemo = React.memo(UserInfo);

function useThrottle(callback: () => void, delay: number): (() => void) {
  const [timerId, setTimerId] = useState<number | null>(null);

  return () => {
    if (timerId) return;
    callback();
    setTimerId(setTimeout(() => setTimerId(null), delay) as unknown as number);
  };
}

function App(): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const cache: Record<number, User> = useMemo(() => ({}), []);

  const receiveRandomUser = useCallback(async () => {
    try {
      const id = Math.floor(Math.random() * (10 - 1)) + 1;
      if (user && user.id === id) return;
      if (cache[id]) {
        setUser(cache[id]);
        return;
      }
      const response = await fetch(`${URL}/${id}`);
      const _user = (await response.json()) as User;
      cache[id] = _user;
      setUser(_user);
    } catch (error) {
      console.error("Ошибка при получении данных:", error);
    }
  }, [user, cache]);

  const handleButtonClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.stopPropagation();
      receiveRandomUser();
    },
    [receiveRandomUser]
  );

  const throttledHandleButtonClick = useThrottle(handleButtonClick, 500);

  return (
    <div>
      <header>Get a random user</header>
      <Button onClick={throttledHandleButtonClick} />
      <UserInfoMemo user={user} />
    </div>
  );
}

export default App;

