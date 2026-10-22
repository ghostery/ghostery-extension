//
//  SpreadTheWordDialog.swift
//  Ghostery
//
//  Dialog for sharing Ghostery, opened from the Contribute section.
//

import SwiftUI
#if os(macOS)
import AppKit
#else
import UIKit
#endif

fileprivate enum Constants {
  static let textSpacing: CGFloat = 8
  static let shareSpacing: CGFloat = 8

  static let buttonsSpacing: CGFloat = 4
  static let buttonIconSize: CGFloat = 24
  static let buttonCornerRadius: CGFloat = 8
  static let buttonShadowRadius: CGFloat = 4
  static let buttonShadowY: CGFloat = 3
  static let buttonPressedOpacity: Double = 0.8
  static let borderLineWidth: CGFloat = 1

  static let tooltipSpacing: CGFloat = 4
  static let tooltipHorizontalPadding: CGFloat = 8
  static let tooltipVerticalPadding: CGFloat = 4
  static let tooltipCornerRadius: CGFloat = 4
  static let tooltipBorderLineWidth: CGFloat = 0.5
  static let tooltipShadowRadius: CGFloat = 6
  static let tooltipShadowY: CGFloat = 4
  static let tooltipShadowColor = Color(red: 32 / 255, green: 44 / 255, blue: 68 / 255).opacity(0.2)

  static let copiedDuration: Duration = .seconds(2)
}

fileprivate enum Strings {
  // You can translate your strings here
  static let title = String(localized: "Hundreds of contributors are building the Ghostery Privacy Suite with us", comment: "Ghostery Privacy Suite is the name of all Ghostery’s products")
  static let description = String(localized: "Receiving all this help is crucial to Ghostery’s existence. We welcome everyone to our growing community!")
  static let share = String(localized: "Spread the word:", comment: "Shown above the buttons sharing Ghostery")
  static let shareOnFacebook = String(localized: "Share on Facebook")
  static let shareOnX = String(localized: "Share on X", comment: "X is the social network formerly known as Twitter")
  static let shareOnLinkedin = String(localized: "Share on LinkedIn")
  static let copy = String(localized: "Copy to clipboard")
  static let copied = String(localized: "Copied", comment: "Shown after a text, like a message or a link, is copied to the clipboard")
  #if os(macOS)
  static let shareByEmail = String(localized: "Share by email")
  #else
  static let shareMore = String(localized: "More ways to share", comment: "Button opening the share sheet of the system, with the message about Ghostery")
  #endif
  static let message = String(localized: "Browse the web safer, faster & with less ads.\nGet Ghostery for your browser.", comment: "Message shared with the link to Ghostery, in two lines")
}

/// Sizes of the dialog, which differ between the Mac, iPhones and iPads
fileprivate struct SpreadTheWordLayout {
  var width: CGFloat
  var topPadding: CGFloat
  var bottomPadding: CGFloat
  var imageWidth: CGFloat
  var imageHeight: CGFloat
  var imageBottomPadding: CGFloat
  /// Of the texts, so they wrap as in the design
  var textWidth: CGFloat
  var titleStyle: AppTextStyle
  var descriptionStyle: AppTextStyle
  var shareTopPadding: CGFloat
  var buttonSize: CGFloat

  #if os(macOS)
  static let mac = SpreadTheWordLayout(
    width: 560,
    topPadding: 40,
    bottomPadding: 54,
    imageWidth: 400,
    imageHeight: 240,
    imageBottomPadding: 39,
    textWidth: 423,
    titleStyle: .headlineS,
    descriptionStyle: .bodyM,
    shareTopPadding: 16,
    buttonSize: 40
  )
  #else
  static let phone = SpreadTheWordLayout(
    width: 540,
    topPadding: 24,
    bottomPadding: 40,
    imageWidth: 320,
    imageHeight: 192,
    imageBottomPadding: 32,
    textWidth: 331,
    titleStyle: .headlineS,
    descriptionStyle: .bodyM,
    shareTopPadding: 32,
    buttonSize: 48
  )
  static let tablet = SpreadTheWordLayout(
    width: 540,
    topPadding: 40,
    bottomPadding: 64,
    imageWidth: 400,
    imageHeight: 240,
    imageBottomPadding: 48,
    textWidth: 453,
    titleStyle: .headlineM,
    descriptionStyle: .bodyL,
    shareTopPadding: 32,
    buttonSize: 48
  )
  #endif
}

