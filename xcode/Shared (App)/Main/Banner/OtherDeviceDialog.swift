//
//  OtherDeviceDialog.swift
//  Ghostery
//
//  Dialog with the QR code installing the app on other devices,
//  opened from the banner.
//

import SwiftUI

fileprivate enum Constants {
  static let qrCodeSize: CGFloat = 200
  static let qrCodeBottomPadding: CGFloat = 32
  static let textSpacing: CGFloat = 8

  #if os(iOS)
  static let buttonsSpacing: CGFloat = 8
  // Of the buttons one below the other, from the edges of the dialog
  static let stackedButtonsPadding: CGFloat = 24
  static let buttonLabelPadding: CGFloat = 8
  #endif
}

fileprivate enum Strings {
  // You can translate your strings here
  static let title = String(localized: "Use this app on another device")
  #if os(macOS)
  static let description = String(localized: "Scan the QR code to install the app on your phone or tablet.")
  #else
  static let description = String(localized: "Scan the QR code to install the app on your tablet or desktop.")
  static let copyLink = String(localized: "Copy link", comment: "Button copying the link installing the app to the clipboard")
  static let shareLink = String(localized: "Share link", comment: "Button sharing the link installing the app")
  #endif
  static let qrCode = String(localized: "QR code", comment: "Description of the QR code image, for assistive technologies")
}

/// Sizes of the dialog, which is larger on iPads
fileprivate struct OtherDeviceDialogLayout: PlatformLayout {
  var width: CGFloat
  var topPadding: CGFloat
  var bottomPadding: CGFloat
  var titleStyle: AppTextStyle
  var descriptionStyle: AppTextStyle
  /// Of the texts, so they wrap as in the design
  var textWidth: CGFloat
  #if os(iOS)
  /// Between the texts and the buttons below them
  var buttonsTopPadding: CGFloat
  #endif

  #if os(macOS)
  static let mac = OtherDeviceDialogLayout(
    width: 560,
    topPadding: 96,
    bottomPadding: 82,
    titleStyle: .headlineS,
    descriptionStyle: .bodyM,
    textWidth: 285
  )
  #else
  static let phone = OtherDeviceDialogLayout(
    width: 480,
    topPadding: 96,
    bottomPadding: 48,
    titleStyle: .headlineS,
    descriptionStyle: .bodyM,
    textWidth: 285,
    buttonsTopPadding: 24
  )
  static let tablet = OtherDeviceDialogLayout(
    width: 480,
    topPadding: 96,
    bottomPadding: 64,
    titleStyle: .headlineM,
    descriptionStyle: .bodyL,
    textWidth: 400,
    buttonsTopPadding: 32
  )
  #endif
}

struct OtherDeviceDialog: View {
  /// Page installing the app on the device, which the QR codes open
  static let url = URL(string: "https://www.ghostery.com/downloads/extension")!.tagged(campaign: "banner")
  /// Below the title, and in the item of the banner opening the dialog
  static let description = Strings.description

  var onClose: () -> Void

  @CurrentLayout private var layout: OtherDeviceDialogLayout
  #if os(iOS)
  @State private var copyConfirmation = CopyConfirmation()
  #endif

  var body: some View {
    let layout = self.layout

    AppDialog(width: layout.width, onClose: onClose) {
      VStack(spacing: 0) {
        QRCodeImage(url: Self.url)
          .frame(width: Constants.qrCodeSize, height: Constants.qrCodeSize)
          .accessibilityLabel(Strings.qrCode)
          .padding(.bottom, Constants.qrCodeBottomPadding)

        VStack(spacing: Constants.textSpacing) {
          Text(Strings.title)
            .textStyle(layout.titleStyle)
            .foregroundColor(Colors.foregroundPrimary)
            .accessibilityAddTraits(.isHeader)
          Text(Strings.description)
            .textStyle(layout.descriptionStyle)
            .foregroundColor(Colors.foregroundSecondary)
            .fixedSize(horizontal: false, vertical: true)
        }
        .multilineTextAlignment(.center)
        .frame(maxWidth: layout.textWidth)

        #if os(iOS)
        buttons
          .padding(.top, layout.buttonsTopPadding)
        #endif
      }
      .frame(maxWidth: .infinity)
      .padding(.top, layout.topPadding)
      .padding(.bottom, layout.bottomPadding)
    }
  }

  #if os(iOS)
  // The link of the QR code, for when it can't be scanned
  private var buttons: some View {
    // Side by side, or one below the other when their titles are too long
    // for that, like in some languages on iPhones
    ViewThatFits(in: .horizontal) {
      HStack(spacing: Constants.buttonsSpacing) {
        copyButton
        shareButton
      }
      .fixedSize()

      VStack(spacing: Constants.buttonsSpacing) {
        shareButton
        copyButton
      }
      .padding(.horizontal, Constants.stackedButtonsPadding)
    }
  }

  private var copyButton: some View {
    Button {
      copyConfirmation.copy(Self.url.absoluteString)
    } label: {
      // As wide as the longer of the title and the confirmation, which
      // replaces it for a moment
      ZStack {
        Text(Strings.copyLink)
          .opacity(copyConfirmation.isShown ? 0 : 1)
        Text(CopyConfirmation.message)
          .opacity(copyConfirmation.isShown ? 1 : 0)
      }
      .padding(.horizontal, Constants.buttonLabelPadding)
    }
    .buttonStyle(AppButtonStyle(kind: .secondaryGray, size: .large))
    .accessibilityLabel(Strings.copyLink)
  }

  private var shareButton: some View {
    ShareLink(item: Self.url) {
      Text(Strings.shareLink)
        .padding(.horizontal, Constants.buttonLabelPadding)
    }
    .buttonStyle(AppButtonStyle(kind: .primary, size: .large))
  }
  #endif
}

#Preview {
  OtherDeviceDialog(onClose: {})
    .padding(40)
}
