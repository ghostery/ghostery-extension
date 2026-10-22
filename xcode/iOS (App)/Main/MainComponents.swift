//
//  MainComponents.swift
//  Ghostery
//
//  Building blocks of the sections of the app.
//

import SwiftUI

fileprivate enum Constants {
  // The column of a section stays centered in wider windows, like on iPads
  // in landscape
  static let maxWidth: CGFloat = 1032

  static let backIconSize: CGFloat = 16
  // The back button can be tapped also a bit around it, as it's small
  static let backHitPadding: CGFloat = 12

  static let dialogCornerRadius: CGFloat = 24
  static let dialogShadowRadius: CGFloat = 25
  static let dialogCloseButtonSize: CGFloat = 24
  static let dialogCloseButtonPadding: CGFloat = 20
  static let dialogCloseTitlePadding: CGFloat = 24
  // Like the back button, the close button can be tapped also around it
  static let dialogCloseHitPadding: CGFloat = 10
  static let borderLineWidth: CGFloat = 1
}

fileprivate enum Strings {
  // You can translate your strings here
  static let back = String(localized: "Back", comment: "Button going back to the previous page")
  static let close = String(localized: "Close", comment: "Button closing a dialog")
}

/// Sizes of the sections, which are larger on iPads
struct SectionLayout {
  var isTablet: Bool
  var horizontalPadding: CGFloat
  var topPadding: CGFloat
  var bottomPadding: CGFloat
  /// Of the button above the title of a subpage, going back to its section
  var backStyle: AppTextStyle
  /// Between the back button and the title
  var backSpacing: CGFloat
  var titleStyle: AppTextStyle
  var titleSpacing: CGFloat
  /// Of the description below the title, so it wraps as in the design
  var descriptionWidth: CGFloat
  /// Between the header and the content below it
  var headerBottomPadding: CGFloat
  /// Between the content and the banner below it
  var bannerTopPadding: CGFloat

  static let phone = SectionLayout(
    isTablet: false,
    horizontalPadding: 16,
    topPadding: 16,
    bottomPadding: 16,
    backStyle: .labelM,
    backSpacing: 16,
    titleStyle: .displayM,
    titleSpacing: 8,
    descriptionWidth: 306,
    headerBottomPadding: 26,
    bannerTopPadding: 24
  )
  static let tablet = SectionLayout(
    isTablet: true,
    horizontalPadding: 40,
    topPadding: 80,
    bottomPadding: 40,
    backStyle: .labelL,
    backSpacing: 10,
    titleStyle: .display2XL,
    titleSpacing: 10,
    descriptionWidth: 590,
    headerBottomPadding: 60,
    bannerTopPadding: 32
  )
}

extension SectionLayout {
  /// The layout for the width of the window
  init(_ horizontalSizeClass: UserInterfaceSizeClass?) {
    self = horizontalSizeClass == .regular ? .tablet : .phone
  }
}

/// Scrolling content of a section, in a column with the margins of its layout
struct SectionScrollView<Content: View>: View {
  private let content: (SectionLayout) -> Content

  @Environment(\.horizontalSizeClass) private var horizontalSizeClass

  init(@ViewBuilder content: @escaping (SectionLayout) -> Content) {
    self.content = content
  }

  var body: some View {
    let layout = SectionLayout(horizontalSizeClass)

    ScrollView(.vertical) {
      VStack(alignment: .leading, spacing: 0) {
        content(layout)
      }
      .padding(.horizontal, layout.horizontalPadding)
      .padding(.top, layout.topPadding)
      .padding(.bottom, layout.bottomPadding)
      .frame(maxWidth: Constants.maxWidth, alignment: .leading)
      .frame(maxWidth: .infinity)
    }
    .scrollBounceBehavior(.basedOnSize)
  }
}

/// Header of a section, with its title and description, or of its subpage,
/// with the button going back to the section above the title
struct SectionHeader: View {
  /// Lines of the title, separated with "\n"
  var title: String
  var description: String?
  /// Of the description, instead of the ones of the layout
  var descriptionStyle: AppTextStyle?
  var descriptionWidth: CGFloat?
  var layout: SectionLayout
  /// Goes back to the section, from its subpage
  var onBack: (() -> Void)?

  var body: some View {
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
            .textStyle(descriptionStyle ?? .bodyL)
            .foregroundColor(Colors.foregroundSecondary)
            .fixedSize(horizontal: false, vertical: true)
            .frame(maxWidth: descriptionWidth ?? layout.descriptionWidth, alignment: .leading)
        }
      }
    }
    .padding(.bottom, layout.headerBottomPadding)
  }
}

/// Goes back from a subpage to its section
struct SectionBackButton: View {
  var style: AppTextStyle
  var action: () -> Void

  var body: some View {
    Button(action: action) {
      HStack(spacing: 0) {
        Image(decorative: Icons.homeBack)
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

/// Card of a dialog, as wide as the screen allows up to its width, with the
/// button closing it in the corner. Its content scrolls when it's too tall,
/// like in short windows on iPads.
struct AppDialog<Content: View>: View {
  private let width: CGFloat
  private let closeTitle: String?
  private let onClose: (() -> Void)?
  private let content: Content

  /// The close button shows the title instead of the icon, when it's set.
  /// It's left out without the action, when only the content closes the dialog.
  init(width: CGFloat, closeTitle: String? = nil, onClose: (() -> Void)?, @ViewBuilder content: () -> Content) {
    self.width = width
    self.closeTitle = closeTitle
    self.onClose = onClose
    self.content = content()
  }

  var body: some View {
    let shape = RoundedRectangle(cornerRadius: Constants.dialogCornerRadius)

    ViewThatFits(in: .vertical) {
      content
      ScrollView(.vertical) {
        content
      }
      .scrollBounceBehavior(.basedOnSize)
    }
    .frame(maxWidth: width)
    .clipShape(shape)
    .background(
      shape
        .fill(Colors.bgPrimary)
        .shadow(color: Colors.shadowPanel, radius: Constants.dialogShadowRadius)
    )
    .overlay(shape.strokeBorder(Colors.borderPrimary, lineWidth: Constants.borderLineWidth))
    .overlay(alignment: .topTrailing) {
      if let onClose {
        closeButton(action: onClose)
      }
    }
    .accessibilityElement(children: .contain)
    .accessibilityAddTraits(.isModal)
  }

  @ViewBuilder
  private func closeButton(action: @escaping () -> Void) -> some View {
    if let closeTitle {
      Button(action: action) {
        Text(closeTitle)
          .textStyle(.labelM)
          .foregroundColor(Colors.foregroundPrimary)
          .padding(Constants.dialogCloseHitPadding)
          .contentShape(Rectangle())
      }
      .buttonStyle(.plain)
      .padding(Constants.dialogCloseTitlePadding - Constants.dialogCloseHitPadding)
    } else {
      Button(action: action) {
        Image(Icons.dialogClose)
          .frame(width: Constants.dialogCloseButtonSize, height: Constants.dialogCloseButtonSize)
          .padding(Constants.dialogCloseHitPadding)
          .contentShape(Rectangle())
      }
      .buttonStyle(.plain)
      .accessibilityLabel(Strings.close)
      .padding(Constants.dialogCloseButtonPadding - Constants.dialogCloseHitPadding)
    }
  }
}
