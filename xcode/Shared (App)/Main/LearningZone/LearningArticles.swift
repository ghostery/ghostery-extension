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
  static let cardTextSpacing: CGFloat = 8
  static let cardTitleSpacing: CGFloat = 4
  static let buttonLabelPadding: CGFloat = 4

  static let tagHorizontalPadding: CGFloat = 8
  static let tagVerticalPadding: CGFloat = 4
  static let tagSpacing: CGFloat = 4
  static let tagListVerticalPadding: CGFloat = 4
  static let tagMaxRows = 2
}

fileprivate enum Strings {
  // You can translate your strings here
  // The name of the newsletter, which isn't translated
  static let digestLabel = "Privacy Digest"
  static let digestTitle = String(localized: "What’s happening in privacy right now?")
  static let digestAction = String(localized: "Read the latest edition", comment: "Button opening the latest edition of the Privacy Digest, Ghostery’s newsletter")
  static func digestEdition(_ number: Int) -> String {
    String(localized: "Edition \(number)", comment: "Number of the edition of the Privacy Digest, Ghostery’s newsletter, in its year")
  }
  static let blogLabel = String(localized: "From the blog", comment: "Label of the card of the latest post of the Ghostery Blog, shown in capital letters")
  static let blogAction = String(localized: "Read the post", comment: "Button opening the post of the Ghostery Blog")
  #if os(macOS)
  static let newsletterTitle = String(localized: "Get the next Privacy Digest edition\nin your inbox.", comment: "Title of the card about the Privacy Digest, Ghostery’s newsletter, in two lines")
  #else
  static let newsletterTitle = String(localized: "Get the next Privacy Digest edition in your inbox.", comment: "Title of the card about the Privacy Digest, Ghostery’s newsletter, wrapped to the width of the card")
  #endif
  static func moreTags(_ count: Int) -> String {
    String(localized: "+\(count) more", comment: "Last of the tags of an edition of the Privacy Digest, counting the tags which don’t fit in the card")
  }
}

fileprivate enum URLs {
  static let campaign = "learning-zone"
  static let privacyDigest = URL(string: "https://www.ghostery.com/privacy-digest")!.tagged(campaign: campaign)
}

fileprivate let newsletterArticle = LearningArticle(
  id: "newsletter",
  image: Image(.learningZoneNewsletter),
  title: Strings.newsletterTitle,
  subtitle: String(localized: "Join 450,000+ subscribers.", comment: "Subtitle of the card about the Privacy Digest, Ghostery’s newsletter"),
  actionTitle: String(localized: "Subscribe for free", comment: "Button opening the page where the user subscribes to the Privacy Digest, Ghostery’s newsletter"),
  note: String(localized: "No spam. Unsubscribe anytime.", comment: "Note below the button subscribing to the Privacy Digest, Ghostery’s newsletter")
)

/// Sizes of the cards, which differ between the Mac, iPhones and iPads
struct LearningCardLayout: PlatformLayout {
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
    imageHeight: 150,
    imageCornerRadii: RectangleCornerRadii(topLeading: 12, bottomLeading: 12, bottomTrailing: 12, topTrailing: 12),
    spacing: 32,
    textPadding: EdgeInsets(),
    alignment: .top
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
  @CurrentLayout private var layout: LearningCardLayout
  @Environment(\.openURL) private var openURL

