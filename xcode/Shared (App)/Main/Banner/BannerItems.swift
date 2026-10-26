//
//  BannerItems.swift
//  Ghostery
//
//  Items of the banner at the bottom of the sections.
//

import SwiftUI

fileprivate enum Constants {
  static let textSpacing: CGFloat = 4
  // Of the banner, which the focus ring and the highlight of an item follow
  static let bannerCornerRadius: CGFloat = 12

  // After the texts, as on the Mac
  static let buttonWidth: CGFloat = 160
  // Below the texts, as on iPhones and iPads
  static let buttonTopSpacing: CGFloat = 16

  static let iconSize: CGFloat = 56
  static let iconCornerRadius: CGFloat = 8
}

fileprivate enum Strings {
  // You can translate your strings here
  static let otherDeviceTitle = String(localized: "Want to use this app on another device?")
  static let scanQRCode = String(localized: "Scan QR Code", comment: "Button opening the dialog with the QR code")
}

fileprivate enum URLs {
  // Ratings and reviews of the app in the App Store app
  static let review = URL.appStore("app/id6504861501?action=write-review")
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

  /// Items of the banner, in their order
  @MainActor
  static var current: [BannerItem] {
    #if os(macOS)
    (AppSettings.shared.invitesToLaunchAtLogin ? [launchAtLoginItem] : []) + commonItems
    #else
    commonItems
    #endif
  }
}

struct BannerNotification: Identifiable {
  let id: String
  let icon: ImageResource
  let text: String
  let actionTitle: String
  let action: MainAction
}

// Shown to every user, after the invitation to launch at login on the Mac
fileprivate let commonItems: [BannerItem] = [
  .otherDevice,
  .notification(BannerNotification(
    id: "review",
    icon: .bannerReview,
    text: String(localized: "Enjoying Ghostery?"),
    actionTitle: String(localized: "Rate it on App Store"),
    action: .open(URLs.review)
  )),
  .notification(BannerNotification(
    id: "help",
    icon: .bannerHelp,
    text: String(localized: "Having trouble using Ghostery?"),
    actionTitle: String(localized: "Get Help", comment: "Opens the dialog with the ways to get help"),
    action: .showDialog(.support)
  )),
]

#if os(macOS)
// Shown while the app doesn't launch at login. Once it does, the item is
// removed, and the next one takes its place.
fileprivate let launchAtLoginItem = BannerItem.notification(BannerNotification(
  id: "launch-at-login",
  icon: .bannerLaunch,
  text: String(localized: "Want Ghostery to start automatically when you log in?"),
  actionTitle: String(localized: "Launch at startup", comment: "Turns on the setting opening the app when the user logs in"),
  action: .perform { AppSettings.shared.setLaunchesAtLogin(true) }
))
#endif

/// View of an item, with the action of its button
struct BannerItemView: View {
  let item: BannerItem
  let layout: BannerLayout

  @Environment(\.performAction) private var performAction

  var body: some View {
    switch item {
    case .otherDevice:
      OtherDeviceBannerItem(layout: layout, action: { performAction(.showDialog(.otherDevice)) })
    case .notification(let notification):
      NotificationBannerItem(notification: notification, layout: layout, action: { performAction(notification.action) })
    }
  }
}

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
    .singleActionAccessibility(label: [Strings.otherDeviceTitle, OtherDeviceDialog.description, Strings.scanQRCode])
  }

  private var texts: some View {
    VStack(alignment: .leading, spacing: Constants.textSpacing) {
      Text(Strings.otherDeviceTitle)
        .textStyle(layout.titleStyle)
        .foregroundColor(Colors.foregroundPrimary)
      Text(OtherDeviceDialog.description)
        .textStyle(layout.descriptionStyle)
        .foregroundColor(Colors.foregroundSecondary)
        .fixedSize(horizontal: false, vertical: true)
    }
  }

  private var button: some View {
    Button(action: action) {
      HStack(spacing: 0) {
        Image(.homeAppStore)
        Text(Strings.scanQRCode)
          .padding(layout.buttonTitlePadding)
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
        Image(notification.icon)
          .accessibilityHidden(true)
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

        Image(.bannerChevronRight)
          .accessibilityHidden(true)
      }
      .padding(layout.padding)
      .contentShape(Self.shapeKinds, RoundedRectangle(cornerRadius: Constants.bannerCornerRadius))
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
