//
//  Banner.swift
//  Ghostery
//
//  Banner at the bottom of the sections, showing its items one after
//  another.
//

import SwiftUI
#if os(iOS)
import UIKit
#endif

fileprivate enum Constants {
  static let textSpacing: CGFloat = 4
  static let cornerRadius: CGFloat = 12
  static let shadowRadius: CGFloat = 6
  static let shadowY: CGFloat = 4

  // After the texts, as on the Mac
  static let buttonWidth: CGFloat = 160
  // Below the texts, as on iPhones and iPads
  static let buttonTopSpacing: CGFloat = 16

  static let iconSize: CGFloat = 56
  static let iconCornerRadius: CGFloat = 8

  static let itemDuration: TimeInterval = 5
  static let transitionDuration: Double = 0.4
  // No farther than the padding, so items never leave the banner
  static let transitionOffset: CGFloat = 12

  #if os(iOS)
  // Where the item would stop, moving on for this time at the speed of the
  // finger, from where it's let go
  static let swipeMomentum: TimeInterval = 0.2
  // Farther than this, the swipe shows the next or the previous item
  static let swipeDistance: CGFloat = 80
  static let swipeReturnDuration: Double = 0.3
  // Of the slide which goes on after a swipe, starting at the speed of
  // the finger, up to this many times the rest of the way per second
  static let swipeSlideDuration: Double = 0.5
  static let swipeSlideMaxSpeed: Double = 8
  #endif

  static let paginationSpacing: CGFloat = 4
  static let paginationDotSize: CGFloat = 8
  static let paginationCurrentWidth: CGFloat = 32
  // The dots can be clicked a bit above and below them, as they're small
  static let paginationHitPadding: CGFloat = 4
  // Smooth enough for the fill, without redrawing at the full rate of the display
  static let paginationFrameInterval: TimeInterval = 1.0 / 30

  static let borderLineWidth: CGFloat = 1
}

fileprivate enum Strings {
  // You can translate your strings here
  static let otherDeviceTitle = String(localized: "Want to use this app on another device?")
  #if os(macOS)
  static let otherDeviceDescription = String(localized: "Scan the QR code to install the app on your phone or tablet.")
  #else
  static let otherDeviceDescription = String(localized: "Scan the QR code to install the app on your tablet or desktop.")
  #endif
  static let scanQRCode = String(localized: "Scan QR Code", comment: "Button opening the dialog with the QR code")

  static func page(_ number: Int, of count: Int) -> String {
    String(localized: "Page \(number) of \(count)", comment: "Dot of the pagination below the banner, for assistive technologies")
  }
}

/// Sizes of the banner, which differ between the Mac, iPhones and iPads
fileprivate struct BannerLayout {
  /// Around the banner
  var margins: CGFloat
  /// Of the banner, which is otherwise as tall as its current item
  var minHeight: CGFloat?
  var padding: CGFloat
  /// Between the image of an item and its texts
  var spacing: CGFloat
  var qrCodeSize: CGFloat
  /// Lines up the QR code with the title, when the button is below the texts
  var qrCodeTopPadding: CGFloat
  var titleStyle: AppTextStyle
  var descriptionStyle: AppTextStyle
  /// Whether the button of the item about other devices is below its texts,
  /// rather than after them
  var isButtonBelowTexts: Bool
  var buttonSize: AppButtonStyle.Size
  /// Around the title of the button, which follows its icon
  var buttonTitlePadding: (leading: CGFloat, trailing: CGFloat)
  var paginationTopPadding: CGFloat

  #if os(macOS)
  static let mac = BannerLayout(
    margins: 20,
    // As tall as the notifications, so the banner keeps its height when its
    // items change
    minHeight: 80,
    padding: 12,
    spacing: 12,
    qrCodeSize: 48,
    qrCodeTopPadding: 0,
    titleStyle: .labelL,
    descriptionStyle: .bodyS,
    isButtonBelowTexts: false,
    buttonSize: .regular,
    buttonTitlePadding: (leading: 8, trailing: 4),
    paginationTopPadding: 8
  )
  #else
  // Within the margins of the section, and as tall as the current item, as the
  // one about other devices is taller than the notifications
  static let phone = BannerLayout(
    margins: 0,
    minHeight: nil,
    padding: 12,
    spacing: 12,
    qrCodeSize: 48,
    qrCodeTopPadding: 4,
    titleStyle: .labelM,
    descriptionStyle: .bodyS,
    isButtonBelowTexts: true,
    buttonSize: .small,
    buttonTitlePadding: (leading: 4, trailing: 4),
    paginationTopPadding: 8
  )
  static let tablet = BannerLayout(
    margins: 0,
    minHeight: nil,
    padding: 24,
    spacing: 20,
    qrCodeSize: 64,
    qrCodeTopPadding: 0,
    titleStyle: .headlineS,
    descriptionStyle: .bodyL,
    isButtonBelowTexts: true,
    buttonSize: .large,
    buttonTitlePadding: (leading: 8, trailing: 8),
    paginationTopPadding: 12
  )
  #endif
}

