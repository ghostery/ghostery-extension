//
//  LearningArticles.swift
//  Ghostery
//
//  Cards of the Learning Zone section: the latest Privacy Digest, the
//  newsletter, and the latest blog post.
//

import SwiftUI

fileprivate enum Constants {
  static let articlesSpacing: CGFloat = 4
  static let articleAnimationDuration: Double = 0.25

  static let cardCornerRadius: CGFloat = 12
  static let cardTextSpacing: CGFloat = 12
  static let cardTitleSpacing: CGFloat = 4
  static let buttonLabelPadding: CGFloat = 4

  static let badgeHorizontalPadding: CGFloat = 8
  static let badgeVerticalPadding: CGFloat = 4
  static let badgeBottomPadding: CGFloat = 8
  static let badgeBlurRadius: CGFloat = 4
  static let badgeBackgroundOpacity: Double = 0.8
  static let badgeBorderOpacity: Double = 0.15

  // As on the website: 4 by 8 padding around the text, inside a 1pt border,
  // in rows of two at most
  static let tagHorizontalPadding: CGFloat = 9
  static let tagVerticalPadding: CGFloat = 5
  static let tagCornerRadius: CGFloat = 4
  static let tagSpacing: CGFloat = 6
  static let tagRowSpacing: CGFloat = 4
  static let tagMaxRows = 2

  static let borderLineWidth: CGFloat = 1
}

fileprivate enum Strings {
  // You can translate your strings here
  static let digestBadge = String(localized: "The latest Privacy Digest", comment: "Privacy Digest is the name of Ghostery’s newsletter")
  static let digestTitle = String(localized: "What’s happening in privacy right now?")
  static let digestAction = String(localized: "Read the latest Privacy Digest", comment: "Privacy Digest is the name of Ghostery’s newsletter")
  static let blogBadge = String(localized: "From the Ghostery Blog")
  static let blogAction = String(localized: "Read the post", comment: "Button opening the post of the Ghostery Blog")
}

fileprivate enum URLs {
  static let campaign = "learning-zone"
  static let privacyDigest = URL(string: "https://www.ghostery.com/privacy-digest")!.tagged(campaign: campaign)
}

fileprivate extension AppTextStyle {
  // The website's style of the tags
  static let tag = AppTextStyle(size: 12, weight: .regular, lineHeight: 18)
}

fileprivate let newsletterArticle = LearningArticle(
  id: "newsletter",
  badge: String(localized: "Stay in the know", comment: "Title of the card about Ghostery’s newsletter"),
  image: Image(decorative: Icons.learningZoneNewsletter),
  title: String(localized: "Stay in the know", comment: "Title of the card about Ghostery’s newsletter"),
  subtitle: String(localized: "Privacy tips, news & insights—straight to your inbox."),
  description: String(localized: "Get Ghostery’s Privacy Digest every two weeks. We curate the privacy stories worth knowing about and share practical ways to stay safer and more informed online.", comment: "Privacy Digest is the name of Ghostery’s newsletter"),
  actionTitle: String(localized: "Sign up", comment: "Button opening the page where the user signs up for the newsletter"),
  note: String(localized: "No spam. Just useful privacy news and tips.")
)

/// Sizes of the cards, which differ between the Mac, iPhones and iPads
struct LearningCardLayout {
  /// Whether the image is above the texts, rather than before them
  var isImageAbove: Bool
  var padding: CGFloat
  /// Of the image, which is as wide as the card without it
  var imageWidth: CGFloat?
  var imageHeight: CGFloat
  var imageCornerRadii: RectangleCornerRadii
  /// Between the image and the texts
  var spacing: CGFloat
  var textPadding: EdgeInsets
  /// Of the image and the texts, when the image is before them
  var alignment: VerticalAlignment

