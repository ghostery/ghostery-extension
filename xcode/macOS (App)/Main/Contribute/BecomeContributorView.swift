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

  static let cardsSpacing: CGFloat = 4
  static let cardsHorizontalPadding: CGFloat = 20

  static let cardPadding: CGFloat = 4
  static let cardCornerRadius: CGFloat = 12
  static let cardContentPadding: CGFloat = 12
  static let cardTextSpacing: CGFloat = 4
  static let cardTextTopPadding: CGFloat = 12
  static let cardTextBottomPadding: CGFloat = 20

  static let imageWidth: CGFloat = 220
  static let imageHeight: CGFloat = 178
  static let imageCornerRadius: CGFloat = 12

  static let borderLineWidth: CGFloat = 1
}

fileprivate enum Strings {
  // You can translate your strings here
  static let title = "Become a contributor"
  static let description = "Help Ghostery fight for a web where privacy is a basic human right."
  static let subtitle = "As a Contributor, you’ll support the development of the entire Ghostery Privacy Suite"
}

fileprivate let contributions = [
  Contribution(
    id: "donate",
    image: Icons.contributionDonate,
    title: "Support our mission",
    description: "Every contribution, big or small, is invaluable to our mission and future.",
    actionTitle: "Donate now",
    isPrimary: true
  ),
  Contribution(
    id: "shop",
    image: Icons.contributionShop,
    title: "Wear your belief",
    description: "With the Ghostery apparel and accessories, you can help spread awareness of online privacy in the real world",
    actionTitle: "Visit Ghostery Shop",
    isPrimary: false
  ),
  Contribution(
    id: "share",
    image: Icons.contributionShare,
    title: "Spread the word",
    description: "Receiving all this help is crucial to Ghostery’s existence. We welcome everyone to our growing community!",
    actionTitle: "Spread the word",
    isPrimary: false
  ),
]

struct BecomeContributorView: View {
  var body: some View {
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
      // The cards stretch to the tallest one, so their buttons line up
      HStack(alignment: .top, spacing: Constants.cardsSpacing) {
        ForEach(contributions) { contribution in
          ContributionCard(contribution: contribution, action: {})
            .frame(maxHeight: .infinity)
        }
      }
      .fixedSize(horizontal: false, vertical: true)
      .padding(.horizontal, Constants.cardsHorizontalPadding)
    } footer: {
      OtherDeviceBanner()
    }
  }
}

// MARK: - Contribution card

struct Contribution: Identifiable {
  let id: String
  let image: String
  let title: String
  let description: String
  let actionTitle: String
  let isPrimary: Bool
}

struct ContributionCard: View {
  let contribution: Contribution
  var action: () -> Void

  var body: some View {
    let shape = RoundedRectangle(cornerRadius: Constants.cardCornerRadius)

    VStack(alignment: .leading, spacing: 0) {
      Image(decorative: contribution.image)
        .frame(width: Constants.imageWidth, height: Constants.imageHeight)
        .clipShape(RoundedRectangle(cornerRadius: Constants.imageCornerRadius))

      VStack(alignment: .leading, spacing: Constants.cardTextSpacing) {
        Text(contribution.title)
          .textStyle(.labelL)
          .foregroundColor(Colors.foregroundPrimary)
        Text(contribution.description)
          .textStyle(.bodyS)
          .foregroundColor(Colors.foregroundSecondary)
          .fixedSize(horizontal: false, vertical: true)
      }
      .frame(maxWidth: .infinity, alignment: .leading)
      .padding(.horizontal, Constants.cardContentPadding)
      .padding(.top, Constants.cardTextTopPadding)
      .padding(.bottom, Constants.cardTextBottomPadding)

      Spacer(minLength: 0)

      Button(action: action) {
        Text(contribution.actionTitle)
      }
      .buttonStyle(AppButtonStyle(kind: contribution.isPrimary ? .primary : .secondary))
      .padding(.horizontal, Constants.cardContentPadding)
      .padding(.bottom, Constants.cardContentPadding)
    }
    .padding(Constants.cardPadding)
    .frame(width: Constants.imageWidth + 2 * Constants.cardPadding)
    .background(shape.fill(Colors.bgPrimary))
    .overlay(shape.strokeBorder(Colors.borderPrimary, lineWidth: Constants.borderLineWidth))
    // Read as one element, with the action of its button, whose title
    // the combined label leaves out
    .accessibilityElement(children: .combine)
    .accessibilityLabel([contribution.title, contribution.description, contribution.actionTitle].joined(separator: ", "))
  }
}

struct BecomeContributorView_Previews: PreviewProvider {
  static var previews: some View {
    BecomeContributorView()
      .frame(width: 736, height: 752)
  }
}