/// Item shown by the banner
enum BannerItem: Identifiable {
  /// Using the app on other devices
  case otherDevice
  case notification(BannerNotification)

  var id: String {
    switch self {
    case .otherDevice: return "other-device"
    case .notification(let notification): return notification.id
    }
  }
}

struct BannerNotification: Identifiable {
  let id: String
  let icon: String
  let text: String
  let actionTitle: String
  let action: MainAction
}

fileprivate enum URLs {
  // Ratings and reviews of the app in the App Store app
  #if os(macOS)
  static let review = URL(string: "macappstores://apps.apple.com/app/id6504861501?action=write-review")!
  #else
  static let review = URL(string: "itms-apps://apps.apple.com/app/id6504861501?action=write-review")!
  #endif
}

// Shown to every user, after the invitation to launch at login on the Mac
fileprivate let bannerItems: [BannerItem] = [
  .otherDevice,
  .notification(BannerNotification(
    id: "review",
    icon: Icons.bannerReview,
    text: String(localized: "Enjoying Ghostery?"),
    actionTitle: String(localized: "Rate it on App Store"),
    action: .open(URLs.review)
  )),
  .notification(BannerNotification(
    id: "help",
    icon: Icons.bannerHelp,
    text: String(localized: "Having trouble using Ghostery?"),
    actionTitle: String(localized: "Get Help", comment: "Opens the dialog with the ways to get help"),
    action: .showDialog(.support)
  )),
]

/// Banner showing its items one after another, with their pagination, whose
/// dots show their items when clicked. On iPhones and iPads, the items slide
/// over as pages, which swipes move. The current item stays while the user
/// points at the banner, has it focused or swipes it, and while a dialog
/// covers it.
struct Banner: View {
  #if os(macOS)
  private let settings = AppSettings.shared
  #else
  @Environment(\.horizontalSizeClass) private var horizontalSizeClass
  #endif

  private var items: [BannerItem] {
    #if os(macOS)
    (settings.invitesToLaunchAtLogin ? [launchAtLoginItem] : []) + bannerItems
    #else
    bannerItems
    #endif
  }

  #if os(macOS)
  // Shown while the app doesn't launch at login
  private var launchAtLoginItem: BannerItem {
    .notification(BannerNotification(
      id: "launch-at-login",
      icon: Icons.bannerLaunch,
      text: String(localized: "Want Ghostery to start automatically when you log in?"),
      actionTitle: String(localized: "Launch at startup", comment: "Turns on the setting opening the app when the user logs in"),
      action: .perform {
        settings.setLaunchesAtLogin(true)
        // The item is removed, so the next one takes its place
        withAnimation(.easeInOut(duration: Constants.transitionDuration)) {
          state.index = 0
          state.clock.restart()
        }
      }
    ))
  }
  #endif

  private var layout: BannerLayout {
    #if os(macOS)
    .mac
    #else
    horizontalSizeClass == .regular ? .tablet : .phone
    #endif
  }

  // Shared by the banners of all sections, so the banner keeps its item
  // and countdown when the section changes
  private let state = BannerState.shared

