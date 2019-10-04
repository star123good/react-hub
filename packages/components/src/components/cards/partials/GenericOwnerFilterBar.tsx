import _ from 'lodash'
import React, { useCallback, useEffect, useRef } from 'react'
import { View } from 'react-native'

import { useDynamicRef } from '../../../hooks/use-dynamic-ref'
import { OneList, OneListProps } from '../../../libs/one-list'
import { Platform } from '../../../libs/platform'
import { sharedStyles } from '../../../styles/shared'
import {
  avatarSize,
  contentPadding,
  smallerTextSize,
} from '../../../styles/variables'
import { KeyboardKeyIsPressed } from '../../AppKeyboardShortcuts'
import { getColumnHeaderThemeColors } from '../../columns/ColumnHeader'
import { Avatar } from '../../common/Avatar'
import { Separator, separatorSize } from '../../common/Separator'
import { Spacer } from '../../common/Spacer'
import { UnreadDot } from '../../common/UnreadDot'
import { ThemedText } from '../../themed/ThemedText'
import { ThemedTouchableOpacity } from '../../themed/ThemedTouchableOpacity'
import { ThemedView } from '../../themed/ThemedView'
import { sizes as cardSizes } from '.././BaseCard.shared'

export interface OwnerItemT {
  avatarURL: string
  hasUnread: boolean
  index: number
  owner: string
  value: boolean | null
}
export interface GenericOwnerFilterBarProps {
  data: OwnerItemT[]
  onItemPress: (
    item: OwnerItemT,
    action: 'set' | 'replace',
    value: boolean | null,
  ) => void
}

const ownerTextFontSize = smallerTextSize // 12
const ownerTextLineHeight = smallerTextSize + 4 // 16
const itemWidth = avatarSize + 2 * contentPadding // 72
const itemContentHeight = avatarSize + contentPadding / 2 + ownerTextLineHeight // 64
const itemContentWithPaddingHeight =
  itemContentHeight + 2 * cardSizes.cardPadding // 85,33
export const cardsGenericOwnerFilterBarTotalHeight =
  itemContentWithPaddingHeight + separatorSize // 87,33

function getItemKey(item: OwnerItemT, _index: number) {
  return `owner-filter-bar-${item.owner}`
}

function getItemSize() {
  return itemWidth
}

export const GenericOwnerFilterBar = React.memo(
  (props: GenericOwnerFilterBarProps) => {
    const { data, onItemPress: _onItemPress } = props

    const listRef = useRef<typeof OneList>(null)

    const stringifiedData = JSON.stringify(data)

    const firstSelectedItem = data.find(item => item.value)
    useEffect(() => {
      if (
        listRef.current &&
        firstSelectedItem &&
        firstSelectedItem.index >= 0
      ) {
        listRef.current.scrollToIndex(firstSelectedItem.index, {
          animated: true,
          alignment: 'center',
        })
      }
    }, [
      listRef.current,
      firstSelectedItem && firstSelectedItem.index,
      stringifiedData,
    ])

    const forcedValueCountRef = useDynamicRef(
      data.reduce((total, item) => {
        return total + (typeof item.value === 'boolean' ? 1 : 0)
      }, 0),
    )

    const _onItemPressRef = useDynamicRef(_onItemPress)
    const onItemPress = useCallback((item: OwnerItemT) => {
      if (KeyboardKeyIsPressed.alt) {
        _onItemPressRef.current(
          item,
          'set',
          item.value === false ? null : false,
        )
        return
      }

      if (KeyboardKeyIsPressed.meta || KeyboardKeyIsPressed.shift) {
        _onItemPressRef.current(item, 'set', item.value ? null : true)
        return
      }

      if (item.value === false) {
        _onItemPressRef.current(item, 'set', null)
        return
      }

      _onItemPressRef.current(
        item,
        'replace',
        item.value && forcedValueCountRef.current === 1 ? null : true,
      )

      if (listRef.current && item.index >= 0) {
        listRef.current.scrollToIndex(item.index, {
          animated: true,
          alignment: 'center',
        })
      }
    }, [])

    const renderItem = useCallback<OneListProps<OwnerItemT>['renderItem']>(
      ({ item }) => {
        return (
          <ThemedTouchableOpacity
            backgroundColor={
              item.value
                ? getColumnHeaderThemeColors().selected
                : item.value === false
                ? 'backgroundColorTintedRed'
                : getColumnHeaderThemeColors().normal
            }
            onPress={() => {
              onItemPress(item)
            }}
            onLongPress={() => {
              if (Platform.supportsTouch) {
                KeyboardKeyIsPressed.meta = true
                onItemPress(item)
              }
            }}
            onPressOut={() => {
              if (Platform.supportsTouch) {
                KeyboardKeyIsPressed.meta = false
              }
            }}
            style={[
              {
                width: itemWidth - 2,
                height: itemContentWithPaddingHeight,
                marginHorizontal: 1,
                paddingVertical: cardSizes.cardPadding,
              },
              item.value === false && sharedStyles.muted,
            ]}
          >
            <View
              style={[
                sharedStyles.center,
                sharedStyles.fullWidth,
                sharedStyles.fullHeight,
              ]}
            >
              <View
                style={[
                  sharedStyles.relative,
                  { width: avatarSize, height: avatarSize },
                ]}
              >
                <Avatar
                  avatarUrl={item.avatarURL}
                  disableLink
                  size={avatarSize}
                  tooltip=""
                  username={item.owner}
                />
                {!!item.hasUnread && (
                  <UnreadDot
                    style={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                    }}
                  />
                )}
              </View>

              <Spacer height={contentPadding / 2} />
              <ThemedText
                color="foregroundColorMuted65"
                numberOfLines={1}
                style={[
                  sharedStyles.textCenter,
                  {
                    paddingHorizontal: contentPadding / 2,
                    lineHeight: ownerTextLineHeight,
                    fontSize: ownerTextFontSize,
                  },
                ]}
              >
                {item.owner}
              </ThemedText>
            </View>
          </ThemedTouchableOpacity>
        )
      },
      [],
    )

    if (!data.length) return null

    return (
      <ThemedView
        style={[
          sharedStyles.flexGrow,
          { height: cardsGenericOwnerFilterBarTotalHeight },
        ]}
      >
        <View
          style={[
            sharedStyles.flexGrow,
            { height: itemContentWithPaddingHeight },
          ]}
          onLayout={() => {
            if (
              listRef.current &&
              firstSelectedItem &&
              firstSelectedItem.index >= 0
            ) {
              listRef.current.scrollToIndex(firstSelectedItem.index, {
                animated: true,
                alignment: 'center',
              })
            }
          }}
        >
          <OneList
            ref={listRef}
            data={data}
            estimatedItemSize={itemWidth}
            getItemKey={getItemKey}
            getItemSize={getItemSize}
            horizontal
            overscanCount={1}
            renderItem={renderItem}
          />
        </View>

        <Separator horizontal />
      </ThemedView>
    )
  },
)

GenericOwnerFilterBar.displayName = 'GenericOwnerFilterBar'