  #if os(macOS)
  static let mac = LearningCardLayout(
    isImageAbove: false,
    padding: 24,
    imageWidth: 220,
    imageHeight: 178,
    imageCornerRadii: RectangleCornerRadii(topLeading: 12, bottomLeading: 12, bottomTrailing: 12, topTrailing: 12),
    spacing: 32,
    textPadding: EdgeInsets(),
    alignment: .center
  )
  #else
  // The image fills the top of the card, whose corners it follows
  static let phone = LearningCardLayout(
    isImageAbove: true,
    padding: 0,
    imageWidth: nil,
    imageHeight: 178,
    imageCornerRadii: RectangleCornerRadii(topLeading: 12, topTrailing: 12),
    spacing: 0,
    textPadding: EdgeInsets(top: 16, leading: 16, bottom: 16, trailing: 16),
    alignment: .center
  )
  static let tablet = LearningCardLayout(
    isImageAbove: false,
    padding: 8,
    imageWidth: 280,
    imageHeight: 194,
    imageCornerRadii: RectangleCornerRadii(topLeading: 12, bottomLeading: 12, bottomTrailing: 12, topTrailing: 12),
    spacing: 0,
    textPadding: EdgeInsets(top: 20, leading: 32, bottom: 20, trailing: 32),
    alignment: .top
  )
  #endif
}

/// Cards of the Learning Zone. The fetched items are shown only once
/// they're fetched with their images.
struct LearningArticleList: View {
  var layout: LearningCardLayout

  @Environment(\.openURL) private var openURL

  var body: some View {
    VStack(spacing: Constants.articlesSpacing) {
      if let edition = LearningZoneContent.digestEdition.value {
        LearningArticleCard(article: digestArticle(edition), layout: layout) {
          openURL(edition.url.tagged(campaign: URLs.campaign))
        }
        .transition(.opacity)
      }
      LearningArticleCard(article: newsletterArticle, layout: layout) {
        openURL(URLs.privacyDigest)
      }
      if let post = LearningZoneContent.blogPost.value {
        LearningArticleCard(article: blogArticle(post), layout: layout) {
          openURL(post.url.tagged(campaign: URLs.campaign))
        }
        .transition(.opacity)
      }
    }
    .animation(.easeOut(duration: Constants.articleAnimationDuration), value: LearningZoneContent.digestEdition.value?.url)
    .animation(.easeOut(duration: Constants.articleAnimationDuration), value: LearningZoneContent.blogPost.value?.url)
    .task {
      await LearningZoneContent.refresh()
    }
  }

  private func digestArticle(_ edition: PrivacyDigestEdition) -> LearningArticle {
    LearningArticle(
      id: "privacy-digest",
      badge: Strings.digestBadge,
      image: Image(platformImage: edition.image),
      title: Strings.digestTitle,
      subtitle: [edition.displayName, Self.dateFormatter.string(from: edition.publishedAt)].joined(separator: " · "),
      tags: edition.tags,
      actionTitle: Strings.digestAction
    )
  }

  private func blogArticle(_ post: BlogPost) -> LearningArticle {
    LearningArticle(
      id: "blog-post",
      badge: Strings.blogBadge,
      image: Image(platformImage: post.image),
      title: post.title,
      subtitle: [Self.dateFormatter.string(from: post.publishedAt), post.category].compactMap { $0 }.joined(separator: " · "),
      description: post.description,
      actionTitle: Strings.blogAction
    )
  }

  // Like "October 21, 2026" in English, and for the day of the item, which
  // is the day of its time in UTC, as on the website
  private static let dateFormatter: DateFormatter = {
    let formatter = DateFormatter()
    formatter.timeZone = TimeZone(identifier: "UTC")
    formatter.setLocalizedDateFormatFromTemplate("MMMMdyyyy")
    return formatter
  }()
}

// MARK: - Article card

struct LearningArticle: Identifiable {
  let id: String
  let badge: String
  let image: Image
  let title: String
  let subtitle: String
  var description: String? = nil
  var tags: [String] = []
  let actionTitle: String
  var note: String? = nil
}

struct LearningArticleCard: View {
  let article: LearningArticle
  let layout: LearningCardLayout
  var action: () -> Void

  var body: some View {
    let stack = layout.isImageAbove
      ? AnyLayout(VStackLayout(spacing: layout.spacing))
      : AnyLayout(HStackLayout(alignment: layout.alignment, spacing: layout.spacing))

    stack {
      image
      texts
        .padding(layout.textPadding)
        .frame(maxWidth: .infinity, alignment: .leading)
    }
    .padding(layout.padding)
    .cardBackground(cornerRadius: Constants.cardCornerRadius)
    // The badge is read first, unless it repeats the title
    .singleActionAccessibility(label: [
      article.badge == article.title ? nil : article.badge,
      article.title,
      article.subtitle,
      article.description,
      article.tags.isEmpty ? nil : article.tags.joined(separator: ", "),
      article.actionTitle,
      article.note,
    ])
  }

