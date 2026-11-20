//
//  BrowserAccessDialog.swift
//  Ghostery
//
//  Dialog with the steps to let the app read the data of a browser, so it
//  can check if Ghostery is enabled in it, opened from the card of the
//  browser.
//

import SwiftUI

fileprivate enum Constants {
  static let width: CGFloat = 560
  static let topPadding: CGFloat = 64
  static let bottomPadding: CGFloat = 40
  // Between the image and the title
  static let imageSpacing: CGFloat = 40
  static let textSpacing: CGFloat = 8
  // Of the texts, so they wrap as in the design
  static let textWidth: CGFloat = 427
  // Between the texts and the buttons
  static let buttonsSpacing: CGFloat = 32
  static let buttonSpacing: CGFloat = 8
  static let buttonLabelPadding: CGFloat = 8

  // The names in the image, which leaves them out. Their positions are of
  // the leading edges of their lines, and they're as wide as the line of
  // the app, and as the space before the highlight of the switch.
  static let imageNameStyle = AppTextStyle(size: 14, weight: .semibold, lineHeight: 16, relativeTo: .subheadline)
  static let imageAppNamePosition = CGPoint(x: 63, y: 22)
  static let imageAppNameMaxWidth: CGFloat = 227
  static let imageBrowserNamePosition = CGPoint(x: 89, y: 73)
  static let imageBrowserNameMaxWidth: CGFloat = 177
}

fileprivate enum Strings {
  // You can translate your strings here
  static let cancel = String(localized: "Cancel", comment: "Button closing the dialog")
  static let openSystemSettings = String(localized: "Open System Settings", comment: "System Settings is the name of the macOS app")

  /// Where to turn the access on, with the names in bold
  static func steps(for browser: ExternalBrowser, names: SettingsNames) -> Text {
    let bold = AppTextStyle.labelM.font
    return Text(
      "To check if Ghostery is enabled in \(browser.name), open System Settings, select \(Text(names.app).font(bold)), and make sure \(Text(names.browser).font(bold)) is toggled on.",
      comment: "Shown when the app can't read the data of a browser. The first placeholder is the name of the browser, the second one the name of the app, and the last one the name of the browser as System Settings shows it. System Settings is the name of the macOS app."
    )
  }
}

/// Names of the app and of the browser, as System Settings shows them, like
/// "Google Chrome", for the steps and the image
fileprivate struct SettingsNames {
  let app: String
  let browser: String

  init(browser: ExternalBrowser) {
    app = Bundle.main.object(forInfoDictionaryKey: "CFBundleDisplayName") as? String ?? "Ghostery"
    self.browser = browser.appName ?? browser.name
  }
}

struct BrowserAccessDialog: View {
  /// Also of the button of the card opening it
  static let title = String(localized: "Permissions required", comment: "Button of the card of a browser whose data the app can't read, so it can't tell if Ghostery is enabled in it, and title of the dialog the button opens")

  let browser: ExternalBrowser
  var onClose: () -> Void

  var body: some View {
    let names = SettingsNames(browser: browser)

    AppDialog(width: Constants.width, onClose: onClose) {
      VStack(spacing: 0) {
        BrowserAccessImage(browser: browser, names: names)
          .padding(.bottom, Constants.imageSpacing)

        VStack(spacing: Constants.textSpacing) {
          Text(Self.title)
            .textStyle(.headlineS)
            .accessibilityAddTraits(.isHeader)
          Strings.steps(for: browser, names: names)
            .textStyle(.bodyM)
        }
        .foregroundColor(Colors.foregroundPrimary)
        .multilineTextAlignment(.center)
        .fixedSize(horizontal: false, vertical: true)
        .frame(maxWidth: Constants.textWidth)
        .padding(.bottom, Constants.buttonsSpacing)

        HStack(spacing: Constants.buttonSpacing) {
          Button(action: onClose) {
            Text(Strings.cancel)
              .padding(.horizontal, Constants.buttonLabelPadding)
          }
          .buttonStyle(AppButtonStyle(kind: .secondaryGray, size: .large))

          Button {
            ExternalBrowser.showAccessSettings()
            onClose()
          } label: {
            Text(Strings.openSystemSettings)
              .padding(.horizontal, Constants.buttonLabelPadding)
          }
          .buttonStyle(AppButtonStyle(kind: .primary, size: .large))
        }
        // The buttons fit their titles
        .fixedSize()
      }
      .frame(maxWidth: .infinity)
      .padding(.top, Constants.topPadding)
      .padding(.bottom, Constants.bottomPadding)
    }
  }
}

/// The settings of the app in System Settings, with the switch of the
/// browser turned on, and their names as the settings show them
private struct BrowserAccessImage: View {
  let browser: ExternalBrowser
  let names: SettingsNames

  var body: some View {
    Image(browser.accessImage)
      .overlay(alignment: .topLeading) {
        // Otherwise the overlay centers them on each other
        ZStack(alignment: .topLeading) {
          name(names.app, at: Constants.imageAppNamePosition, maxWidth: Constants.imageAppNameMaxWidth)
          name(names.browser, at: Constants.imageBrowserNamePosition, maxWidth: Constants.imageBrowserNameMaxWidth)
        }
      }
      .accessibilityHidden(true)
  }

  private func name(_ name: String, at position: CGPoint, maxWidth: CGFloat) -> some View {
    Text(verbatim: name)
      .textStyle(Constants.imageNameStyle)
      .foregroundColor(Colors.foregroundPrimary)
      .lineLimit(1)
      .frame(maxWidth: maxWidth, alignment: .leading)
      .padding(.leading, position.x)
      .padding(.top, position.y)
  }
}

fileprivate extension ExternalBrowser {
  /// The image of the settings, without the names
  var accessImage: ImageResource {
    switch self {
    case .chrome: return .browserAccessChrome
    case .edge: return .browserAccessEdge
    case .firefox: return .browserAccessFirefox
    case .opera: return .browserAccessOpera
    case .brave: return .browserAccessBrave
    }
  }
}

#Preview {
  BrowserAccessDialog(browser: .firefox, onClose: {})
    .padding(40)
}
