//
//  Banner.swift
//  Ghostery
//
//  Banner at the bottom of the sections of the main window, showing its
//  items one after another.
//

import SwiftUI

fileprivate enum Constants {
  static let sectionPadding: CGFloat = 20
  static let padding: CGFloat = 12
  static let spacing: CGFloat = 12
  static let textSpacing: CGFloat = 4
  static let cornerRadius: CGFloat = 12
  static let shadowRadius: CGFloat = 6
  static let shadowY: CGFloat = 4
  // As tall as the notifications, so the banner keeps its height when its items change
  static let minHeight: CGFloat = 80

  static let qrCodeSize: CGFloat = 48
  static let buttonWidth: CGFloat = 160
  static let buttonIconSpacing: CGFloat = 8
  static let buttonTrailingPadding: CGFloat = 4

  static let iconSize: CGFloat = 56
  static let iconCornerRadius: CGFloat = 8

  static let itemDuration: TimeInterval = 5
  static let transitionDuration: Double = 0.4
  // No farther than the padding, so items never leave the banner
  static let transitionOffset: CGFloat = 12

  static let paginationTopPadding: CGFloat = 8
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
  static let otherDeviceTitle = "Want to use this app on another device?"
  static let otherDeviceDescription = "Scan the QR code to install the app on your phone or tablet."
  static let scanQRCode = "Scan QR Code"
  static let page = "Page %ld of %ld"
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
}

// Placeholder items, to be replaced with the ones that apply to the user
fileprivate let placeholderItems: [BannerItem] = [
  .otherDevice,
  .notification(BannerNotification(
    id: "contribute",
    icon: Icons.bannerReview,
    text: "Hey, do you enjoy Ghostery and want to support our work?",
    actionTitle: "Become a Contributor"
  )),
  .notification(BannerNotification(
    id: "review",
    icon: Icons.bannerReview,
    text: "Enjoying Ghostery?",
    actionTitle: "Rate it on App Store"
  )),
  .notification(BannerNotification(
    id: "help",
    icon: Icons.bannerHelp,
    text: "Having trouble using Ghostery?",
    actionTitle: "Get Help"
  )),
]

/// Banner showing its items one after another, with their pagination, whose
/// dots show their items when clicked. The current item stays while the user
/// points at the banner or has it focused, and while a dialog covers it.
struct Banner: View {
  private let items = placeholderItems
  // Shared by the banners of all sections, so the banner keeps its item
  // and countdown when the section changes
  private let state = BannerState.shared

  @State private var isHovered = false
  @FocusState private var isFocused: Bool
  @AccessibilityFocusState private var isAccessibilityFocused: Bool
  @Environment(\.accessibilityReduceMotion) private var reduceMotion
  @Environment(\.showDialog) private var showDialog
  // Disabled while a dialog covers it
  @Environment(\.isEnabled) private var isEnabled

  private var isPaused: Bool {
    isHovered || isFocused || isAccessibilityFocused || !isEnabled
  }

  var body: some View {
    let shape = RoundedRectangle(cornerRadius: Constants.cornerRadius)

    VStack(spacing: 0) {
      ZStack {
        if items.indices.contains(state.index) {
          item(items[state.index])
            .accessibilityFocused($isAccessibilityFocused)
            .id(items[state.index].id)
            .transition(transition)
        }
      }
      .frame(maxWidth: .infinity, minHeight: Constants.minHeight)
      .background(
        shape
          .fill(Colors.bgPrimary)
          .shadow(color: Colors.shadowCard, radius: Constants.shadowRadius, y: Constants.shadowY)
      )
      .overlay(shape.strokeBorder(Colors.borderPrimary, lineWidth: Constants.borderLineWidth))

      if items.count > 1 {
        pagination
          .padding(.top, Constants.paginationTopPadding)
      }
    }
    .onHover { isHovered = $0 }
    // Focus on the item, or on the dots of the pagination
    .focused($isFocused)
    .padding(Constants.sectionPadding)
    .onChange(of: isPaused) {
      if isPaused {
        state.clock.pause()
      } else {
        state.clock.resume()
      }
    }
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

  @ViewBuilder
  private func item(_ item: BannerItem) -> some View {
    switch item {
    case .otherDevice:
      OtherDeviceBannerItem(action: { showDialog(.otherDevice) })
    case .notification(let notification):
      NotificationBannerItem(notification: notification, action: {})
    }
  }

  // The current item leaves in the first half of the transition, and the next
  // one comes in the second, so their texts don't overlap
  private var transition: AnyTransition {
    let half = Constants.transitionDuration / 2
    let insertion: AnyTransition = reduceMotion ? .opacity : .offset(x: Constants.transitionOffset).combined(with: .opacity)
    let removal: AnyTransition = reduceMotion ? .opacity : .offset(x: -Constants.transitionOffset).combined(with: .opacity)

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
      state.index = index
      state.clock.restart()
    }
  }

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
              .fill(Colors.bgTertiary)
              .overlay(alignment: .leading) {
                if isCurrent {
                  Capsule()
                    .fill(Colors.foregroundPrimary)
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
          .accessibilityLabel(String(format: Strings.page, itemIndex + 1, items.count))
          .accessibilityAddTraits(isCurrent ? .isSelected : [])
        }
      }
      // The buttons are taller than the dots, without taking more space
      .padding(.vertical, -Constants.paginationHitPadding)
    }
    .frame(maxWidth: .infinity)
  }
}

/// Item shown by the banner, and for how long
@Observable
private final class BannerState {
  static let shared = BannerState()

  var index = 0
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
struct OtherDeviceBannerItem: View {
  var action: () -> Void

  var body: some View {
    HStack(spacing: Constants.spacing) {
      Image(decorative: Icons.qrCode)
        .resizable()
        .frame(width: Constants.qrCodeSize, height: Constants.qrCodeSize)

      VStack(alignment: .leading, spacing: Constants.textSpacing) {
        Text(Strings.otherDeviceTitle)
          .textStyle(.labelL)
          .foregroundColor(Colors.foregroundPrimary)
        Text(Strings.otherDeviceDescription)
          .textStyle(.bodyS)
          .foregroundColor(Colors.foregroundSecondary)
      }
      .frame(maxWidth: .infinity, alignment: .leading)

      Button(action: action) {
        HStack(spacing: 0) {
          Image(Icons.homeAppStore)
          Text(Strings.scanQRCode)
            .padding(.leading, Constants.buttonIconSpacing)
            .padding(.trailing, Constants.buttonTrailingPadding)
        }
      }
      .buttonStyle(AppButtonStyle(kind: .secondary))
      .frame(width: Constants.buttonWidth)
    }
    .padding(Constants.padding)
    // Read as one element, with the action of its button, whose title
    // the combined label leaves out
    .accessibilityElement(children: .combine)
    .accessibilityLabel([Strings.otherDeviceTitle, Strings.otherDeviceDescription, Strings.scanQRCode].joined(separator: ", "))
  }
}

/// Item with a notification, which is a button for its action
struct NotificationBannerItem: View {
  let notification: BannerNotification
  var action: () -> Void

  var body: some View {
    Button(action: action) {
      HStack(spacing: Constants.spacing) {
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
      .padding(Constants.padding)
      // The focus ring follows the corners of the banner
      .contentShape([.interaction, .focusEffect], RoundedRectangle(cornerRadius: Constants.cornerRadius))
    }
    .buttonStyle(.plain)
    .accessibilityLabel([notification.text, notification.actionTitle].joined(separator: ", "))
  }
}

struct Banner_Previews: PreviewProvider {
  static var previews: some View {
    Banner()
      .frame(width: 736)
  }
}
