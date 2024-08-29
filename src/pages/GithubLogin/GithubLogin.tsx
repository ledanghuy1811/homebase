import React from 'react';
import classNames from 'classnames/bind';
import { Link, useLocation } from 'react-router-dom';

import styles from './GithubLogin.module.scss';
import { Button } from 'components/Button';
import { getGithubCode } from 'utils/githubCode';

const cx = classNames.bind(styles);

const GithubLogin: React.FC = () => {
  const { search } = useLocation();
  const urlParams = new URLSearchParams(search);
  const code = urlParams.get('code');
  const isConnected = code || getGithubCode() ? true : false;

  return (
    <div className={cx('wrapper')}>
      <div className={cx('description')}>
        {isConnected ? 'Login by Github successfully!' : "You're not login by Github yet!"}
      </div>
      <Link to="/">
        <Button type="primary" onClick={() => {}}>
          Back to Homebase
        </Button>
      </Link>
    </div>
  );
};

export default GithubLogin;