fileprivate enum URLs {
  static let ghostery = "https://www.ghostery.com/ghostery-ad-blocker"
  // For the email and the clipboard
  static let messageWithLink = "\(Strings.message)\n\(ghostery)"

  // Facebook and LinkedIn share only links, shown with the image and the
  // title of the page, and the user adds their own comment
  static let facebook = shareURL("https://www.facebook.com/sharer/sharer.php", ["u": ghostery])
  static let x = shareURL("https://x.com/intent/post", ["text": Strings.message, "url": ghostery])
  static let linkedin = shareURL("https://www.linkedin.com/sharing/share-offsite/", ["url": ghostery])
  #if os(macOS)
  static let email = shareURL("mailto:", ["body": messageWithLink])
  #else
  // For the share sheet, which adds the message to the link where the app
  // receiving it supports it
  static let ghosteryURL = URL(string: ghostery)!
  #endif

  private static func shareURL(_ base: String, _ query: KeyValuePairs<String, String>) -> URL {
    var components = URLComponents(string: base)!
    components.queryItems = query.map { URLQueryItem(name: $0.key, value: $0.value) }
    // Left as is by the components, but read as a space by servers
    components.percentEncodedQuery = components.percentEncodedQuery?.replacingOccurrences(of: "+", with: "%2B")
    return components.url!
  }
}

struct SpreadTheWordDialog: View {
  var onClose: () -> Void

  @Environment(\.openURL) private var openURL
  #if os(iOS)
  @Environment(\.horizontalSizeClass) private var horizontalSizeClass
  #endif
  // Changed by every copy, to restart the time the confirmation is shown
  @State private var copyCount = 0
  @State private var isCopied = false

  var body: some View {
    let layout = self.layout

    AppDialog(width: layout.width, onClose: onClose) {
      content(layout)
    }
  }

  private var layout: SpreadTheWordLayout {
    #if os(macOS)
    .mac
    #else
    horizontalSizeClass == .regular ? .tablet : .phone
    #endif
  }

  private func content(_ layout: SpreadTheWordLayout) -> some View {
    VStack(spacing: 0) {
      Image(decorative: Icons.shareHeader)
        .resizable()
        .scaledToFit()
        .frame(width: layout.imageWidth, height: layout.imageHeight)
        .padding(.bottom, layout.imageBottomPadding)

      VStack(spacing: Constants.textSpacing) {
        Text(Strings.title)
          .textStyle(layout.titleStyle)
          .foregroundColor(Colors.foregroundPrimary)
          .accessibilityAddTraits(.isHeader)
        Text(Strings.description)
          .textStyle(layout.descriptionStyle)
          .foregroundColor(Colors.foregroundSecondary)
      }
      .multilineTextAlignment(.center)
      .frame(maxWidth: layout.textWidth)
      .fixedSize(horizontal: false, vertical: true)

      VStack(spacing: Constants.shareSpacing) {
        Text(Strings.share)
          .textStyle(.labelM)
          .foregroundColor(Colors.foregroundPrimary)
        HStack(spacing: Constants.buttonsSpacing) {
          shareButton(Icons.shareFacebook, label: Strings.shareOnFacebook, layout: layout) { openURL(URLs.facebook) }
          shareButton(Icons.shareX, label: Strings.shareOnX, layout: layout) { openURL(URLs.x) }
          shareButton(Icons.shareLinkedin, label: Strings.shareOnLinkedin, layout: layout) { openURL(URLs.linkedin) }
          shareButton(isCopied ? Icons.shareCopied : Icons.shareCopy, label: Strings.copy, layout: layout, action: copy)
            .overlay(alignment: .top) {
              if isCopied {
                copiedTooltip
                  .fixedSize()
                  // Grows upwards from the top of the button
                  .frame(height: 0, alignment: .bottom)
                  .offset(y: -Constants.tooltipSpacing)
                  .transition(.opacity)
              }
            }
          #if os(macOS)
          shareButton(Icons.shareMail, label: Strings.shareByEmail, layout: layout) { openURL(URLs.email) }
          #else
          // The other ways to share of the device, like Messages or Mail
          ShareLink(item: URLs.ghosteryURL, message: Text(Strings.message)) {
            Image(decorative: Icons.shareSystem)
              .frame(width: Constants.buttonIconSize, height: Constants.buttonIconSize)
          }
          .buttonStyle(ShareButtonStyle(size: layout.buttonSize))
          .accessibilityLabel(Strings.shareMore)
          #endif
        }
      }
      .padding(.top, layout.shareTopPadding)
    }
    .padding(.top, layout.topPadding)
    .padding(.bottom, layout.bottomPadding)
    .frame(maxWidth: .infinity)
    .task(id: copyCount) {
      guard copyCount > 0 else { return }
      do {
        try await Task.sleep(for: Constants.copiedDuration)
        withAnimation { isCopied = false }
      } catch {}
    }
  }

