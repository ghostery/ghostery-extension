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
}

fileprivate enum Strings {
  // You can translate your strings here
  static let title = String(localized: "Become a contributor", comment: "Title of the Contribute section")
  static let description = String(localized: "Help Ghostery fight for a web where privacy is a basic human right.")
  static let subtitle = String(localized: "As a Contributor, you’ll support the development of the entire Ghostery Privacy Suite", comment: "Ghostery Privacy Suite is the name of all Ghostery’s products")
}

fileprivate enum URLs {
  static let shop = URL(string: "https://www.ghostery.com/shop")!.tagged(campaign: "contribute")
  // Subscriptions page of the App Store
  static let manageSubscription = URL(string: "macappstores://apps.apple.com/account/subscriptions")!
}

// Replaces the donation while the user has a monthly or yearly one
fileprivate let subscriptionItem = Contribution(
  id: "donate",
  image: Icons.contributionSubscribed,
  title: String(localized: "You're amazing!", comment: "Shown to users with a monthly or yearly donation"),
  description: String(localized: "Thank you for your support in Ghostery's fight for a web where privacy is a basic human right!"),
  actionTitle: String(localized: "Manage subscription", comment: "Opens the subscriptions of the user in the App Store"),
  action: .open(URLs.manageSubscription),
  isPrimary: false
)

fileprivate let otherItems = [
  Contribution(
    id: "shop",
    image: Icons.contributionShop,
    title: String(localized: "Wear your belief", comment: "Title of the card about the shop with Ghostery’s clothes and accessories"),
    description: String(localized: "With the Ghostery apparel and accessories, you can help spread awareness of online privacy in the real world"),
    actionTitle: String(localized: "Visit Ghostery Shop"),
    action: .open(URLs.shop),
    isPrimary: false
  ),
  Contribution(
    id: "share",
    image: Icons.contributionShare,
    title: String(localized: "Spread the word", comment: "Title and button of the card about telling others about Ghostery"),
    description: String(localized: "Receiving all this help is crucial to Ghostery’s existence. We welcome everyone to our growing community!"),
    actionTitle: String(localized: "Spread the word", comment: "Title and button of the card about telling others about Ghostery"),
    action: .showDialog(.spreadTheWord),
    isPrimary: false
  ),
]

struct BecomeContributorView: View {
  @Environment(\.performAction) private var performAction
  @Environment(Donations.self) private var donations
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
      // The cards stretch to the tallest one, so their buttons line up
      HStack(alignment: .top, spacing: Constants.cardsSpacing) {
        ForEach([donations.isSubscribed ? subscriptionItem : donateItem] + otherItems) { contribution in
          ContributionCard(contribution: contribution, action: { performAction(contribution.action) })
            .frame(maxHeight: .infinity)
        }
      }
      .fixedSize(horizontal: false, vertical: true)
      .padding(.horizontal, Constants.cardsHorizontalPadding)
    } footer: {
      Banner()
    }
    // A subscription can expire while the app runs
    .task { await donations.refreshSubscription() }
  }

  private var donateItem: Contribution {
    Contribution(
      id: "donate",
      image: Icons.contributionDonate,
      title: String(localized: "Support our mission", comment: "Title of the card about donations"),
      description: String(localized: "Every contribution, big or small, is invaluable to our mission and future."),
      actionTitle: String(localized: "Donate now"),
      action: .perform { showsDonation = true },
      isPrimary: true
    )
  }
}

// MARK: - Contribution card

struct Contribution: Identifiable {
  let id: String
  let image: String
  let title: String
  let description: String
  let actionTitle: String
  let action: MainAction
  let isPrimary: Bool
}

struct ContributionCard: View {
  let contribution: Contribution
  var action: () -> Void

  var body: some View {
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
    .cardBackground(cornerRadius: Constants.cardCornerRadius)
    .singleActionAccessibility(label: [contribution.title, contribution.description, contribution.actionTitle])
  }
}

struct BecomeContributorView_Previews: PreviewProvider {
  static var previews: some View {
    BecomeContributorView()
      .environment(Donations())
      .frame(width: 736, height: 752)
  }
}
