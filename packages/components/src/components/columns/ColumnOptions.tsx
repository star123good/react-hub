import React from 'react'

import {
  cheapestPlanWithNotifications,
  Column,
  constants,
  getColumnOption,
} from '@devhub/core'
import { View } from 'react-native'
import { useDispatch } from 'react-redux'

import { useAppViewMode } from '../../hooks/use-app-view-mode'
import { useColumn } from '../../hooks/use-column'
import { useReduxState } from '../../hooks/use-redux-state'
import { Platform } from '../../libs/platform'
import * as actions from '../../redux/actions'
import * as selectors from '../../redux/selectors'
import { sharedStyles } from '../../styles/shared'
import { contentPadding, smallerTextSize } from '../../styles/variables'
import { Checkbox } from '../common/Checkbox'
import { IconButton } from '../common/IconButton'
import { Link } from '../common/Link'
import { Separator } from '../common/Separator'
import { Spacer } from '../common/Spacer'
import { useAppLayout } from '../context/LayoutContext'
import { keyboardShortcutsById } from '../modals/KeyboardShortcutsModal'
import { ThemedView } from '../themed/ThemedView'
import { sharedColumnOptionsStyles } from './options/shared'

export interface ColumnOptionsProps {
  close: () => void
  columnId: Column['id']
}

export type ColumnOptionCategory = 'badge'

