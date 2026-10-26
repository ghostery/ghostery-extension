//
//  Contributions.swift
//  Ghostery
//
//  Cards of the Contribute section: the donation, or the subscription of
//  the user, the shop, and sharing Ghostery.
//

import SwiftUI

fileprivate enum Constants {
  static let cardsSpacing: CGFloat = 4
  static let cardCornerRadius: CGFloat = 12

  #if os(iOS)
  // Of the image without a wider version, which fades into its background
  static let narrowImageFade: CGFloat = 0.15
  #endif
}

fileprivate enum Strings {
  // You can translate your strings here
  static let spreadTheWord = String(localized: "Spread the word", comment: "Title and button of the card about telling others about Ghostery")
}

fileprivate enum URLs {
  static let shop = URL(string: "https://www.ghostery.com/shop")!.tagged(campaign: "contribute")
  // Subscriptions page of the App Store
  static let manageSubscription = URL.appStore("account/subscriptions")
}

// Replaces the donation while the user has a monthly or yearly one
fileprivate let subscriptionItem = Contribution(
  id: "donate",
  image: .contributionSubscribed,
  imageBackground: Color(hex: "#00BCF3"),
  title: String(localized: "You're amazing!", comment: "Shown to users with a monthly or yearly donation"),
  description: String(localized: "Thank you for your support in Ghostery's fight for a web where privacy is a basic human right!"),
  actionTitle: String(localized: "Manage subscription", comment: "Opens the subscriptions of the user in the App Store"),
  action: .open(URLs.manageSubscription),
  isPrimary: false
)

fileprivate let otherItems = [
  Contribution(
    id: "shop",
    image: .contributionShop,
    title: String(localized: "Wear your belief", comment: "Title of the card about the shop with Ghostery’s clothes and accessories"),
    description: String(localized: "With the Ghostery apparel and accessories, you can help spread awareness of online privacy in the real world"),
    actionTitle: String(localized: "Visit Ghostery Shop"),
    action: .open(URLs.shop),
    isPrimary: false
  ),
  Contribution(
    id: "share",
    image: .contributionShare,
    title: Strings.spreadTheWord,
    description: SpreadTheWordDialog.description,
    actionTitle: Strings.spreadTheWord,
    action: .showDialog(.spreadTheWord),
    isPrimary: false
  ),
]

/// Sizes of the cards, which differ between the Mac, iPhones and iPads
struct ContributionCardLayout: PlatformLayout {
  /// Whether the cards are in a row, rather than one below the other
  var isRow: Bool
  /// Whether the image is before the texts, rather than above them
  var isImageBefore: Bool
  /// Of the card, which is otherwise as wide as the section
  var width: CGFloat?
  var padding: CGFloat
  /// Of the image, which is otherwise as wide as the card without its texts
  var imageWidth: CGFloat?
  var imageHeight: CGFloat
  var imageCornerRadii: RectangleCornerRadii
  /// Of the texts and the button, when the image is before them
  var columnWidth: CGFloat?
  /// Between the title and the description
  var textSpacing: CGFloat
  var textPadding: EdgeInsets
  var buttonPadding: EdgeInsets

  #if os(macOS)
  static let mac = ContributionCardLayout(
    isRow: true,
    isImageBefore: false,
    width: 228,
    padding: 4,
    imageWidth: 220,
    imageHeight: 178,
    imageCornerRadii: RectangleCornerRadii(topLeading: 12, bottomLeading: 12, bottomTrailing: 12, topTrailing: 12),
    columnWidth: nil,
    textSpacing: 4,
    textPadding: EdgeInsets(top: 12, leading: 12, bottom: 20, trailing: 12),
    buttonPadding: EdgeInsets(top: 0, leading: 12, bottom: 12, trailing: 12)
  )
  #else
  // The image fills the top of the card, whose corners it follows
  static let phone = ContributionCardLayout(
    isRow: false,
    isImageBefore: false,
    width: nil,
    padding: 0,
    imageWidth: nil,
    imageHeight: 178,
    imageCornerRadii: RectangleCornerRadii(topLeading: 12, topTrailing: 12),
    columnWidth: nil,
    textSpacing: 12,
    textPadding: EdgeInsets(top: 16, leading: 16, bottom: 12, trailing: 16),
    buttonPadding: EdgeInsets(top: 0, leading: 16, bottom: 16, trailing: 16)
  )
  static let tablet = ContributionCardLayout(
    isRow: false,
    isImageBefore: true,
    width: nil,
    padding: 8,
    imageWidth: nil,
    imageHeight: 194,
    imageCornerRadii: RectangleCornerRadii(topLeading: 12, bottomLeading: 12, bottomTrailing: 12, topTrailing: 12),
    columnWidth: 335,
    textSpacing: 12,
    textPadding: EdgeInsets(top: 20, leading: 32, bottom: 12, trailing: 32),
    buttonPadding: EdgeInsets(top: 0, leading: 32, bottom: 20, trailing: 32)
  )
  #endif
}

