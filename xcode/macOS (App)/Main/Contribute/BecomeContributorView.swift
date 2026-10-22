//
//  BecomeContributorView.swift
//  Ghostery
//
//  Contribute section of the main window.
//

import SwiftUI

fileprivate enum Constants {
  static let subtitleLeadingPadding: CGFloat = 24
  static let subtitleTrailingPadding: CGFloat = 20
  static let subtitleBottomPadding: CGFloat = 12

  static let cardsHorizontalPadding: CGFloat = 20
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
    SectionScrollView {
      SectionHeader(
        title: Strings.title,
        description: Strings.description,
        descriptionStyle: .bodyL,
        image: Icons.contributeHeader
      )
      Text(Strings.subtitle)
        .textStyle(.labelM)
        .foregroundColor(Colors.foregroundPrimary)
        .multilineTextAlignment(.center)
        .frame(maxWidth: .infinity)
        .padding(.leading, Constants.subtitleLeadingPadding)
        .padding(.trailing, Constants.subtitleTrailingPadding)
        .padding(.bottom, Constants.subtitleBottomPadding)
      ContributionList(layout: .mac, onDonate: { showsDonation = true })
        .padding(.horizontal, Constants.cardsHorizontalPadding)
    } footer: {
      Banner()
    }
  }
}

struct BecomeContributorView_Previews: PreviewProvider {
  static var previews: some View {
    BecomeContributorView()
      .environment(Donations())
      .frame(width: 736, height: 752)
  }
}
