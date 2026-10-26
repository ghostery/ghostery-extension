//
//  SectionPage.swift
//  Ghostery
//
//  Building blocks of the pages of the sections, which the apps lay out in
//  their own ways. On the Mac, the header has the illustration of the
//  section, and the banner stays at the bottom of taller windows. On
//  iPhones and iPads, the page is a column, with the banner after its
//  content.
//

import SwiftUI

fileprivate enum Constants {
  #if os(macOS)
  static let headerTextWidth: CGFloat = 318
  static let headerTextSpacing: CGFloat = 8
  static let headerImageWidth: CGFloat = 300
  static let headerImageHeight: CGFloat = 144
  static let headerTopPadding: CGFloat = 40
  static let headerBottomPadding: CGFloat = 48
  static let headerHorizontalPadding: CGFloat = 40
  // Of the parts of the content, which are wider than the header
  static let contentHorizontalPadding: CGFloat = 20
  #else
  // The column of a section stays centered in wider windows, like on iPads
  // in landscape
  static let maxWidth: CGFloat = 1032
  #endif

  static let backIconSize: CGFloat = 16
  #if os(macOS)
  static let backHitPadding: CGFloat = 0
  #else
  // The back button can be tapped also a bit around it, as it's small
  static let backHitPadding: CGFloat = 12
  #endif
}

fileprivate enum Strings {
  // You can translate your strings here
  static let back = String(localized: "Back", comment: "Button going back to the previous page")
}

#if os(iOS)
/// Sizes of the sections, which are larger on iPads
fileprivate struct SectionLayout: PlatformLayout {
  var horizontalPadding: CGFloat
  var topPadding: CGFloat
  var bottomPadding: CGFloat
  /// Of the button above the title of a subpage, going back to its section
  var backStyle: AppTextStyle
  /// Between the back button and the title
  var backSpacing: CGFloat
  var titleStyle: AppTextStyle
  var titleSpacing: CGFloat
  var descriptionStyle: AppTextStyle
  /// Of the description below the title, so it wraps as in the design
  var descriptionWidth: CGFloat
  /// Of the longer descriptions, which are smaller on iPhones, and across
  /// the screen
  var longDescriptionStyle: AppTextStyle
  var longDescriptionWidth: CGFloat
  /// Between the header and the content below it
  var headerBottomPadding: CGFloat
  /// Between the content and the banner below it
  var bannerTopPadding: CGFloat

  static let phone = SectionLayout(
    horizontalPadding: 16,
    topPadding: 16,
    bottomPadding: 16,
    backStyle: .labelM,
    backSpacing: 16,
    titleStyle: .displayM,
    titleSpacing: 8,
    descriptionStyle: .bodyL,
    descriptionWidth: 306,
    longDescriptionStyle: .bodyM,
    longDescriptionWidth: .infinity,
    headerBottomPadding: 26,
    bannerTopPadding: 24
  )
  static let tablet = SectionLayout(
    horizontalPadding: 40,
    topPadding: 80,
    bottomPadding: 40,
    backStyle: .labelL,
    backSpacing: 10,
    titleStyle: .display2XL,
    titleSpacing: 10,
    descriptionStyle: .bodyL,
    descriptionWidth: 590,
    longDescriptionStyle: .bodyL,
    longDescriptionWidth: 590,
    headerBottomPadding: 60,
    bannerTopPadding: 32
  )
}
#endif

/// Scrolling page of a section, with a footer after its content, like the
/// banner. On the Mac, the footer stays at the bottom of taller windows, and
/// scrolls with the content in shorter ones.
struct SectionScrollView<Content: View, Footer: View>: View {
  private let content: Content
  private let footer: Footer

  #if os(iOS)
  @CurrentLayout private var layout: SectionLayout
  #endif

  init(@ViewBuilder content: () -> Content, @ViewBuilder footer: () -> Footer) {
    self.content = content()
    self.footer = footer()
  }

  var body: some View {
    #if os(macOS)
    GeometryReader { proxy in
      ScrollView(.vertical) {
        VStack(alignment: .leading, spacing: 0) {
          content
          Spacer(minLength: 0)
          footer
        }
        // Fills the visible height when the content is shorter
        .frame(minHeight: proxy.size.height, alignment: .top)
      }
      .scrollBounceBehavior(.basedOnSize)
      // SwiftUI extends scroll views under the window's title bar,
      // but the content should scroll only below the header
      .clipped()
    }
    #else
    let layout = self.layout

    ScrollView(.vertical) {
      VStack(alignment: .leading, spacing: 0) {
        content
        if Footer.self != EmptyView.self {
          footer
            .padding(.top, layout.bannerTopPadding)
        }
      }
      .padding(.horizontal, layout.horizontalPadding)
      .padding(.top, layout.topPadding)
      .padding(.bottom, layout.bottomPadding)
      .frame(maxWidth: Constants.maxWidth, alignment: .leading)
      .frame(maxWidth: .infinity)
    }
    .scrollBounceBehavior(.basedOnSize)
    #endif
  }
}

