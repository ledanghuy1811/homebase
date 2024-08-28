import React, { useState } from 'react';
import classNames from 'classnames/bind';
import HeadlessTippy from '@tippyjs/react/headless';

import styles from './GithubConnect.scss';
import 'tippy.js/dist/tippy.css'; // optional for styling

import { Button } from 'components/Button';
import { ReactComponent as GitICon } from 'assets/images/git-logo.svg';
import ConnectedImg from 'assets/images/connected-img.png';
import DropdownIcon from 'assets/icons/nav-arrow-down.svg';
import LogoutIcon from 'assets/icons/logout-git.svg';

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
        <HeadlessTippy
          interactive
          trigger="click"
          render={(attrs) => {
            const options: { name: string; icon?: string }[] = [
              {
                name: 'Manage your credits'
              },
              {
                name: 'Log out',
                icon: LogoutIcon
              }
            ];
            return (
              <div className={cx('connected-modal')}>
                {options.map((option, index) => (
                  <div key={index} className={cx('connected-modal-option')}>
                    <h1 className={cx('modal-option-name')}>{option.name}</h1>
                    {option.icon && <img src={option.icon} alt={`${option.name} icon`} />}
                  </div>
                ))}
              </div>
            );
          }}
        >
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
        </HeadlessTippy>
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
