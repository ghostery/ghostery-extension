//
//  LearningZoneView.swift
//  Ghostery
//
//  Learning Zone section of the main window.
//

import SwiftUI

fileprivate enum Constants {
  static let articlesSpacing: CGFloat = 4
  static let articlesHorizontalPadding: CGFloat = 20

  static let cardPadding: CGFloat = 24
  static let cardSpacing: CGFloat = 32
  static let cardCornerRadius: CGFloat = 12
  static let cardTextSpacing: CGFloat = 12
  static let cardTitleSpacing: CGFloat = 4
  static let buttonLabelPadding: CGFloat = 4

  static let imageWidth: CGFloat = 220
  static let imageHeight: CGFloat = 178
  static let imageCornerRadius: CGFloat = 12
  static let badgeHorizontalPadding: CGFloat = 8
  static let badgeVerticalPadding: CGFloat = 4
  static let badgeBottomPadding: CGFloat = 8
  static let badgeBlurRadius: CGFloat = 4
  static let badgeBackgroundOpacity: Double = 0.8
  static let badgeBorderOpacity: Double = 0.15

  static let borderLineWidth: CGFloat = 1
}

fileprivate enum Strings {
  // You can translate your strings here
  static let title = "Privacy,\nexplained simply."
  static let description = "Privacy shouldn’t be complicated. Explore our guides, follow the latest privacy news, and discover how to make the web work better for you."
}

// Placeholder data, to be replaced with the latest Privacy Digest and blog post
fileprivate let placeholderArticles = [
  LearningArticle(
    id: "privacy-digest",
    badge: "The latest Privacy Digest",
    image: nil,
    title: "What’s happening in privacy right now?",
    subtitle: "Privacy Digest 19/26 · September 7, 2026",
    description: "From ad tracking and AI surveillance to data brokers and identity verification, our latest edition explores the privacy stories shaping the internet today.",
    actionTitle: "Read the latest Privacy Digest"
  ),
  LearningArticle(
    id: "newsletter",
    badge: "Stay in the know",
    image: Icons.learningZoneNewsletter,
    title: "Stay in the know",
    subtitle: "Privacy tips, news & insights—straight to your inbox.",
    description: "Get Ghostery’s Privacy Digest every two weeks. We curate the privacy stories worth knowing about and share practical ways to stay safer and more informed online.",
    actionTitle: "Sign up",
    note: "No spam. Just useful privacy news and tips."
  ),
  LearningArticle(
    id: "blog-post",
    badge: "From the Ghostery Blog",
    image: nil,
    title: "How to Block Ads on Dailymotion",
    subtitle: "August 31, 2026 · Guide",
    description: "Tired of ads interrupting your videos? Learn how to block ads on Dailymotion and enjoy a cleaner, less distracting browsing experience.",
    actionTitle: "Read the post"
  ),
]

struct LearningZoneView: View {
  private let articles = placeholderArticles

  var body: some View {
    SectionScrollView {
      SectionHeader(
        title: Strings.title,
        description: Strings.description,
        descriptionStyle: .bodyS,
        image: Icons.learningZoneHeader
      )
      VStack(spacing: Constants.articlesSpacing) {
        ForEach(articles) { article in
          LearningArticleCard(article: article, action: {})
        }
      }
      .padding(.horizontal, Constants.articlesHorizontalPadding)
    } footer: {
      OtherDeviceBanner()
    }
  }
}

// MARK: - Article card

struct LearningArticle: Identifiable {
  let id: String
  let badge: String
  /// Empty space is shown in its place until the image is available
  let image: String?
  let title: String
  let subtitle: String
  let description: String
  let actionTitle: String
  var note: String? = nil
}

struct LearningArticleCard: View {
  let article: LearningArticle
  var action: () -> Void

  var body: some View {
    let shape = RoundedRectangle(cornerRadius: Constants.cardCornerRadius)

    HStack(spacing: Constants.cardSpacing) {
      image

      VStack(alignment: .leading, spacing: Constants.cardTextSpacing) {
        VStack(alignment: .leading, spacing: Constants.cardTitleSpacing) {
          Text(article.title)
            .textStyle(.headlineS)
            .foregroundColor(Colors.foregroundPrimary)
          Text(article.subtitle)
            .textStyle(.labelS)
            .foregroundColor(Colors.foregroungTertiary)
        }
        Text(article.description)
          .textStyle(.bodyS)
          .foregroundColor(Colors.foregroundSecondary)
          .fixedSize(horizontal: false, vertical: true)
        Button(action: action) {
          HStack(spacing: 0) {
            Text(article.actionTitle)
              .padding(.horizontal, Constants.buttonLabelPadding)
            Image(Icons.arrowRight)
          }
        }
        .buttonStyle(AppButtonStyle(kind: .secondary, size: .small))
        if let note = article.note {
          Text(note)
            .textStyle(.bodyS)
            .foregroundColor(Colors.foregroundSecondary)
        }
      }
      .frame(maxWidth: .infinity, alignment: .leading)
    }
    .padding(Constants.cardPadding)
    .background(shape.fill(Colors.bgPrimary))
    .overlay(shape.strokeBorder(Colors.borderPrimary, lineWidth: Constants.borderLineWidth))
    // Read as one element, with the action of its button
    .accessibilityElement(children: .combine)
    .accessibilityLabel(accessibilityLabel)
  }

  // The combined label leaves out the title of the button and reads the badge
  // after the text, so it's set here, with the badge first unless it repeats
  // the title
  private var accessibilityLabel: String {
    [
      article.badge == article.title ? nil : article.badge,
      article.title,
      article.subtitle,
      article.description,
      article.actionTitle,
      article.note,
    ]
    .compactMap { $0 }
    .joined(separator: ", ")
  }

  private var image: some View {
    ZStack(alignment: .bottom) {
      backdrop
      // Frosted glass of the badge: the badge only ever covers its image,
      // so the blurred image under a white layer is seen through its shape
      backdrop
        .blur(radius: Constants.badgeBlurRadius, opaque: true)
        .overlay(Color.white.opacity(Constants.badgeBackgroundOpacity))
        .mask(alignment: .bottom) {
          badge
            .background(Capsule())
            .padding(.bottom, Constants.badgeBottomPadding)
        }
      badge
        .overlay(Capsule().strokeBorder(Color.black.opacity(Constants.badgeBorderOpacity), lineWidth: Constants.borderLineWidth))
        .padding(.bottom, Constants.badgeBottomPadding)
    }
    .frame(width: Constants.imageWidth, height: Constants.imageHeight)
    .clipShape(RoundedRectangle(cornerRadius: Constants.imageCornerRadius))
  }

  // The image, or empty space until it's available
  private var backdrop: some View {
    ZStack {
      Colors.foregroundPrimary
      if let image = article.image {
        Image(decorative: image)
      }
    }
  }

  private var badge: some View {
    Text(article.badge)
      .textStyle(.labelS)
      .foregroundColor(Colors.foregroundPrimary)
      .lineLimit(1)
      .padding(.horizontal, Constants.badgeHorizontalPadding)
      .padding(.vertical, Constants.badgeVerticalPadding)
  }
}

struct LearningZoneView_Previews: PreviewProvider {
  static var previews: some View {
    LearningZoneView()
      .frame(width: 736, height: 1058)
  }
}