extension SectionScrollView where Footer == EmptyView {
  init(@ViewBuilder content: () -> Content) {
    self.init(content: content) { EmptyView() }
  }
}

/// Header of a section, with its title and description. On the Mac, the
/// illustration of the section follows them. On iPhones and iPads, the
/// header of a subpage has the button going back to its section above the
/// title.
struct SectionHeader: View {
  /// Lines of the title, separated with "\n"
  var title: String
  var description: String?
  /// Whether the description is one of the longer ones, which are smaller
  var isDescriptionLong = false
  /// Shown on the Mac
  var image: ImageResource?
  #if os(iOS)
  /// Goes back to the section, from its subpage
  var onBack: (() -> Void)?

  @CurrentLayout private var layout: SectionLayout
  #endif

  var body: some View {
    #if os(macOS)
    HStack(spacing: 0) {
      VStack(alignment: .leading, spacing: Constants.headerTextSpacing) {
        SectionTitle(title: title)
        if let description {
          Text(description)
            .textStyle(isDescriptionLong ? .bodyS : .bodyL)
            .fixedSize(horizontal: false, vertical: true)
        }
      }
      .foregroundColor(Colors.foregroundPrimary)
      .frame(width: Constants.headerTextWidth, alignment: .leading)

      Spacer(minLength: 0)

      if let image {
        Image(image)
          .accessibilityHidden(true)
          .frame(width: Constants.headerImageWidth, height: Constants.headerImageHeight)
      }
    }
    .padding(.top, Constants.headerTopPadding)
    .padding(.bottom, Constants.headerBottomPadding)
    .padding(.horizontal, Constants.headerHorizontalPadding)
    #else
    let layout = self.layout

    VStack(alignment: .leading, spacing: 0) {
      if let onBack {
        SectionBackButton(style: layout.backStyle, action: onBack)
          .padding(.bottom, layout.backSpacing)
      }

      VStack(alignment: .leading, spacing: layout.titleSpacing) {
        SectionTitle(title: title, style: layout.titleStyle)
          .foregroundColor(Colors.foregroundPrimary)
        if let description {
          Text(description)
            .textStyle(isDescriptionLong ? layout.longDescriptionStyle : layout.descriptionStyle)
            .foregroundColor(Colors.foregroundSecondary)
            .fixedSize(horizontal: false, vertical: true)
            .frame(maxWidth: isDescriptionLong ? layout.longDescriptionWidth : layout.descriptionWidth, alignment: .leading)
        }
      }
    }
    .padding(.bottom, layout.headerBottomPadding)
    #endif
  }
}

/// Title of a section, read as one heading
struct SectionTitle: View {
  /// Lines of the title, separated with "\n"
  var title: String
  var style: AppTextStyle = .displayM

  var body: some View {
    // Each line is a separate text, as the title's line height
    // is smaller than the one of its font
    VStack(alignment: .leading, spacing: 0) {
      ForEach(Array(title.components(separatedBy: "\n").enumerated()), id: \.offset) { _, line in
        Text(line)
          .textStyle(style)
      }
    }
    .accessibilityElement(children: .ignore)
    .accessibilityLabel(title.replacingOccurrences(of: "\n", with: " "))
    .accessibilityAddTraits(.isHeader)
  }
}

/// Goes back from a subpage to its section
struct SectionBackButton: View {
  var style: AppTextStyle
  var action: () -> Void

  var body: some View {
    Button(action: action) {
      HStack(spacing: 0) {
        Image(.homeBack)
          .accessibilityHidden(true)
          .frame(width: Constants.backIconSize, height: Constants.backIconSize)
        Text(Strings.back)
          .textStyle(style)
          .foregroundColor(Colors.foregroundPrimary)
      }
      .padding(Constants.backHitPadding)
      .contentShape(Rectangle())
    }
    .buttonStyle(.plain)
    // Takes only the space of its label
    .padding(-Constants.backHitPadding)
  }
}

extension View {
  /// Margins of a part of the content of a section beside the header. On
  /// the Mac they're narrower than the ones of the header, and on iPhones
  /// and iPads the column has them.
  func sectionContentPadding() -> some View {
    #if os(macOS)
    padding(.horizontal, Constants.contentHorizontalPadding)
    #else
    self
    #endif
  }
}
