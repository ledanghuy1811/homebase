import React, { useState } from 'react';
import classNames from 'classnames/bind';

import styles from './GithubConnect.scss';

import { Button } from 'components/Button';
import { ReactComponent as GitICon } from 'assets/images/git-logo.svg';
import ConnectedImg from 'assets/images/connected-img.png';
import DropdownIcon from 'assets/icons/nav-arrow-down.svg';

const GithubConnect: React.FC = () => {
  const cx = classNames.bind(styles);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [credit, setCredit] = useState<number>(152);

  return (
    <div className={cx('wrapper')}>
      <div>
        <Button type="fourth" onClick={() => {}}>
          Get the latest alpha and more
        </Button>
      </div>

      {isConnected ? (
        <div className={cx('connected-area')}>
          <div className={cx('connected-img')}>
            <img src={ConnectedImg} alt="Connected Img" />
          </div>

          <div className={cx('connected-content')}>
            <div className={cx('connected-info')}>
              <h1 className={cx('connected-info--name')}>hoangla16</h1>
              <h1 className={cx('connected-info--credit')}>{credit} credits</h1>
            </div>

            <img src={DropdownIcon} alt="dropdown icon" />
          </div>
        </div>
      ) : (
        <div className={cx('connected-btn')}>
          <Button
            type="third"
            onClick={() => {
              setIsConnected(!isConnected);
            }}
            icon={<GitICon />}
            style={{ paddingLeft: 14, paddingRight: 14 }}
          >
            Connect Github
          </Button>
        </div>
      )}
    </div>
  );
};

export default GithubConnect;
