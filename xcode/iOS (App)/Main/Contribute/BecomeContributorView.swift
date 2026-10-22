//
//  BecomeContributorView.swift
//  Ghostery
//
//  Contribute section.
//

import SwiftUI

fileprivate enum Constants {
  static let subtitleBottomPadding: CGFloat = 16
}

fileprivate enum Strings {
  // You can translate your strings here
  static let title = String(localized: "Become a contributor", comment: "Title of the Contribute section")
  static let description = String(localized: "Help Ghostery fight for a web where privacy is a basic human right.")
  static let subtitle = String(localized: "As a Contributor, you’ll support the development of the entire Ghostery Privacy Suite", comment: "Ghostery Privacy Suite is the name of all Ghostery’s products")
}

struct BecomeContributorView: View {
  @State private var showsDonation = false

  var body: some View {
    if showsDonation {
      DonationView(onBack: { showsDonation = false })
    } else {
      contributions
    }
  }

  private var contributions: some View {
    SectionScrollView { layout in
      SectionHeader(
        title: Strings.title,
        description: Strings.description,
        // Smaller on iPhones, and across the screen
        descriptionStyle: layout.isTablet ? nil : .bodyM,
        descriptionWidth: layout.isTablet ? nil : .infinity,
        layout: layout
      )

      Text(Strings.subtitle)
        .textStyle(.labelM)
        .foregroundColor(Colors.foregroundPrimary)
        .fixedSize(horizontal: false, vertical: true)
        .padding(.bottom, Constants.subtitleBottomPadding)

      ContributionList(layout: layout.isTablet ? .tablet : .phone, onDonate: { showsDonation = true })

      Banner()
        .padding(.top, layout.bannerTopPadding)
    }
  }
}

struct BecomeContributorView_Previews: PreviewProvider {
  static var previews: some View {
    BecomeContributorView()
      .environment(Donations())
  }
}
