// @flow

import React from 'react';
import Icon from 'react-native-vector-icons/Octicons';

import Themable from '../hoc/Themable';
import TransparentTextOverlay from '../TransparentTextOverlay';
import UserAvatar from './_UserAvatar';

import {
  avatarWidth,
  ContentRow,
  HighlightContainerRow1,
  LeftColumn,
  MainColumn,
  RepositoryContentContainer,
  Text,
} from './';

import { contentPadding, radius } from '../../styles/variables';
import type { User, ThemeObject } from '../../utils/types';

@Themable
export default class extends React.PureComponent {
  props: {
    user: User,
    theme?: ThemeObject,
  };

  render() {
    const { user, theme } = this.props;

    if (!user) return null;

    const _login = (user.get('login') || '').replace(/\r\n/g, ' ').replace('  ', ' ').trim();
    if (!_login) return null;

    return (
      <ContentRow narrow>
        <LeftColumn>
          <UserAvatar url={user.get('avatar_url')} size={avatarWidth / 2} />
        </LeftColumn>

        <MainColumn>
          <HighlightContainerRow1>
            <TransparentTextOverlay
              color={theme.base01}
              size={contentPadding}
              from="right"
              radius={radius}
            >
              <RepositoryContentContainer>
                <Text numberOfLines={1}>
                  <Icon name="person" />&nbsp;
                  {_login}
                </Text>
              </RepositoryContentContainer>
            </TransparentTextOverlay>
          </HighlightContainerRow1>
        </MainColumn>
      </ContentRow>
    );
  }
}