  @State private var isHovered = false
  #if os(iOS)
  // Of the item, or the pages, which follow the finger
  @State private var swipeOffset: CGFloat = 0
  @State private var isSwiping = false
  @State private var pageWidth: CGFloat = 0
  @AccessibilityFocusState private var accessibilityFocusedPage: Int?
  #endif
  // Whether the items change towards the previous one, so the transition
  // goes the other way
  @State private var isBackward = false
  @FocusState private var isFocused: Bool
  @AccessibilityFocusState private var isAccessibilityFocused: Bool
  @Environment(\.accessibilityReduceMotion) private var reduceMotion
  @Environment(\.performAction) private var performAction
  // Disabled while a dialog covers it
  @Environment(\.isEnabled) private var isEnabled

  private var isPaused: Bool {
    #if os(iOS)
    isHovered || isFocused || isAccessibilityFocused || accessibilityFocusedPage != nil || !isEnabled || isSwiping
    #else
    isHovered || isFocused || isAccessibilityFocused || !isEnabled
    #endif
  }

  var body: some View {
    let shape = RoundedRectangle(cornerRadius: Constants.cornerRadius)
    let layout = self.layout

    VStack(spacing: 0) {
      Group {
        #if os(iOS)
        if reduceMotion {
          currentItem(layout: layout)
        } else {
          pages(layout: layout)
        }
        #else
        currentItem(layout: layout)
        #endif
      }
      .frame(maxWidth: .infinity, minHeight: layout.minHeight)
      #if os(iOS)
      // The item being swiped doesn't leave the banner
      .clipShape(shape)
      .gesture(HorizontalPanGesture(onChanged: swipe(by:), onEnded: endSwipe(translation:velocity:)))
      #endif
      .background(
        shape
          .fill(Colors.bgPrimary)
          .shadow(color: Colors.shadowCard, radius: Constants.shadowRadius, y: Constants.shadowY)
      )
      .overlay(shape.strokeBorder(Colors.borderPrimary, lineWidth: Constants.borderLineWidth))

      if items.count > 1 {
        pagination
          .padding(.top, layout.paginationTopPadding)
      }
    }
    .onHover { isHovered = $0 }
    // Focus on the item, or on the dots of the pagination
    .focused($isFocused)
    .padding(layout.margins)
    .onChange(of: isPaused) {
      if isPaused {
        state.clock.pause()
      } else {
        state.clock.resume()
      }
    }
    // Later changes go forward again, once the transition of a swipe back
    // has its direction
    .onChange(of: state.index) { isBackward = false }
    // Leaves the clock running for the banner of the next section
    .onDisappear {
      if isPaused {
        state.clock.resume()
      }
    }
    // Moves to the next item once the current one was shown long enough.
    // It restarts with every change of the clock, so it waits only while
    // the clock runs.
    .task(id: state.clock) {
      guard state.clock.isRunning, items.count > 1 else { return }
      try? await Task.sleep(for: .seconds(max(Constants.itemDuration - state.clock.elapsed(), 0)))
      guard !Task.isCancelled else { return }
      showNext()
    }
  }

  // The current item, which the next one replaces with the transition
  private func currentItem(layout: BannerLayout) -> some View {
    ZStack {
      if items.indices.contains(state.index) {
        itemView(items[state.index], layout: layout)
          #if os(iOS)
          .offset(x: swipeOffset)
          #endif
          .accessibilityFocused($isAccessibilityFocused)
          .id(items[state.index].id)
          .transition(transition)
      }
    }
  }

  #if os(iOS)
  // The current item between the previous and the next ones, which follow
  // the swipes, and slide over when the item changes. The pages are
  // numbered on around the items, so the ones next to the current page are
  // always on its sides.
  @ViewBuilder
  private func pages(layout: BannerLayout) -> some View {
    if !items.isEmpty {
      BannerPagesLayout(offset: swipeOffset) {
        ForEach(state.page - 1...state.page + 1, id: \.self) { page in
          let position = page - state.page

          itemView(items[(page % items.count + items.count) % items.count], layout: layout)
            .layoutValue(key: BannerPagePosition.self, value: position)
            // Only the current item can be used
            .allowsHitTesting(position == 0)
            .accessibilityHidden(position != 0)
            .accessibilityFocused($accessibilityFocusedPage, equals: page)
            .transition(transition)
        }
      }
      .onGeometryChange(for: CGFloat.self) { $0.size.width } action: { pageWidth = $0 }
    }
  }
  #endif

