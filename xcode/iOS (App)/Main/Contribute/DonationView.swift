//
//  DonationView.swift
//  Ghostery
//
//  Donation options, opened from the Contribute section.
//

import SwiftUI

fileprivate enum Constants {
  // Between the buttons at the top and the donation options
  static let headerPhoneBottomPadding: CGFloat = 26
  static let headerTabletBottomPadding: CGFloat = 36
  // The restore button can be tapped also a bit around it, as it's small
  static let restoreHitPadding: CGFloat = 12

  static let legalTopPadding: CGFloat = 16
}

struct DonationView: View {
  var onBack: () -> Void

  var body: some View {
    SectionScrollView { layout in
      HStack {
        SectionBackButton(style: layout.backStyle, action: onBack)
        Spacer()
        DonationRestoreButton(hitPadding: Constants.restoreHitPadding)
          .buttonStyle(.plain)
          .textStyle(layout.backStyle)
          .foregroundColor(Colors.foregroundPrimary)
      }
      .padding(.bottom, layout.isTablet ? Constants.headerTabletBottomPadding : Constants.headerPhoneBottomPadding)

      DonationOptions(layout: layout.isTablet ? .tablet : .phone, onDonated: onBack)

      DonationLegalLinks()
        .padding(.top, Constants.legalTopPadding)
    }
  }
}

struct DonationView_Previews: PreviewProvider {
  static var previews: some View {
    DonationView(onBack: {})
      .environment(Donations())
  }
}
