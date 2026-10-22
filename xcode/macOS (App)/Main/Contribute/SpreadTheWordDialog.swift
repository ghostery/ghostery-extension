//
//  SpreadTheWordDialog.swift
//  Ghostery
//
//  Dialog of the main window for sharing Ghostery, opened from the
//  Contribute section.
//

import AppKit
import SwiftUI

fileprivate enum Constants {
  static let width: CGFloat = 560
  static let topPadding: CGFloat = 40
  static let bottomPadding: CGFloat = 54
  static let imageWidth: CGFloat = 400
  static let imageHeight: CGFloat = 240
  static let imageBottomPadding: CGFloat = 39
  static let textWidth: CGFloat = 423
  static let textSpacing: CGFloat = 8
  static let shareTopPadding: CGFloat = 16
  static let shareSpacing: CGFloat = 8

  static let buttonsSpacing: CGFloat = 4
  static let buttonSize: CGFloat = 40
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
  static let copied = String(localized: "Copied", comment: "Shown after the message is copied to the clipboard")
  static let shareByEmail = String(localized: "Share by email")
  static let message = String(localized: "Browse the web safer, faster & with less ads.\nGet Ghostery for your browser.", comment: "Message shared with the link to Ghostery, in two lines")
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
  static let email = shareURL("mailto:", ["body": messageWithLink])

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
  // Changed by every copy, to restart the time the confirmation is shown
  @State private var copyCount = 0
  @State private var isCopied = false

  var body: some View {
    AppDialog(width: Constants.width, onClose: onClose) {
      content
    }
  }

  private var content: some View {
    VStack(spacing: 0) {
      Image(decorative: Icons.shareHeader)
        .frame(width: Constants.imageWidth, height: Constants.imageHeight)
        .padding(.bottom, Constants.imageBottomPadding)

      VStack(spacing: Constants.textSpacing) {
        Text(Strings.title)
          .textStyle(.headlineS)
          .foregroundColor(Colors.foregroundPrimary)
          .accessibilityAddTraits(.isHeader)
        Text(Strings.description)
          .textStyle(.bodyM)
          .foregroundColor(Colors.foregroundSecondary)
      }
      .multilineTextAlignment(.center)
      .frame(width: Constants.textWidth)
      .fixedSize(horizontal: false, vertical: true)

      VStack(spacing: Constants.shareSpacing) {
        Text(Strings.share)
          .textStyle(.labelM)
          .foregroundColor(Colors.foregroundPrimary)
        HStack(spacing: Constants.buttonsSpacing) {
          shareButton(Icons.shareFacebook, label: Strings.shareOnFacebook) { openURL(URLs.facebook) }
          shareButton(Icons.shareX, label: Strings.shareOnX) { openURL(URLs.x) }
          shareButton(Icons.shareLinkedin, label: Strings.shareOnLinkedin) { openURL(URLs.linkedin) }
          shareButton(isCopied ? Icons.shareCopied : Icons.shareCopy, label: Strings.copy, action: copy)
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
          shareButton(Icons.shareMail, label: Strings.shareByEmail) { openURL(URLs.email) }
        }
      }
      .padding(.top, Constants.shareTopPadding)
    }
    .padding(.top, Constants.topPadding)
    .padding(.bottom, Constants.bottomPadding)
    .frame(maxWidth: .infinity)
    .task(id: copyCount) {
      guard copyCount > 0 else { return }
      do {
        try await Task.sleep(for: Constants.copiedDuration)
        withAnimation { isCopied = false }
      } catch {}
    }
  }

  private func shareButton(_ icon: String, label: String, action: @escaping () -> Void) -> some View {
    Button(action: action) {
      Image(decorative: icon)
        .frame(width: Constants.buttonIconSize, height: Constants.buttonIconSize)
    }
    .buttonStyle(ShareButtonStyle())
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
    NSPasteboard.general.clearContents()
    NSPasteboard.general.setString(URLs.messageWithLink, forType: .string)
    withAnimation { isCopied = true }
    copyCount += 1
    AccessibilityNotification.Announcement(Strings.copied).post()
  }
}

private struct ShareButtonStyle: ButtonStyle {
  func makeBody(configuration: ButtonStyleConfiguration) -> some View {
    let shape = RoundedRectangle(cornerRadius: Constants.buttonCornerRadius)

    configuration.label
      .frame(width: Constants.buttonSize, height: Constants.buttonSize)
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