  @ViewBuilder
  private func itemView(_ item: BannerItem, layout: BannerLayout) -> some View {
    switch item {
    case .otherDevice:
      OtherDeviceBannerItem(layout: layout, action: { performAction(.showDialog(.otherDevice)) })
    case .notification(let notification):
      NotificationBannerItem(notification: notification, layout: layout, action: { performAction(notification.action) })
    }
  }

  // The current item leaves in the first half of the transition, and the next
  // one comes in the second, so their texts don't overlap. A removed item
  // keeps the transition it last had, so the direction is set before.
  private var transition: AnyTransition {
    let half = Constants.transitionDuration / 2
    let offset = isBackward ? -Constants.transitionOffset : Constants.transitionOffset
    let insertion: AnyTransition = reduceMotion ? .opacity : .offset(x: offset).combined(with: .opacity)
    let removal: AnyTransition = reduceMotion ? .opacity : .offset(x: -offset).combined(with: .opacity)

    return .asymmetric(
      insertion: insertion.animation(.easeOut(duration: half).delay(half)),
      removal: removal.animation(.easeIn(duration: half))
    )
  }

  private func showNext() {
    show((state.index + 1) % items.count)
  }

  private func show(_ index: Int) {
    guard index != state.index else { return }
    withAnimation(.easeInOut(duration: Constants.transitionDuration)) {
      move(to: index)
    }
  }

  private func move(to index: Int) {
    #if os(iOS)
    // An item next to the current one gets the next or the previous page,
    // so the pages slide over. A further item gets a page apart from them,
    // so it replaces the current one with the transition.
    let step = (index - state.index + items.count) % items.count
    if step == 1, !(isBackward && step == items.count - 1) {
      state.page += 1
    } else if step == items.count - 1 {
      state.page -= 1
    } else {
      state.page += step + 2 * items.count
    }
    // The pages, or the next item, move on from where the swipe left them
    swipeOffset = 0
    #endif
    state.index = index
    state.clock.restart()
  }

  #if os(iOS)
  private func swipe(by translation: CGFloat) {
    guard items.count > 1 else { return }
    isSwiping = true
    // Swiping to the right goes back to the previous item
    isBackward = translation > 0
    swipeOffset = translation
  }

  private func endSwipe(translation: CGFloat, velocity: CGFloat) {
    guard isSwiping else { return }
    isSwiping = false
    let distance = translation + velocity * Constants.swipeMomentum
    if abs(distance) > Constants.swipeDistance, (distance < 0) == (translation < 0) {
      let index = distance < 0 ? (state.index + 1) % items.count : (state.index + items.count - 1) % items.count
      if reduceMotion {
        show(index)
      } else {
        // The pages go on at the speed of the finger, so the swipe and the
        // slide are one movement
        let speed = max(distance < 0 ? -velocity : velocity, 0) / max(pageWidth - abs(translation), 1)
        let animation = Animation.interpolatingSpring(
          duration: Constants.swipeSlideDuration,
          initialVelocity: min(speed, Constants.swipeSlideMaxSpeed)
        )
        withAnimation(animation) {
          move(to: index)
        }
      }
    } else {
      withAnimation(.spring(duration: Constants.swipeReturnDuration)) {
        swipeOffset = 0
      }
      isBackward = false
    }
  }
  #endif

  // The current item is longer, and fills up while it's shown. The dots show
  // their items when clicked.
  private var pagination: some View {
    TimelineView(.animation(minimumInterval: Constants.paginationFrameInterval, paused: !state.clock.isRunning)) { context in
      let progress = min(state.clock.elapsed(at: context.date) / Constants.itemDuration, 1)

      HStack(spacing: 0) {
        ForEach(items.indices, id: \.self) { itemIndex in
          let isCurrent = itemIndex == state.index

          Button { show(itemIndex) } label: {
            Capsule()
              .fill(Colors.brand300)
              .overlay(alignment: .leading) {
                if isCurrent {
                  Capsule()
                    .fill(Colors.foregroundBrandPrimary)
                    .frame(width: Constants.paginationCurrentWidth * progress)
                }
              }
              .clipShape(Capsule())
              .frame(
                width: isCurrent ? Constants.paginationCurrentWidth : Constants.paginationDotSize,
                height: Constants.paginationDotSize
              )
              // Clickable up to the halves of the spaces between the dots
              .padding(.horizontal, Constants.paginationSpacing / 2)
              .padding(.vertical, Constants.paginationHitPadding)
              .contentShape(Rectangle())
          }
          .buttonStyle(.plain)
          .accessibilityLabel(Strings.page(itemIndex + 1, of: items.count))
          .accessibilityAddTraits(isCurrent ? .isSelected : [])
        }
      }
      // The buttons are taller than the dots, without taking more space
      .padding(.vertical, -Constants.paginationHitPadding)
    }
    .frame(maxWidth: .infinity)
  }
}

