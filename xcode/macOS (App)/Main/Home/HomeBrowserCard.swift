//
//  HomeBrowserCard.swift
//  Ghostery
//
//  Card of a browser in the Home section, telling if Ghostery is enabled in
//  it, or how to install it.
//

import SwiftUI

fileprivate enum Constants {
  static let cardPadding: CGFloat = 16
  static let cardSpacing: CGFloat = 16
  static let cardCornerRadius: CGFloat = 12
  static let cardIconSize: CGFloat = 64
  static let cardTextHeight: CGFloat = 92
  static let cardTextSpacing: CGFloat = 4

  static let cardActionsSpacing: CGFloat = 4
  static let cardActionHeight: CGFloat = 40
  static let cardActionCornerRadius: CGFloat = 8
}

struct HomeBrowser: Identifiable {
  enum Kind: Hashable {
    case safari
    case external(ExternalBrowser)
  }

  let kind: Kind
  let icon: ImageResource
  let description: String
  /// Shown instead of the description when Ghostery is enabled in the browser
  let enabledDescription: String
  let actionTitle: String
  let isPrimary: Bool

  var id: Kind { kind }

  var name: String {
    switch kind {
    case .safari: return "Safari"
    case .external(let externalBrowser): return externalBrowser.name
    }
  }
}

struct HomeBrowserCard: View {
  /// Of every card, which the carousel scrolls by
  static let width: CGFloat = 180

  let browser: HomeBrowser
  /// Whether Ghostery is enabled in the browser
  var isEnabled: Bool
  var isMenuShown: Bool
  var action: () -> Void
  /// Shows the options for the enabled state, nil when there are none
  var showMenu: (() -> Void)?

  var body: some View {
    VStack(alignment: .leading, spacing: Constants.cardSpacing) {
      Image(browser.icon)
        .accessibilityHidden(true)
        .frame(width: Constants.cardIconSize, height: Constants.cardIconSize)
        .background(Circle().fill(Color.white))

      VStack(alignment: .leading, spacing: Constants.cardTextSpacing) {
        Text(browser.name)
          .textStyle(.headlineS)
          .foregroundColor(Colors.foregroundPrimary)
        Text(isEnabled ? browser.enabledDescription : browser.description)
          .textStyle(.bodyS)
          .foregroundColor(Colors.foregroundSecondary)
          .fixedSize(horizontal: false, vertical: true)
      }
      .frame(maxWidth: .infinity, alignment: .leading)
      // Longer texts make the card taller
      .frame(minHeight: Constants.cardTextHeight, maxHeight: .infinity, alignment: .top)
      .accessibilityElement(children: .combine)

      if isEnabled {
        enabledActions
      } else {
        Button(action: action) {
          Text(browser.actionTitle)
        }
        .buttonStyle(AppButtonStyle(kind: browser.isPrimary ? .primary : .secondary))
      }
    }
    .padding(Constants.cardPadding)
    .frame(width: Self.width)
    .frame(maxHeight: .infinity)
    .cardBackground(cornerRadius: Constants.cardCornerRadius)
    .modifier(HomeBrowserCardAccessibility(browser: browser, isEnabled: isEnabled, hasMenu: showMenu != nil))
  }

  private var enabledActions: some View {
    HStack(spacing: Constants.cardActionsSpacing) {
      Text(SectionStrings.Home.enabled)
        .textStyle(.labelM)
        .foregroundColor(Colors.foregroundSuccessPrimary)
        .frame(maxWidth: .infinity)
        .frame(height: Constants.cardActionHeight)
        .background(
          RoundedRectangle(cornerRadius: Constants.cardActionCornerRadius).fill(Colors.bgSuccessPrimary)
        )
      if let showMenu {
        HomeBrowserMoreButton(isMenuShown: isMenuShown, action: showMenu)
      }
    }
  }
}

/// Opens the menu of a card, which is shown below it
private struct HomeBrowserMoreButton: View {
  var isMenuShown: Bool
  var action: () -> Void

  @State private var isHovered = false

  var body: some View {
    let shape = RoundedRectangle(cornerRadius: Constants.cardActionCornerRadius)
    let isHighlighted = isHovered || isMenuShown

    Button(action: action) {
      Image(isHighlighted ? ImageResource.homeMoreHover : .homeMore)
        .accessibilityHidden(true)
        .frame(width: Constants.cardActionHeight, height: Constants.cardActionHeight)
        .background(shape.fill(Colors.bgPrimary))
        .overlay(
          shape.strokeBorder(
            isHighlighted ? Colors.borderTertiary : Colors.borderSecondary,
            lineWidth: Borders.width
          )
        )
        .contentShape(shape)
    }
    .buttonStyle(.plain)
    .onHover { isHovered = $0 }
    .help(SectionStrings.Home.moreOptions)
    .accessibilityLabel(SectionStrings.Home.moreOptions)
    .anchorPreference(key: HomeBrowserMenuAnchor.self, value: .bounds) { isMenuShown ? $0 : nil }
  }
}

/// A card with a single button is read as one element, with the action of
/// the button, whose title the combined label leaves out. With more buttons,
/// they're read separately, and without any, it's read as one element too.
private struct HomeBrowserCardAccessibility: ViewModifier {
  let browser: HomeBrowser
  let isEnabled: Bool
  let hasMenu: Bool

  func body(content: Content) -> some View {
    if isEnabled && hasMenu {
      content
        .accessibilityElement(children: .contain)
    } else if isEnabled {
      content
        .singleActionAccessibility(label: [browser.name, browser.enabledDescription, SectionStrings.Home.enabled])
    } else {
      content
        .singleActionAccessibility(label: [browser.name, browser.description, browser.actionTitle])
    }
  }
}
