//
//  HomeView.swift
//  Ghostery
//
//  Home section of the main window.
//

import SwiftUI

fileprivate enum Constants {
  static let browsersHeaderSpacing: CGFloat = 2
  static let browsersHeaderLeadingPadding: CGFloat = 24
  static let browsersHeaderTrailingPadding: CGFloat = 20
  static let browsersHeaderBottomPadding: CGFloat = 12

  static let carouselSpacing: CGFloat = 4
  static let carouselHorizontalPadding: CGFloat = 20
  static let carouselButtonSize: CGFloat = 34
  static let carouselButtonTopPadding: CGFloat = 20
  static let carouselButtonTrailingPadding: CGFloat = 6

  static let cardWidth: CGFloat = 180
  static let cardPadding: CGFloat = 16
  static let cardSpacing: CGFloat = 16
  static let cardCornerRadius: CGFloat = 12
  static let cardIconSize: CGFloat = 64
  static let cardTextHeight: CGFloat = 92
  static let cardTextSpacing: CGFloat = 4

  static let borderLineWidth: CGFloat = 1
  static let buttonShadowRadius: CGFloat = 4
  static let buttonShadowY: CGFloat = 3
}

fileprivate enum Strings {
  // You can translate your strings here
  static let title = "Protect your privacy.\nBlock trackers."
  static let description = "Ghostery helps you take control of your data across the web."
  static let installHeader = "Install Ghostery in your browser"
  static let detectedBrowsers = "Detected browsers: "
  static let nextBrowsers = "Next"
}

// Placeholder data, to be replaced with the detected browsers
fileprivate let placeholderBrowsers = [
  HomeBrowser(
    id: "safari",
    name: "Safari",
    icon: Icons.browserSafari,
    description: "Follow these simple steps to enable Ghostery in Safari.",
    actionTitle: "View instructions",
    isPrimary: true
  ),
  HomeBrowser(
    id: "firefox",
    name: "Firefox",
    icon: Icons.browserFirefox,
    description: "Install Ghostery addon from the Firefox\nAdd-ons store.",
    actionTitle: "Install in Firefox",
    isPrimary: false
  ),
  HomeBrowser(
    id: "chrome",
    name: "Chrome",
    icon: Icons.browserChrome,
    description: "Install Ghostery extension from the Chrome web store.",
    actionTitle: "Install in Chrome",
    isPrimary: false
  ),
  HomeBrowser(
    id: "edge",
    name: "Edge",
    icon: Icons.browserEdge,
    description: "Install Ghostery extension from the Edge Add-ons.",
    actionTitle: "Install in Edge",
    isPrimary: false
  ),
]

struct HomeView: View {
  private let browsers = placeholderBrowsers

  var body: some View {
    SectionScrollView {
      SectionHeader(
        title: Strings.title,
        description: Strings.description,
        descriptionStyle: .bodyL,
        image: Icons.homeHeaderProtection
      )
      browsersHeader
      browsersCarousel
    } footer: {
      Banner()
    }
  }

  private var browsersHeader: some View {
    VStack(alignment: .leading, spacing: Constants.browsersHeaderSpacing) {
      Text(Strings.installHeader)
        .textStyle(.labelM)
        .foregroundColor(Colors.foregroundPrimary)
        .accessibilityAddTraits(.isHeader)
      Text(Strings.detectedBrowsers + String(browsers.count))
        .textStyle(.labelS)
        .foregroundColor(Colors.foregroungTertiary)
    }
    .padding(.leading, Constants.browsersHeaderLeadingPadding)
    .padding(.trailing, Constants.browsersHeaderTrailingPadding)
    .padding(.bottom, Constants.browsersHeaderBottomPadding)
  }

  private var browsersCarousel: some View {
    ScrollView(.horizontal, showsIndicators: false) {
      HStack(alignment: .top, spacing: Constants.carouselSpacing) {
        ForEach(browsers) { browser in
          HomeBrowserCard(browser: browser, action: {})
        }
      }
      .padding(.horizontal, Constants.carouselHorizontalPadding)
    }
    .overlay(alignment: .topTrailing) {
      Button {} label: {
        Image(Icons.homeChevronRight)
          .frame(width: Constants.carouselButtonSize, height: Constants.carouselButtonSize)
          .background(
            Circle()
              .fill(Colors.bgPrimary)
              .shadow(color: Colors.shadowButton, radius: Constants.buttonShadowRadius, y: Constants.buttonShadowY)
          )
          .overlay(Circle().strokeBorder(Colors.borderSecondary, lineWidth: Constants.borderLineWidth))
          .contentShape(Circle())
      }
      .buttonStyle(.plain)
      .accessibilityLabel(Strings.nextBrowsers)
      .padding(.top, Constants.carouselButtonTopPadding)
      .padding(.trailing, Constants.carouselButtonTrailingPadding)
    }
  }
}

// MARK: - Browser card

struct HomeBrowser: Identifiable {
  let id: String
  let name: String
  let icon: String
  let description: String
  let actionTitle: String
  let isPrimary: Bool
}

struct HomeBrowserCard: View {
  let browser: HomeBrowser
  var action: () -> Void

  var body: some View {
    let shape = RoundedRectangle(cornerRadius: Constants.cardCornerRadius)

    VStack(alignment: .leading, spacing: Constants.cardSpacing) {
      Image(decorative: browser.icon)
        .frame(width: Constants.cardIconSize, height: Constants.cardIconSize)
        .background(Circle().fill(Color.white))

      VStack(alignment: .leading, spacing: Constants.cardTextSpacing) {
        Text(browser.name)
          .textStyle(.headlineS)
          .foregroundColor(Colors.foregroundPrimary)
        Text(browser.description)
          .textStyle(.bodyS)
          .foregroundColor(Colors.foregroundSecondary)
          .fixedSize(horizontal: false, vertical: true)
      }
      .frame(maxWidth: .infinity, alignment: .leading)
      .frame(height: Constants.cardTextHeight, alignment: .top)

      Button(action: action) {
        Text(browser.actionTitle)
      }
      .buttonStyle(AppButtonStyle(kind: browser.isPrimary ? .primary : .secondary))
    }
    .padding(Constants.cardPadding)
    .frame(width: Constants.cardWidth)
    .background(shape.fill(Colors.bgPrimary))
    .overlay(shape.strokeBorder(Colors.borderPrimary, lineWidth: Constants.borderLineWidth))
    // Read as one element, with the action of its button, whose title
    // the combined label leaves out
    .accessibilityElement(children: .combine)
    .accessibilityLabel([browser.name, browser.description, browser.actionTitle].joined(separator: ", "))
  }
}

struct HomeView_Previews: PreviewProvider {
  static var previews: some View {
    HomeView()
      .frame(width: 736, height: 668)
  }
}