#if os(iOS)
/// Pan of the finger sideways. Unlike a drag gesture, it doesn't start when
/// the finger moves up or down, which scrolls the section instead.
private struct HorizontalPanGesture: UIGestureRecognizerRepresentable {
  var onChanged: (CGFloat) -> Void
  /// With the translation and the velocity, which are zero when the system
  /// cancels the pan
  var onEnded: (CGFloat, CGFloat) -> Void

  func makeUIGestureRecognizer(context: Context) -> UIPanGestureRecognizer {
    let recognizer = UIPanGestureRecognizer()
    recognizer.delegate = context.coordinator
    return recognizer
  }

  func makeCoordinator(converter: CoordinateSpaceConverter) -> Coordinator {
    Coordinator()
  }

  func handleUIGestureRecognizerAction(_ recognizer: UIPanGestureRecognizer, context: Context) {
    switch recognizer.state {
    case .began, .changed:
      onChanged(recognizer.translation(in: recognizer.view).x)
    case .ended:
      onEnded(recognizer.translation(in: recognizer.view).x, recognizer.velocity(in: recognizer.view).x)
    case .cancelled, .failed:
      onEnded(0, 0)
    default:
      break
    }
  }

  final class Coordinator: NSObject, UIGestureRecognizerDelegate {
    func gestureRecognizerShouldBegin(_ gestureRecognizer: UIGestureRecognizer) -> Bool {
      guard let pan = gestureRecognizer as? UIPanGestureRecognizer else { return true }
      let velocity = pan.velocity(in: pan.view)
      return abs(velocity.x) > abs(velocity.y)
    }
  }
}

/// Position of a page of the banner, from the current one
private struct BannerPagePosition: LayoutValueKey {
  static let defaultValue = 0
}

/// Pages of the banner in a row, each as wide as the banner, moved by the
/// swipe. The banner is as tall as the current page.
private struct BannerPagesLayout: Layout {
  var offset: CGFloat

  func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
    guard let current = subviews.first(where: { $0[BannerPagePosition.self] == 0 }) else { return .zero }
    let size = current.sizeThatFits(ProposedViewSize(width: proposal.width, height: nil))
    return CGSize(width: proposal.width ?? size.width, height: size.height)
  }

  func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
    for subview in subviews {
      let x = bounds.minX + CGFloat(subview[BannerPagePosition.self]) * bounds.width + offset
      subview.place(at: CGPoint(x: x, y: bounds.minY), proposal: ProposedViewSize(width: bounds.width, height: nil))
    }
  }
}
#endif

/// Item shown by the banner, and for how long
@Observable
private final class BannerState {
  static let shared = BannerState()

  var index = 0
  /// Of the current item on iPhones and iPads, counted on past the last
  /// item and before the first one
  var page = 0
  var clock = BannerClock()
}

/// Time the current item of a banner is shown for, without the time
/// the banner was paused
private struct BannerClock: Equatable {
  private var elapsedBeforePause: TimeInterval = 0
  /// Since when the clock runs, unless it's paused
  private var runningSince: Date? = .now

  var isRunning: Bool { runningSince != nil }

  func elapsed(at date: Date = .now) -> TimeInterval {
    elapsedBeforePause + max(runningSince.map { date.timeIntervalSince($0) } ?? 0, 0)
  }

  mutating func pause() {
    guard isRunning else { return }
    elapsedBeforePause = elapsed()
    runningSince = nil
  }

  mutating func resume() {
    guard !isRunning else { return }
    runningSince = .now
  }

