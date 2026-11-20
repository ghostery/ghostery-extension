//
//  DonationView.swift
//  Ghostery
//
//  Donation options, opened from the Contribute section.
//

import SwiftUI

/// Sizes of the page, which differ between the Mac, iPhones and iPads
fileprivate struct DonationPageLayout: PlatformLayout {
  /// Around the buttons at the top
  var headerPadding: EdgeInsets
  var buttonStyle: AppTextStyle
  /// Around the title of the button restoring the donations, where it can
  /// also be tapped, as it's small
  var restoreHitPadding: CGFloat
  var optionsHorizontalPadding: CGFloat
  /// Around the links to the legal pages
  var legalPadding: EdgeInsets

  #if os(macOS)
  static let mac = DonationPageLayout(
    headerPadding: EdgeInsets(top: 40, leading: 40, bottom: 16, trailing: 40),
    buttonStyle: .labelM,
    restoreHitPadding: 0,
    optionsHorizontalPadding: 40,
    legalPadding: EdgeInsets(top: 10, leading: 0, bottom: 24, trailing: 0)
  )
  #else
  static let phone = DonationPageLayout(
    headerPadding: EdgeInsets(top: 0, leading: 0, bottom: 26, trailing: 0),
    buttonStyle: .labelM,
    restoreHitPadding: 12,
    optionsHorizontalPadding: 0,
    legalPadding: EdgeInsets(top: 16, leading: 0, bottom: 0, trailing: 0)
  )
  static let tablet = DonationPageLayout(
    headerPadding: EdgeInsets(top: 0, leading: 0, bottom: 36, trailing: 0),
    buttonStyle: .labelL,
    restoreHitPadding: 12,
    optionsHorizontalPadding: 0,
    legalPadding: EdgeInsets(top: 16, leading: 0, bottom: 0, trailing: 0)
  )
  #endif
}

struct DonationView: View {
  var onBack: () -> Void

  @CurrentLayout private var layout: DonationPageLayout

  var body: some View {
    SectionScrollView {
      HStack {
        SectionBackButton(style: layout.buttonStyle, action: onBack)
        Spacer()
        DonationRestoreButton(hitPadding: layout.restoreHitPadding)
          .buttonStyle(.plain)
          .textStyle(layout.buttonStyle)
      }
      .foregroundColor(Colors.foregroundPrimary)
      .padding(layout.headerPadding)

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
