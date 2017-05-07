// @flow
/* eslint-disable react-native/no-color-literals */

import React, { PureComponent } from 'react'
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'

import Modal from '../modal'

type ActionSheetProps = {
  containerPadding: ?number,
  containerStyle: ?any,
  buttonContainerStyle: ?any,
  buttonTextStyle: ?any, // eslint-disable-line react/no-unused-prop-types
  buttonsContainerStyle: ?any,
  radius: ?number,
  tintColor: ?string,
  title: ?string,
  titleContainerStyle: ?any,
  titleTextStyle: ?any,
  useNativeDriver: ?boolean,
}

type ActionSheetState = {
  buttons: Array<{
    text: string,
    onPress: Function,
    style?: 'cancel' | 'destructive',
  }>,
  isAnimating: boolean,
  isVisible: boolean,
  overlayOpacity: any,
  translateY: any,
  title: '',
}

export const ANIMATION_TIME_HIDE = 200
export const ANIMATION_TIME_SHOW = 400
export const CANCEL_MARGIN = 6
export const DANGER_COLOR = '#ff3b30'
export const MAX_HEIGHT = Dimensions.get('window').height * 0.7
export const OPTION_HEIGHT = 50
export const OPTION_MARGIN = StyleSheet.hairlineWidth
export const OVERLAY_OPACITY = 0.4
export const TITLE_HEIGHT = 40
export const TITLE_MARGIN = OPTION_MARGIN

export const DEFAULT_TINT_COLOR = '#007aff'

const styles = StyleSheet.create({
  full: {
    flex: 1,
  },
  container: {},
  overlayContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  container__bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  buttonsContainer: {},
  buttonButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: OPTION_HEIGHT,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  buttonText: {
    fontSize: 18,
  },
  titleContainer: {
    height: TITLE_HEIGHT,
    marginBottom: TITLE_MARGIN,
  },
  titleText: {
    fontSize: 12,
    textAlign: 'center',
    color: 'gray',
  },
  overlay: {
    backgroundColor: '#000000',
    opacity: 0,
  },
})

// TODO: Fix Animated for web
const animatedEnabled = Platform.OS !== 'web'
const ViewOrAnimatedView = Platform.OS === 'web' ? View : Animated.View

export default class ActionSheet extends PureComponent {
  static defaultProps = {
    containerPadding: 10,
    radius: 10,
    tintColor: DEFAULT_TINT_COLOR,
    useNativeDriver: Platform.OS === 'ios' || Platform.OS === 'android',
  }

  static allActionSheetRefs = []

  constructor(props) {
    super(props)

    this.state = {
      buttons: [],
      height: 0,
      isAnimating: false,
      isVisible: false,
      overlayOpacity: animatedEnabled ? new Animated.Value(0) : OVERLAY_OPACITY,
      title: '',
      translateY: animatedEnabled ? new Animated.Value(0) : 0,
    }
  }

  state: ActionSheetState

  componentDidMount() {
    ActionSheet.allActionSheetRefs.push(this)
  }

  componentWillUnmount() {
    const index = ActionSheet.allActionSheetRefs.indexOf(this)
    if (index >= 0) ActionSheet.allActionSheetRefs.splice(index, 1)
  }

  animate = (toVisible, buttons, options, callback) => {
    if (this.state.isVisible === toVisible) {
      return
    }

    const duration = toVisible ? ANIMATION_TIME_SHOW : ANIMATION_TIME_HIDE
    const easing = Easing.out(Easing.cubic)
    const overlayOpacity = toVisible ? OVERLAY_OPACITY : 0
    const translateY = toVisible ? 0 : this.state.height
    const { useNativeDriver } = this.props

    this.setState({ isAnimating: true, isVisible: toVisible }, () => {
      Animated.parallel([
        Animated.timing(this.state.translateY, {
          toValue: translateY,
          easing,
          duration,
          useNativeDriver,
        }),
        Animated.timing(this.state.overlayOpacity, {
          toValue: overlayOpacity,
          easing,
          duration,
          useNativeDriver,
        }),
      ]).start(result => {
        if (result.finished) {
          this.setState({ isAnimating: false }, () => {
            if (typeof callback === 'function') {
              callback()
            }
          })
        }
      })
    })
  }

  calculateHeight = (buttons, { containerPadding, title } = {}) =>
    (title ? TITLE_HEIGHT + TITLE_MARGIN : 0) +
    (buttons || []).length * (OPTION_HEIGHT + OPTION_MARGIN) +
    CANCEL_MARGIN +
    2 * (containerPadding || 0)

  hide = (options = {}, callback) => {
    const { animated = animatedEnabled } = options

    if (animated) {
      this.animate(false, null, options, callback)
    } else {
      this.setState({ isVisible: false })
      if (callback) callback()
    }
  }