  /// Starts again from zero, and stays paused if it is
  mutating func restart() {
    elapsedBeforePause = 0
    if isRunning {
      runningSince = .now
    }
  }
}

// MARK: - Items

/// Item about using the app on other devices
private struct OtherDeviceBannerItem: View {
  let layout: BannerLayout
  var action: () -> Void

  var body: some View {
    HStack(alignment: layout.isButtonBelowTexts ? .top : .center, spacing: layout.spacing) {
      // Small, so without the logo
      QRCodeImage(url: OtherDeviceDialog.url, hasLogo: false)
        .frame(width: layout.qrCodeSize, height: layout.qrCodeSize)
        .accessibilityHidden(true)
        .padding(.top, layout.qrCodeTopPadding)

      if layout.isButtonBelowTexts {
        VStack(alignment: .leading, spacing: Constants.buttonTopSpacing) {
          texts
          button
            .fixedSize()
        }
        .frame(maxWidth: .infinity, alignment: .leading)
      } else {
        texts
          .frame(maxWidth: .infinity, alignment: .leading)
        button
          // Wider for the longer titles of some languages
          .frame(minWidth: Constants.buttonWidth)
          .fixedSize()
      }
    }
    .padding(layout.padding)
    // Read as one element, with the action of its button, whose title
    // the combined label leaves out
    .accessibilityElement(children: .combine)
    .accessibilityLabel([Strings.otherDeviceTitle, Strings.otherDeviceDescription, Strings.scanQRCode].joined(separator: ", "))
  }

  private var texts: some View {
    VStack(alignment: .leading, spacing: Constants.textSpacing) {
      Text(Strings.otherDeviceTitle)
        .textStyle(layout.titleStyle)
        .foregroundColor(Colors.foregroundPrimary)
      Text(Strings.otherDeviceDescription)
        .textStyle(layout.descriptionStyle)
        .foregroundColor(Colors.foregroundSecondary)
        .fixedSize(horizontal: false, vertical: true)
    }
  }

  private var button: some View {
    Button(action: action) {
      HStack(spacing: 0) {
        Image(Icons.homeAppStore)
        Text(Strings.scanQRCode)
          .padding(.leading, layout.buttonTitlePadding.leading)
          .padding(.trailing, layout.buttonTitlePadding.trailing)
      }
    }
    .buttonStyle(AppButtonStyle(kind: .secondary, size: layout.buttonSize))
  }
}

/// Item with a notification, which is a button for its action
private struct NotificationBannerItem: View {
  let notification: BannerNotification
  let layout: BannerLayout
  var action: () -> Void

  var body: some View {
    Button(action: action) {
      HStack(spacing: layout.spacing) {
        Image(decorative: notification.icon)
          .frame(width: Constants.iconSize, height: Constants.iconSize)
          .background(RoundedRectangle(cornerRadius: Constants.iconCornerRadius).fill(Colors.bgBrandPrimary))

        VStack(alignment: .leading, spacing: Constants.textSpacing) {
          Text(notification.text)
            .textStyle(.bodyM)
            .foregroundColor(Colors.foregroundPrimary)
            .fixedSize(horizontal: false, vertical: true)
          Text(notification.actionTitle)
            .textStyle(.labelM)
            .foregroundColor(Colors.foregroundBrandPrimary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)

        Image(decorative: Icons.bannerChevronRight)
      }
      .padding(layout.padding)
      .contentShape(Self.shapeKinds, RoundedRectangle(cornerRadius: Constants.cornerRadius))
    }
    .buttonStyle(.plain)
    .accessibilityLabel([notification.text, notification.actionTitle].joined(separator: ", "))
  }

  // The focus ring follows the corners of the banner, and on iPads
  // the highlight of the pointer
  #if os(macOS)
  private static let shapeKinds: ContentShapeKinds = [.interaction, .focusEffect]
  #else
  private static let shapeKinds: ContentShapeKinds = [.interaction, .hoverEffect]
  #endif
}

struct Banner_Previews: PreviewProvider {
  static var previews: some View {
    #if os(macOS)
    Banner()
      .frame(width: 736)
    #else
    Banner()
      .padding()
    #endif
  }
}
