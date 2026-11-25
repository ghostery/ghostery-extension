//
//  DonationView.swift
//  Ghostery
//
//  Donation options, opened from the Contribute section.
//

import SwiftUI

/// Sizes of the page, which differ between the Mac, iPhones and iPads
fileprivate struct DonationPageLayout: PlatformLayout {
  #if os(macOS)
  /// Around the buttons at the top, which are in the title bar on iPhones
  /// and iPads
  var headerPadding: EdgeInsets
  var buttonStyle: AppTextStyle
  #endif
  var optionsHorizontalPadding: CGFloat
  /// Around the links to the legal pages
  var legalPadding: EdgeInsets

  #if os(macOS)
  static let mac = DonationPageLayout(
    headerPadding: EdgeInsets(top: 40, leading: 40, bottom: 16, trailing: 40),
    buttonStyle: .labelM,
    optionsHorizontalPadding: 40,
    legalPadding: EdgeInsets(top: 10, leading: 0, bottom: 24, trailing: 0)
  )
  #else
  static let phone = DonationPageLayout(
    optionsHorizontalPadding: 0,
    legalPadding: EdgeInsets(top: 16, leading: 0, bottom: 0, trailing: 0)
  )
  static let tablet = phone
  #endif
}

struct DonationView: View {
  /// Goes back to the Contribute section, also once the user has donated
  var onBack: () -> Void

  @CurrentLayout private var layout: DonationPageLayout

  var body: some View {
    SectionScrollView {
      #if os(macOS)
      HStack {
        SectionBackButton(style: layout.buttonStyle, action: onBack)
        Spacer()
        DonationRestoreButton()
          .buttonStyle(.plain)
          .textStyle(layout.buttonStyle)
      }
      .foregroundColor(Colors.foregroundPrimary)
      .padding(layout.headerPadding)
      #endif

      DonationOptions(onDonated: onBack)
        .padding(.horizontal, layout.optionsHorizontalPadding)

      DonationLegalLinks()
        .padding(layout.legalPadding)
    }
  }
}

#Preview {
  DonationView(onBack: {})
    #if os(macOS)
    .frame(width: 736, height: 570)
    #endif
}