  var body: some View {
    let layout = self.layout

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
      label: Strings.digestLabel,
      image: Image(platformImage: edition.image),
      title: Strings.digestTitle,
      subtitle: [edition.number.map(Strings.digestEdition), Self.dateFormatter.string(from: edition.publishedAt)].compactMap { $0 }.joined(separator: " · "),
      tags: edition.tags,
      actionTitle: Strings.digestAction
    )
  }

  private func blogArticle(_ post: BlogPost) -> LearningArticle {
    LearningArticle(
      id: "blog-post",
      label: Strings.blogLabel,
      image: Image(platformImage: post.image),
      title: post.title,
      subtitle: [post.category, Self.dateFormatter.string(from: post.publishedAt)].compactMap { $0 }.joined(separator: " · "),
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

private struct LearningArticle: Identifiable {
  let id: String
  /// Above the title, in capital letters
  var label: String? = nil
  let image: Image
  let title: String
  let subtitle: String
  var description: String? = nil
  var tags: [String] = []
  let actionTitle: String
  var note: String? = nil
}

private struct LearningArticleCard: View {
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
    .singleActionAccessibility(label: [
      article.label,
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
      if let label = article.label {
        Text(label)
          .textStyle(.labelS)
          .textCase(.uppercase)
          .foregroundColor(Colors.foregroundPrimary)
      }
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
      }
      if !article.tags.isEmpty {
        TagList(tags: article.tags)
      }
      Button(action: action) {
        HStack(spacing: 0) {
          Text(article.actionTitle)
            .padding(.horizontal, Constants.buttonLabelPadding)
          Image(.arrowRightSmall)
        }
      }
      .buttonStyle(AppButtonStyle(kind: .primary, size: .small))
      if let note = article.note {
        Text(note)
          .textStyle(.bodyS)
          .foregroundColor(Colors.foregroundSecondary)
      }
    }
    // At their full height, as the list would otherwise shorten the texts
    // of the tallest card to share the height with the others
    .fixedSize(horizontal: false, vertical: true)
  }

  // Fills its space, without a width as wide as the card
  private var image: some View {
    Color.clear
      .overlay {
        article.image
          .resizable()
          .scaledToFill()
      }
      .frame(width: layout.imageWidth, height: layout.imageHeight)
      .clipShape(UnevenRoundedRectangle(cornerRadii: layout.imageCornerRadii))
      .accessibilityHidden(true)
  }
}

// MARK: - Tags

/// Tags of an article in rows. When they don't fit, the last one shown
/// counts the others.
fileprivate struct TagList: View {
  let tags: [String]

  var body: some View {
    TagLayout(tagCount: tags.count, spacing: Constants.tagSpacing, maxRows: Constants.tagMaxRows) {
      ForEach(Array(tags.enumerated()), id: \.offset) { _, tag in
        ArticleTag(text: tag)
      }
      // One for each count of the tags left out, as the layout finds it
      ForEach(1..<max(tags.count, 1), id: \.self) { count in
        ArticleTag(text: Strings.moreTags(count))
      }
    }
    // The views which aren't shown are placed out of sight
    .clipped()
    .padding(.vertical, Constants.tagListVerticalPadding)
  }
}

fileprivate struct ArticleTag: View {
  let text: String

  var body: some View {
    Text(text)
      .textStyle(.labelS)
      .foregroundColor(Colors.foregroundPrimary)
      .lineLimit(1)
      .padding(.horizontal, Constants.tagHorizontalPadding)
      .padding(.vertical, Constants.tagVerticalPadding)
      .background(Capsule().fill(Colors.bgSecondary))
  }
}

/// Places the tags in rows, starting a new row when a tag doesn't fit in
/// the current one. When they need more rows than there are, it places as
/// many tags as fit with the view counting the others. The views of the
/// counts follow the tags, from the one for a single tag left out.
fileprivate struct TagLayout: Layout {
  var tagCount: Int
  var spacing: CGFloat
  var maxRows: Int

  private struct Row {
    var items: [(index: Int, size: CGSize)] = []
    var width: CGFloat = 0
    var height: CGFloat = 0
  }

  func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
    let rows = rows(of: subviews, width: proposal.width ?? .infinity)
    let width = rows.map(\.width).max() ?? 0
    let height = rows.map(\.height).reduce(0, +) + spacing * CGFloat(max(rows.count - 1, 0))
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
      y += row.height + spacing
    }

    for index in subviews.indices where !placed.contains(index) {
      subviews[index].place(at: CGPoint(x: bounds.minX, y: bounds.maxY + spacing), proposal: .unspecified)
    }
  }

  private func rows(of subviews: Subviews, width: CGFloat) -> [Row] {
    // A view wider than a row is shortened to its width
    let sizes = subviews.map { subview in
      var size = subview.sizeThatFits(.unspecified)
      size.width = min(size.width, width)
      return size
    }
    let tagCount = min(tagCount, subviews.count)

    // All the tags, or fewer with the count of the others. A single tag
    // with the count fits in two rows, as each of them takes one at most.
    var shownCount = tagCount
    var rows = self.rows(of: Array(0..<tagCount), sizes: sizes, width: width)
    while rows.count > maxRows, shownCount > 1 {
      shownCount -= 1
      let countIndex = tagCount + (tagCount - shownCount) - 1
      guard countIndex < subviews.count else { break }
      rows = self.rows(of: Array(0..<shownCount) + [countIndex], sizes: sizes, width: width)
    }
    return Array(rows.prefix(maxRows))
  }

  private func rows(of indices: [Int], sizes: [CGSize], width: CGFloat) -> [Row] {
    var rows: [Row] = []
    var row = Row()

    for index in indices {
      let size = sizes[index]
      if !row.items.isEmpty, row.width + spacing + size.width > width {
        rows.append(row)
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
