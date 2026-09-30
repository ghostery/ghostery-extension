//
//  OtherDeviceDialog.swift
//  Ghostery
//
//  Dialog with the QR code installing the app on other devices,
//  opened from the banner.
//

import SwiftUI

fileprivate enum Constants {
  static let width: CGFloat = 560
  static let topPadding: CGFloat = 96
  static let bottomPadding: CGFloat = 82
  static let spacing: CGFloat = 32
  static let textSpacing: CGFloat = 8
  static let textWidth: CGFloat = 285

  static let qrCodeSize: CGFloat = 200
  static let logoPadding: CGFloat = 8
}

fileprivate enum Strings {
  // You can translate your strings here
  static let title = "Use this app on another device"
  static let description = "Scan the QR code to install the app on your phone or tablet."
  static let qrCode = "QR code"
}

struct OtherDeviceDialog: View {
  var onClose: () -> Void

  var body: some View {
    AppDialog(width: Constants.width, onClose: onClose) {
      VStack(spacing: Constants.spacing) {
        qrCode

        VStack(spacing: Constants.textSpacing) {
          Text(Strings.title)
            .textStyle(.headlineS)
            .foregroundColor(Colors.foregroundPrimary)
            .accessibilityAddTraits(.isHeader)
          Text(Strings.description)
            .textStyle(.bodyM)
            .foregroundColor(Colors.foregroundSecondary)
            .fixedSize(horizontal: false, vertical: true)
        }
        .multilineTextAlignment(.center)
        .frame(width: Constants.textWidth)
      }
      .frame(maxWidth: .infinity)
      .padding(.top, Constants.topPadding)
      .padding(.bottom, Constants.bottomPadding)
    }
  }

  // The QR code, with the logo in its middle
  private var qrCode: some View {
    Image(Icons.qrCode)
      .resizable()
      .frame(width: Constants.qrCodeSize, height: Constants.qrCodeSize)
      .overlay {
        Image(decorative: Icons.qrCodeLogo)
          .padding(Constants.logoPadding)
          .background(Circle().fill(Colors.bgPrimary))
      }
      .accessibilityElement(children: .ignore)
      .accessibilityLabel(Strings.qrCode)
      .accessibilityAddTraits(.isImage)
  }
}

struct OtherDeviceDialog_Previews: PreviewProvider {
  static var previews: some View {
    OtherDeviceDialog(onClose: {})
      .padding(40)
  }
}
