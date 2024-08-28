import React from 'react';
import classNames from 'classnames/bind';

import { Button } from 'components/Button';
import { ReactComponent as GitICon } from 'assets/images/git-logo.svg';
import styles from './GithubConnect.scss';

const GithubConnect: React.FC = () => {
  const cx = classNames.bind(styles);

  return (
    <div className={cx('wrapper')}>
      <div>
        <Button type="fourth" onClick={() => {}}>
          Get the latest alpha and more
        </Button>
      </div>

      <div>
        <Button type="third" onClick={() => {}} icon={<GitICon />} style={{ paddingLeft: 14, paddingRight: 14 }}>
          Connect Github
        </Button>
      </div>
    </div>
  );
};

export default GithubConnect;