  private var texts: some View {
    VStack(alignment: .leading, spacing: Constants.cardTextSpacing) {
      VStack(alignment: .leading, spacing: Constants.cardTitleSpacing) {
        Text(article.title)
          .textStyle(.headlineS)
          .foregroundColor(Colors.foregroundPrimary)
        Text(article.subtitle)
          .textStyle(.labelS)
          .foregroundColor(Colors.foregroundTertiary)
      }
      if let description = article.description {
        Text(description)
          .textStyle(.bodyS)
          .foregroundColor(Colors.foregroundSecondary)
          .fixedSize(horizontal: false, vertical: true)
      }
      if !article.tags.isEmpty {
        TagList(tags: article.tags)
      }
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
    // Without a width, as wide as the card
    .frame(width: layout.imageWidth, height: layout.imageHeight)
    .clipShape(UnevenRoundedRectangle(cornerRadii: layout.imageCornerRadii))
  }

  // The image, filling its space
  private var backdrop: some View {
    Color.clear
      .overlay {
        article.image
          .resizable()
          .scaledToFill()
      }
      .clipped()
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

// MARK: - Tags

/// Tags of an article, styled as on the website
fileprivate struct TagList: View {
  let tags: [String]

  var body: some View {
    FlowLayout(spacing: Constants.tagSpacing, rowSpacing: Constants.tagRowSpacing, maxRows: Constants.tagMaxRows) {
      ForEach(Array(tags.enumerated()), id: \.offset) { _, tag in
        Text(tag)
          .textStyle(.tag)
          .foregroundColor(Colors.foregroundSecondary)
          .lineLimit(1)
          .padding(.horizontal, Constants.tagHorizontalPadding)
          .padding(.vertical, Constants.tagVerticalPadding)
          .cardBackground(cornerRadius: Constants.tagCornerRadius, fill: Colors.bgSecondary)
      }
    }
    // The tags which don't fit in the rows are placed out of sight
    .clipped()
  }
}

/// Places its views in rows, starting a new row when a view doesn't fit in
/// the current one, and leaves out the views which don't fit in its rows
fileprivate struct FlowLayout: Layout {
  var spacing: CGFloat
  var rowSpacing: CGFloat
  var maxRows: Int

  private struct Row {
    var items: [(index: Int, size: CGSize)] = []
    var width: CGFloat = 0
    var height: CGFloat = 0
  }

  func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
    let rows = rows(of: subviews, width: proposal.width ?? .infinity)
    let width = rows.map(\.width).max() ?? 0
    let height = rows.map(\.height).reduce(0, +) + rowSpacing * CGFloat(max(rows.count - 1, 0))
    return CGSize(width: proposal.width ?? width, height: height)
  }

  func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
    let rows = rows(of: subviews, width: bounds.width)
    var placed = Set<Int>()
    var y = bounds.minY

    for row in rows {
      var x = bounds.minX
      for item in row.items {
        subviews[item.index].place(at: CGPoint(x: x, y: y), proposal: ProposedViewSize(item.size))
        placed.insert(item.index)
        x += item.size.width + spacing
      }
      y += row.height + rowSpacing
    }

    for index in subviews.indices where !placed.contains(index) {
      subviews[index].place(at: CGPoint(x: bounds.minX, y: bounds.maxY + rowSpacing), proposal: .unspecified)
    }
  }

  private func rows(of subviews: Subviews, width: CGFloat) -> [Row] {
    var rows: [Row] = []
    var row = Row()

    for index in subviews.indices {
      var size = subviews[index].sizeThatFits(.unspecified)
      // A view wider than a row is shortened to its width
      size.width = min(size.width, width)

      if !row.items.isEmpty, row.width + spacing + size.width > width {
        rows.append(row)
        if rows.count == maxRows { return rows }
        row = Row()
      }
      row.width += (row.items.isEmpty ? 0 : spacing) + size.width
      row.height = max(row.height, size.height)
      row.items.append((index, size))
    }

    if !row.items.isEmpty {
      rows.append(row)
    }
    return rows
  }
}