  private func shareButton(_ icon: String, label: String, layout: SpreadTheWordLayout, action: @escaping () -> Void) -> some View {
    Button(action: action) {
      Image(decorative: icon)
        .frame(width: Constants.buttonIconSize, height: Constants.buttonIconSize)
    }
    .buttonStyle(ShareButtonStyle(size: layout.buttonSize))
    .help(label)
    .accessibilityLabel(label)
  }

  private var copiedTooltip: some View {
    let shape = RoundedRectangle(cornerRadius: Constants.tooltipCornerRadius)

    return Text(Strings.copied)
      .textStyle(.labelS)
      .foregroundColor(Colors.foregroundPrimary)
      .padding(.horizontal, Constants.tooltipHorizontalPadding)
      .padding(.vertical, Constants.tooltipVerticalPadding)
      .background(
        shape
          .fill(Colors.bgPrimary)
          .shadow(color: Constants.tooltipShadowColor, radius: Constants.tooltipShadowRadius, y: Constants.tooltipShadowY)
      )
      .overlay(shape.strokeBorder(Colors.borderPrimary, lineWidth: Constants.tooltipBorderLineWidth))
      // Announced instead
      .accessibilityHidden(true)
  }

  private func copy() {
    #if os(macOS)
    NSPasteboard.general.clearContents()
    NSPasteboard.general.setString(URLs.messageWithLink, forType: .string)
    #else
    UIPasteboard.general.string = URLs.messageWithLink
    #endif
    withAnimation { isCopied = true }
    copyCount += 1
    AccessibilityNotification.Announcement(Strings.copied).post()
  }
}

private struct ShareButtonStyle: ButtonStyle {
  var size: CGFloat

  func makeBody(configuration: ButtonStyleConfiguration) -> some View {
    let shape = RoundedRectangle(cornerRadius: Constants.buttonCornerRadius)

    configuration.label
      .frame(width: size, height: size)
      .background(
        shape
          .fill(Colors.bgPrimary)
          .shadow(color: Colors.shadowButton, radius: Constants.buttonShadowRadius, y: Constants.buttonShadowY)
      )
      .overlay(shape.strokeBorder(Colors.borderSecondary, lineWidth: Constants.borderLineWidth))
      .contentShape(shape)
      .opacity(configuration.isPressed ? Constants.buttonPressedOpacity : 1)
  }
}

struct SpreadTheWordDialog_Previews: PreviewProvider {
  static var previews: some View {
    SpreadTheWordDialog(onClose: {})
      .padding(40)
  }
}