  show = (buttons, options = {}, callback) => {
    const { animated = animatedEnabled } = options

    ActionSheet.allActionSheetRefs.forEach(ref => {
      if (ref !== this) ref.hide()
    })

    if (animated) {
      const height = this.calculateHeight(buttons, options)
      this.setState(
        { height, buttons, translateY: new Animated.Value(height) },
        () => {
          this.animate(true, buttons, options, callback)
        },
      )
    } else {
      this.setState({ buttons, isVisible: true })
      if (callback) callback()
    }
  }

  toggle = (buttons, options = {}, callback) =>
    this.state.isVisible
      ? this.hide(options, callback)
      : this.show(buttons, options, callback)

  select = button => {
    this.hide({ animated: animatedEnabled }, () => {
      setTimeout(() => {
        button.onPress()
      }, 50)
    })
  }

  props: ActionSheetProps

  renderCancelButton({ style, textStyle, ...options } = {}) {
    const { buttons } = this.state
    const { buttonContainerStyle, radius, tintColor } = {
      ...this.props,
      ...options,
    }

    const cancelButton = (buttons.filter(
      button => button.style === 'cancel',
    ) || [])[0]

    if (!cancelButton) {
      return null
    }

    return this.renderButton(cancelButton, {
      color: tintColor,
      style: [
        buttonContainerStyle,
        { marginTop: CANCEL_MARGIN, borderRadius: radius },
        style,
      ],
      textStyle: [{ fontWeight: '600' }, textStyle],
    })
  }

  renderButton = (button, { color, style, textStyle, ...options } = {}) => {
    const { buttons } = this.state
    const { buttonContainerStyle, buttonTextStyle } = {
      ...this.props,
      ...options,
    }
    const isLastButton = buttons[button] === buttons.length - 1

    return (
      <TouchableOpacity
        key={button.text}
        activeOpacity={0.9}
        style={[
          styles.buttonButton,
          { marginBottom: isLastButton ? 0 : OPTION_MARGIN },
          buttonContainerStyle,
          style,
        ]}
        onPress={() => this.select(button)}
      >
        {React.isValidElement(button.text)
          ? button.text
          : <Text
              style={[styles.buttonText, { color }, buttonTextStyle, textStyle]}
              numberOfLines={1}
            >
              {button.text}
            </Text>}
      </TouchableOpacity>
    )
  }

  renderButtons = () => {
    const { buttons } = this.state
    const { radius, tintColor, title } = this.props

    const mainButtons = buttons.filter(button => button.style !== 'cancel')
    const lastIndex = mainButtons.length - 1

    return mainButtons.map((button, index) => {
      const color = button.style === 'destructive' ? DANGER_COLOR : tintColor

      return this.renderButton(button, {
        color,
        style: {
          borderTopLeftRadius: index === 0 || !title ? radius : 0,
          borderTopRightRadius: index === 0 || !title ? radius : 0,
          borderBottomLeftRadius: index === lastIndex ? radius : 0,
          borderBottomRightRadius: index === lastIndex ? radius : 0,
        },
      })
    })
  }

  renderTitle({ style, textStyle } = {}) {
    const { title } = this.state
    const {
      buttonContainerStyle,
      radius,
      titleContainerStyle,
      titleTextStyle,
    } = this.props

    if (!title) {
      return null
    }

    return (
      <View
        style={[
          styles.buttonButton,
          styles.titleContainer,
          {
            borderTopLeftRadius: radius,
            borderTopRightRadius: radius,
          },
          buttonContainerStyle,
          titleContainerStyle,
          style,
        ]}
      >
        {React.isValidElement(title)
          ? title
          : <Text
              style={[styles.titleText, titleTextStyle, textStyle]}
              numberOfLines={1}
            >
              {title}
            </Text>}
      </View>
    )
  }

  render() {
    const {
      containerPadding,
      containerStyle,
      buttonsContainerStyle,
      radius,
    } = this.props
    const {
      height,
      isAnimating,
      isVisible,
      overlayOpacity,
      translateY,
    } = this.state

    if (!(isVisible || isAnimating)) return null

    return (
      <Modal
        animationType="none"
        onRequestClose={() => this.hide()}
        transparent
        visible={isVisible || isAnimating}
      >
        <TouchableWithoutFeedback
          style={styles.overlayContainer}
          onPress={() => this.hide()}
        >
          <ViewOrAnimatedView
            style={[styles.full, styles.overlay, { opacity: overlayOpacity }]}
          />
        </TouchableWithoutFeedback>
        <ViewOrAnimatedView
          style={[
            styles.container,
            styles.container__bottom,
            containerStyle,
            {
              padding: containerPadding,
              transform: [{ translateY }],
            },
          ]}
          onLayout={({ nativeEvent: { layout } }) => {
            if (layout.height > 0) this.setState({ height: layout.height })
          }}
        >
          <View
            style={[
              styles.buttonsContainer,
              { backgroundColor: '#ededed', borderRadius: radius },
              buttonsContainerStyle,
            ]}
          >
            {this.renderTitle()}
            <ScrollView scrollEnabled={height > MAX_HEIGHT}>
              {this.renderButtons()}
            </ScrollView>
          </View>
          {this.renderCancelButton()}
        </ViewOrAnimatedView>
      </Modal>
    )
  }
}