/// Cards of the ways to contribute, in a row on the Mac, and one below the
/// other on iPhones and iPads
struct ContributionList: View {
  var onDonate: @MainActor () -> Void

  @CurrentLayout private var layout: ContributionCardLayout
  @Environment(\.performAction) private var performAction
  private var donations: Donations { .shared }

  var body: some View {
    let layout = self.layout
    let contributions = [donations.isSubscribed ? subscriptionItem : donateItem] + otherItems

    CardStack(data: contributions, isRow: layout.isRow, spacing: Constants.cardsSpacing) { contribution in
      ContributionCard(contribution: contribution, layout: layout, action: { performAction(contribution.action) })
    }
    // A subscription can expire while the app runs
    .task { await donations.refreshSubscription() }
  }

  private var donateItem: Contribution {
    Contribution(
      id: "donate",
      image: .contributionDonate,
      title: String(localized: "Support our mission", comment: "Title of the card about donations"),
      description: String(localized: "Every contribution, big or small, is invaluable to our mission and future."),
      actionTitle: String(localized: "Donate now"),
      action: .perform(onDonate),
      isPrimary: true
    )
  }
}

// MARK: - Contribution card

private struct Contribution: Identifiable {
  let id: String
  let image: ImageResource
  /// Around the image on iPhones and iPads, when it has no wider version
  /// for their cards
  var imageBackground: Color? = nil
  let title: String
  let description: String
  let actionTitle: String
  let action: MainAction
  let isPrimary: Bool
}

private struct ContributionCard: View {
  let contribution: Contribution
  let layout: ContributionCardLayout
  var action: () -> Void

  var body: some View {
    let stack = layout.isImageBefore
      ? AnyLayout(HStackLayout(spacing: 0))
      : AnyLayout(VStackLayout(alignment: .leading, spacing: 0))

    stack {
      image

      VStack(alignment: .leading, spacing: 0) {
        VStack(alignment: .leading, spacing: layout.textSpacing) {
          Text(contribution.title)
            .textStyle(.labelL)
            .foregroundColor(Colors.foregroundPrimary)
          Text(contribution.description)
            .textStyle(.bodyS)
            .foregroundColor(Colors.foregroundSecondary)
            .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(layout.textPadding)

        // The buttons of the cards in a row line up at their bottom,
        // and otherwise follow the texts
        if layout.isRow {
          Spacer(minLength: 0)
        }

        Button(action: action) {
          Text(contribution.actionTitle)
        }
        .buttonStyle(AppButtonStyle(kind: contribution.isPrimary ? .primary : .secondary))
        .padding(layout.buttonPadding)
      }
      .frame(width: layout.columnWidth)
    }
    .padding(layout.padding)
    .frame(width: layout.width)
    .cardBackground(cornerRadius: Constants.cardCornerRadius)
    .singleActionAccessibility(label: [contribution.title, contribution.description, contribution.actionTitle])
  }

  // Without a width, as wide as the card allows
  private var image: some View {
    Color.clear
      .frame(width: layout.imageWidth, height: layout.imageHeight)
      .overlay {
        #if os(iOS)
        if let background = contribution.imageBackground {
          // In the middle, fading into its background on the sides
          background.overlay {
            Image(contribution.image)
              .resizable()
              .accessibilityHidden(true)
              .scaledToFit()
              .mask(
                LinearGradient(
                  stops: [
                    .init(color: .clear, location: 0),
                    .init(color: .black, location: Constants.narrowImageFade),
                    .init(color: .black, location: 1 - Constants.narrowImageFade),
                    .init(color: .clear, location: 1),
                  ],
                  startPoint: .leading,
                  endPoint: .trailing
                )
              )
          }
        } else {
          filledImage
        }
        #else
        filledImage
        #endif
      }
      .clipShape(UnevenRoundedRectangle(cornerRadii: layout.imageCornerRadii))
  }

  private var filledImage: some View {
    Image(contribution.image)
      .resizable()
      .accessibilityHidden(true)
      .scaledToFill()
  }
}