export const ColumnOptions = React.memo(
  React.forwardRef<View, ColumnOptionsProps>((props, ref) => {
    const { close, columnId } = props

    const { appOrientation } = useAppLayout()
    const { appViewMode } = useAppViewMode()
    const { column, columnIndex, hasCrossedColumnsLimit } = useColumn(columnId)

    const dispatch = useDispatch()
    const columnsCount = useReduxState(selectors.columnCountSelector)
    const plan = useReduxState(selectors.currentUserPlanSelector)
    const notificationsLoadState = useReduxState(state =>
      column && column.type === 'notifications'
        ? selectors.notificationsState(state).loadingState
        : undefined,
    )

    if (!column) return null

    const enableAppIconUnreadIndicatorOption = getColumnOption(
      column,
      'enableAppIconUnreadIndicator',
      {
        Platform,
        plan,
      },
    )
    const enableInAppUnreadIndicatorOption = getColumnOption(
      column,
      'enableInAppUnreadIndicator',
      {
        Platform,
        plan,
      },
    )
    const enableDesktopPushNotificationsOption = getColumnOption(
      column,
      'enableDesktopPushNotifications',
      {
        Platform,
        plan,
      },
    )

    return (
      <ThemedView
        ref={ref}
        backgroundColor="backgroundColorDarker1"
        style={sharedStyles.fullWidth}
      >
        <Spacer height={contentPadding} />

        <Checkbox
          analyticsLabel="column_option_in_app_unread_indicator"
          checked={
            !hasCrossedColumnsLimit &&
            enableInAppUnreadIndicatorOption.hasAccess &&
            enableInAppUnreadIndicatorOption.value
          }
          containerStyle={
            sharedColumnOptionsStyles.fullWidthCheckboxContainerWithPadding
          }
          defaultValue
          disabled={
            hasCrossedColumnsLimit ||
            !enableInAppUnreadIndicatorOption.hasAccess
          }
          squareContainerStyle={
            sharedColumnOptionsStyles.checkboxSquareContainer
          }
          enableIndeterminateState={false}
          label={`Show unread indicator at ${
            appOrientation === 'portrait' ? 'bottom bar' : 'sidebar'
          }`}
          onChange={value => {
            dispatch(
              actions.setColumnOption({
                columnId,
                option: 'enableInAppUnreadIndicator',
                value,
              }),
            )
          }}
        />

        {Platform.OS === 'web' && (
          <Checkbox
            analyticsLabel="column_option_app_icon_unread_indicator"
            checked={
              !hasCrossedColumnsLimit &&
              enableAppIconUnreadIndicatorOption.hasAccess &&
              enableAppIconUnreadIndicatorOption.value
            }
            containerStyle={
              sharedColumnOptionsStyles.fullWidthCheckboxContainerWithPadding
            }
            defaultValue={column.type === 'notifications'}
            disabled={
              hasCrossedColumnsLimit ||
              !enableAppIconUnreadIndicatorOption.hasAccess
            }
            squareContainerStyle={
              sharedColumnOptionsStyles.checkboxSquareContainer
            }
            enableIndeterminateState={false}
            label={`Show unread counter on ${
              Platform.OS === 'web' && !Platform.isElectron
                ? 'page title'
                : 'app icon'
            }`}
            onChange={value => {
              dispatch(
                actions.setColumnOption({
                  columnId,
                  option: 'enableAppIconUnreadIndicator',
                  value,
                }),
              )
            }}
          />
        )}

        <View
          style={[
            sharedStyles.horizontal,
            sharedStyles.alignItemsCenter,
            sharedStyles.fullWidth,
          ]}
        >
          <Checkbox
            analyticsLabel="column_option_desktop_push_notification"
            checked={
              !hasCrossedColumnsLimit &&
              enableDesktopPushNotificationsOption.hasAccess &&
              enableDesktopPushNotificationsOption.value
            }
            containerStyle={
              sharedColumnOptionsStyles.fullWidthCheckboxContainerWithPadding
            }
            defaultValue={column.type === 'notifications'}
            disabled={
              hasCrossedColumnsLimit ||
              !enableDesktopPushNotificationsOption.hasAccess
            }
            squareContainerStyle={
              sharedColumnOptionsStyles.checkboxSquareContainer
            }
            enableIndeterminateState={false}
            label="Desktop push notifications"
            onChange={value => {
              dispatch(
                actions.setColumnOption({
                  columnId,
                  option: 'enableDesktopPushNotifications',
                  value,
                }),
              )
            }}
          />

          {hasCrossedColumnsLimit ? null : !enableDesktopPushNotificationsOption.platformSupports ? (
            <Link
              analyticsLabel="column_option_desktop_push_notifications_download_link"
              enableForegroundHover
              openOnNewTab
              href={`${constants.LANDING_BASE_URL}/download`}
              style={{ marginRight: contentPadding / 2 }}
              textProps={{
                color: 'foregroundColorMuted65',
                style: { fontSize: smallerTextSize },
              }}
            >
              DOWNLOAD
            </Link>
          ) : !enableDesktopPushNotificationsOption.hasAccess &&
            cheapestPlanWithNotifications ? (
            <Link
              analyticsLabel="column_option_desktop_push_notifications_pro_link"
              enableForegroundHover
              onPress={() => {
                dispatch(
                  actions.pushModal({
                    name: 'PRICING',
                    params: cheapestPlanWithNotifications && {
                      highlightFeature: 'enablePushNotifications',
                      // initialSelectedPlanId: cheapestPlanWithNotifications.id,
                    },
                  }),
                )
              }}
              style={{ marginRight: contentPadding / 2 }}
              textProps={{
                color: 'foregroundColorMuted65',
                style: { fontSize: smallerTextSize },
              }}
            >
              UNLOCK
            </Link>
          ) : enableDesktopPushNotificationsOption.hasAccess === 'trial' &&
            (plan && plan.amount > 0) ? (
            <Link
              analyticsLabel="column_option_desktop_push_notifications_on_trial_link"
              enableForegroundHover
              onPress={() => {
                dispatch(
                  actions.pushModal({
                    name: 'PRICING',
                    params: cheapestPlanWithNotifications && {
                      highlightFeature: 'enablePushNotifications',
                      initialSelectedPlanId: plan.id,
                    },
                  }),
                )
              }}
              style={{ marginRight: contentPadding / 2 }}
              textProps={{
                color: 'foregroundColorMuted65',
                style: { fontSize: smallerTextSize },
              }}
            >
              ON TRIAL
            </Link>
          ) : null}
        </View>

        {(Platform.realOS === 'ios' || Platform.realOS === 'android') && (
          <View
            style={[
              sharedStyles.horizontal,
              sharedStyles.alignItemsCenter,
              sharedStyles.fullWidth,
            ]}
          >
            <Checkbox
              analyticsLabel="column_option_mobile_push_notification"
              checked={false}
              containerStyle={
                sharedColumnOptionsStyles.fullWidthCheckboxContainerWithPadding
              }
              defaultValue={false}
              disabled
              enableIndeterminateState={false}
              label="Mobile push notifications"
              onChange={undefined}
              squareContainerStyle={
                sharedColumnOptionsStyles.checkboxSquareContainer
              }
            />

            <Link
              analyticsLabel="column_option_mobile_push_notifications_soon_link"
              enableForegroundHover
              openOnNewTab
              href="https://github.com/devhubapp/devhub/issues/51"
              style={{ marginRight: contentPadding / 2 }}
              textProps={{
                color: 'foregroundColorMuted65',
                style: { fontSize: smallerTextSize },
              }}
            >
              SOON
            </Link>
          </View>
        )}

        <Spacer height={contentPadding / 2} />

        {!!(
          enableDesktopPushNotificationsOption.platformSupports &&
          !enableDesktopPushNotificationsOption.hasAccess &&
          cheapestPlanWithNotifications &&
          cheapestPlanWithNotifications.amount
        ) ? (
          <>
            {/* <Link
            analyticsLabel="column_option_desktop_unlock_more_link"
            enableForegroundHover
            onPress={() => {
              dispatch(
                actions.pushModal({
                  name: 'PRICING',
                  params: cheapestPlanWithNotifications && {
                    highlightFeature: 'enablePushNotifications',
                    // initialSelectedPlanId: cheapestPlanWithNotifications.id,
                  },
                }),
              )
            }}
            textProps={{
              color: 'foregroundColorMuted65',
              style: [
                sharedStyles.center,
                sharedStyles.marginVerticalHalf,
                sharedStyles.marginHorizontal,
                sharedStyles.textCenter,
                { fontSize: smallerTextSize },
              ],
            }}
          >
            {`Unlock desktop notifications for ${formatPrice(
              cheapestPlanWithNotifications.amount,
              cheapestPlanWithNotifications.currency,
            )}/${cheapestPlanWithNotifications.interval}`.toUpperCase()}
          </Link> */}

            <Spacer height={contentPadding / 2} />
          </>
        ) : (
          <Spacer height={contentPadding / 2} />
        )}

        <View
          style={[sharedStyles.horizontal, sharedStyles.paddingHorizontalHalf]}
        >
          <IconButton
            key="column-options-button-move-column-left"
            analyticsLabel="move_column_left"
            disabled={
              columnIndex === 0 ||
              !!(plan && columnIndex + 1 > plan.featureFlags.columnsLimit)
            }
            name="chevron-left"
            onPress={() =>
              dispatch(
                actions.moveColumn({
                  animated: appViewMode === 'multi-column',
                  columnId,
                  columnIndex: columnIndex - 1,
                  highlight:
                    appViewMode === 'multi-column' || columnIndex === 0,
                  scrollTo: true,
                }),
              )
            }
            style={{ opacity: columnIndex === 0 ? 0.5 : 1 }}
            tooltip={`Move column left (${keyboardShortcutsById.moveColumnLeft.keys[0]})`}
          />

          <IconButton
            key="column-options-button-move-column-right"
            analyticsLabel="move_column_right"
            disabled={
              columnIndex + 1 >= columnsCount ||
              columnIndex + 1 >= constants.COLUMNS_LIMIT ||
              !!(plan && columnIndex + 1 > plan.featureFlags.columnsLimit - 1)
            }
            name="chevron-right"
            onPress={() =>
              dispatch(
                actions.moveColumn({
                  animated: appViewMode === 'multi-column',
                  columnId,
                  columnIndex: columnIndex + 1,
                  highlight:
                    appViewMode === 'multi-column' ||
                    columnIndex === columnsCount - 1,
                  scrollTo: true,
                }),
              )
            }
            style={{
              opacity: columnIndex === columnsCount - 1 ? 0.5 : 1,
            }}
            tooltip={`Move column right (${keyboardShortcutsById.moveColumnRight.keys[0]})`}
          />

          {column.type === 'notifications' && (
            <IconButton
              key="column-options-button-force-refresh"
              analyticsLabel="force_refetch_all"
              loading={notificationsLoadState === 'loading-all'}
              name="sync"
              onPress={() => {
                if (close) close()

                setTimeout(
                  () => {
                    if (notificationsLoadState === 'loading-all') {
                      dispatch(actions.fetchNotificationsAbort())
                    } else {
                      dispatch(
                        actions.fetchNotificationsRequest({
                          fetchAllPages: true,
                          preventRefetchingExistingPayloads: true,
                        }),
                      )
                    }
                  },
                  close ? 500 : 0,
                )
              }}
              tooltip="Sync unread status with GitHub."
            />
          )}

          <Spacer flex={1} />

          <IconButton
            key="column-options-button-remove-column"
            analyticsLabel="remove_column"
            name="trashcan"
            onPress={() =>
              dispatch(actions.deleteColumn({ columnId, columnIndex }))
            }
            tooltip="Remove column"
            type="danger"
          />
        </View>

        <Spacer height={contentPadding} />

        <Separator horizontal />
      </ThemedView>
    )
  }),
)

ColumnOptions.displayName = 'ColumnOptions'
