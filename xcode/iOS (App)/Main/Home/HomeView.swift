//
//  HomeView.swift
//  Ghostery
//
//  Home section of the app.
//

import SwiftUI
import UIKit

fileprivate enum Constants {
  // Between the header of the browsers and them
  static let browsersPhoneSpacing: CGFloat = 8
  static let browsersTabletSpacing: CGFloat = 16

  static let iconSize: CGFloat = 40
  // The browser's logo leaves a margin of the circle around it
  static let iconPadding: CGFloat = 4.44
  static let cornerRadius: CGFloat = 12

  // On iPhones, the browsers are rows, one below the other
  static let rowsSpacing: CGFloat = 4
  static let rowHorizontalPadding: CGFloat = 8
  static let rowVerticalPadding: CGFloat = 12
  static let rowSpacing: CGFloat = 8
  static let rowTextSpacing: CGFloat = 4
  // The descriptions wrap as in the design, also next to shorter buttons
  static let rowDescriptionWidth: CGFloat = 192
  // Added to the padding of the button, as in the design
  static let rowButtonLabelPadding: CGFloat = 4

  // On iPads, the browsers are cards, next to each other
  static let cardsSpacing: CGFloat = 16
  static let cardPadding: CGFloat = 24
  static let cardSpacing: CGFloat = 18
  static let cardTextSpacing: CGFloat = 8
  static let cardButtonLabelPadding: CGFloat = 8

  // As tall as the buttons of the rows and the cards, with the label as
  // far from the edges as their titles
  static let enabledRowHeight: CGFloat = 32
  static let enabledRowLabelPadding: CGFloat = 12
  static let enabledCardHeight: CGFloat = 48
  static let enabledCardLabelPadding: CGFloat = 20
  static let enabledSpacing: CGFloat = 4
  static let enabledCornerRadius: CGFloat = 8
  static let borderLineWidth: CGFloat = 1
}

fileprivate enum Strings {
  // You can translate your strings here
  static let title = String(localized: "Protect your privacy.\nBlock trackers.", comment: "Title of the Home section, in two lines")
  static let description = String(localized: "Ghostery helps you take control of your data across the web.")
  static let installHeader = String(localized: "Install Ghostery in your browser")
  static let safariDescription = String(localized: "Follow these simple steps to enable Ghostery in Safari.")
  static let safariEnabledDescription = String(localized: "Ghostery works correctly in Safari.")
  static let edgeDescription = String(localized: "Install Ghostery extension from the Edge Add-ons.")
  static let instructions = String(localized: "Instructions", comment: "Button showing the steps to enable Ghostery in Safari")
  static let install = String(localized: "Install", comment: "Button opening the App Store, to install the browser")
  static let open = String(localized: "Open", comment: "Button opening the browser installed on the device, to use Ghostery in it")
  static let enabled = String(localized: "Enabled", comment: "State of Ghostery in a browser")
  static let moreOptions = String(localized: "More options")
  static let disableInSafari = String(localized: "Disable Ghostery in Safari")
  static let viewInstructions = String(localized: "View instructions", comment: "Button showing the steps to enable or disable Ghostery in Safari")
}

fileprivate enum URLs {
  // Redirects to Microsoft's link of Edge for iPhones and iPads, which opens
  // Edge in the App Store, or opened in Edge, the way to use Ghostery in it
  static let edge = URL(string: "https://www.ghostery.com/download/edge-mobile")!.tagged(campaign: "home")
}

/// Microsoft Edge, which opens the links of its own scheme. Apps can check if
/// it's installed, as the scheme is in LSApplicationQueriesSchemes of the app.
fileprivate enum Edge {
  private static let scheme = "microsoft-edge-https"

  static var isInstalled: Bool {
    guard let url = URL(string: "\(scheme)://www.ghostery.com") else { return false }
    return UIApplication.shared.canOpenURL(url)
  }

  /// The link, opened in Edge
  static func link(_ url: URL) -> URL {
    guard var components = URLComponents(url: url, resolvingAgainstBaseURL: false) else { return url }
    components.scheme = scheme
    return components.url ?? url
  }
}

struct HomeView: View {
  private let safari = SafariExtension.shared
  @State private var showsSafariInstructions = false
  // The user can install Edge while the app is in the background
  @State private var isEdgeInstalled = Edge.isInstalled
  @Environment(\.scenePhase) private var scenePhase

  var body: some View {
    Group {
      if showsSafariInstructions {
        SafariInstructionsView(onBack: { showsSafariInstructions = false })
      } else {
        home
      }
    }
    .task { await safari.monitor() }
    .onChange(of: safari.isEnabled) {
      // The last step of the instructions is going back to the app,
      // which then shows the new state on the card
      showsSafariInstructions = false
    }
    .onChange(of: scenePhase) {
      if scenePhase == .active {
        isEdgeInstalled = Edge.isInstalled
      }
    }
  }

  private var home: some View {
    SectionScrollView { layout in
      SectionHeader(title: Strings.title, description: Strings.description, layout: layout)

      Text(Strings.installHeader)
        .textStyle(.labelL)
        .foregroundColor(Colors.foregroundPrimary)
        .accessibilityAddTraits(.isHeader)
        .padding(.bottom, layout.isTablet ? Constants.browsersTabletSpacing : Constants.browsersPhoneSpacing)

      if layout.isTablet {
        browserCards
      } else {
        browserRows
      }

      Banner()
        .padding(.top, layout.bannerTopPadding)
    }
  }

  // Safari, and Edge, which the button installs from the App Store, or once
  // it's installed, opens with the same link
  private var browsers: [HomeBrowser] {
    [
      HomeBrowser(
        id: "safari",
        name: "Safari",
        icon: Icons.browserSafari,
        description: Strings.safariDescription,
        enabledDescription: Strings.safariEnabledDescription,
        actionTitle: Strings.instructions,
        action: .perform { showsSafariInstructions = true },
        isPrimary: true,
        isEnabled: safari.isEnabled,
        menuItems: [
          HomeBrowserMenuItem(title: Strings.disableInSafari, action: .perform { SafariExtension.showSettings() }),
          HomeBrowserMenuItem(title: Strings.viewInstructions, action: .perform { showsSafariInstructions = true }),
        ]
      ),
      HomeBrowser(
        id: "edge",
        name: "Edge",
        icon: Icons.browserEdge,
        description: Strings.edgeDescription,
        actionTitle: isEdgeInstalled ? Strings.open : Strings.install,
        action: .open(isEdgeInstalled ? Edge.link(URLs.edge) : URLs.edge),
        isPrimary: false
      ),
    ]
  }

  private var browserRows: some View {
    VStack(spacing: Constants.rowsSpacing) {
      ForEach(browsers) { browser in
        HomeBrowserRow(browser: browser)
      }
    }
  }

  private var browserCards: some View {
    // The cards stretch to the tallest one, so their buttons line up
    HStack(alignment: .top, spacing: Constants.cardsSpacing) {
      ForEach(browsers) { browser in
        HomeBrowserCard(browser: browser)
          .frame(maxHeight: .infinity)
      }
    }
    .fixedSize(horizontal: false, vertical: true)
  }
}

// MARK: - Browsers

/// Browser in which the user can use Ghostery
private struct HomeBrowser: Identifiable {
  let id: String
  let name: String
  let icon: String
  let description: String
  /// Shown instead of the description when Ghostery is enabled in the browser
  var enabledDescription: String? = nil
  let actionTitle: String
  let action: MainAction
  let isPrimary: Bool
  /// Whether Ghostery is enabled in the browser, which replaces the button
  /// with the state and the menu of its options
  var isEnabled = false
  var menuItems: [HomeBrowserMenuItem] = []

  var currentDescription: String {
    isEnabled ? enabledDescription ?? description : description
  }
}

private struct HomeBrowserMenuItem: Identifiable {
  let title: String
  let action: MainAction

  var id: String { title }
}

/// Row of a browser, as on iPhones
private struct HomeBrowserRow: View {
  let browser: HomeBrowser

  @Environment(\.performAction) private var performAction

  var body: some View {
    HStack(spacing: Constants.rowSpacing) {
      HomeBrowserIcon(icon: browser.icon)

      VStack(alignment: .leading, spacing: Constants.rowTextSpacing) {
        Text(browser.name)
          .textStyle(.labelL)
          .foregroundColor(Colors.foregroundPrimary)
        Text(browser.currentDescription)
          .textStyle(.bodyS)
          .foregroundColor(Colors.foregroundSecondary)
          .fixedSize(horizontal: false, vertical: true)
          .frame(maxWidth: Constants.rowDescriptionWidth, alignment: .leading)
      }
      .frame(maxWidth: .infinity, alignment: .leading)

      if browser.isEnabled {
        HomeBrowserEnabledState(
          menuItems: browser.menuItems,
          height: Constants.enabledRowHeight,
          labelPadding: Constants.enabledRowLabelPadding
        )
      } else {
        Button {
          performAction(browser.action)
        } label: {
          Text(browser.actionTitle)
            .padding(.horizontal, Constants.rowButtonLabelPadding)
        }
        .buttonStyle(AppButtonStyle(kind: browser.isPrimary ? .primary : .secondary, size: .small))
        .fixedSize()
      }
    }
    .padding(.horizontal, Constants.rowHorizontalPadding)
    .padding(.vertical, Constants.rowVerticalPadding)
    .cardBackground(cornerRadius: Constants.cornerRadius)
    .modifier(HomeBrowserAccessibility(browser: browser))
  }
}

/// Card of a browser, as on iPads
private struct HomeBrowserCard: View {
  let browser: HomeBrowser

  @Environment(\.performAction) private var performAction

  var body: some View {
    VStack(alignment: .leading, spacing: Constants.cardSpacing) {
      HomeBrowserIcon(icon: browser.icon)

      VStack(alignment: .leading, spacing: Constants.cardTextSpacing) {
        Text(browser.name)
          .textStyle(.headlineM)
          .foregroundColor(Colors.foregroundPrimary)
        Text(browser.currentDescription)
          .textStyle(.bodyL)
          .foregroundColor(Colors.foregroundSecondary)
          .fixedSize(horizontal: false, vertical: true)
      }
      .frame(maxWidth: .infinity, alignment: .leading)
      // Longer texts make the card taller
      .frame(maxHeight: .infinity, alignment: .top)

      if browser.isEnabled {
        HomeBrowserEnabledState(
          menuItems: browser.menuItems,
          height: Constants.enabledCardHeight,
          labelPadding: Constants.enabledCardLabelPadding
        )
      } else {
        Button {
          performAction(browser.action)
        } label: {
          Text(browser.actionTitle)
            .padding(.horizontal, Constants.cardButtonLabelPadding)
        }
        .buttonStyle(AppButtonStyle(kind: browser.isPrimary ? .primary : .secondary, size: .large))
        .fixedSize()
      }
    }
    .padding(Constants.cardPadding)
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    .cardBackground(cornerRadius: Constants.cornerRadius)
    .modifier(HomeBrowserAccessibility(browser: browser))
  }
}

/// Logo of a browser, on a white circle
private struct HomeBrowserIcon: View {
  let icon: String

  var body: some View {
    Image(decorative: icon)
      .resizable()
      .scaledToFit()
      .padding(Constants.iconPadding)
      .frame(width: Constants.iconSize, height: Constants.iconSize)
      .background(Circle().fill(Color.white))
  }
}

/// State of Ghostery where it's enabled, in place of the button of a browser,
/// followed by the button of the menu of its options
private struct HomeBrowserEnabledState: View {
  let menuItems: [HomeBrowserMenuItem]
  let height: CGFloat
  let labelPadding: CGFloat

  @Environment(\.performAction) private var performAction

  var body: some View {
    let shape = RoundedRectangle(cornerRadius: Constants.enabledCornerRadius)

    HStack(spacing: Constants.enabledSpacing) {
      Text(Strings.enabled)
        .textStyle(.labelM)
        .foregroundColor(Colors.foregroundSuccessPrimary)
        .lineLimit(1)
        .padding(.horizontal, labelPadding)
        .frame(height: height)
        .background(shape.fill(Colors.bgSuccessPrimary))

      if !menuItems.isEmpty {
        Menu {
          ForEach(menuItems) { item in
            Button(item.title) { performAction(item.action) }
          }
        } label: {
          Image(decorative: Icons.homeMore)
            .frame(width: height, height: height)
            .background(shape.fill(Colors.bgPrimary))
            .overlay(shape.strokeBorder(Colors.borderSecondary, lineWidth: Constants.borderLineWidth))
            .contentShape(shape)
        }
        .accessibilityLabel(Strings.moreOptions)
      }
    }
    .fixedSize()
  }
}

/// A browser with its button is read as one element, with the action of the
/// button, whose title the combined label leaves out. Where Ghostery is
/// enabled, the button of the menu is read separately.
private struct HomeBrowserAccessibility: ViewModifier {
  let browser: HomeBrowser

  func body(content: Content) -> some View {
    if browser.isEnabled {
      content
        .accessibilityElement(children: .contain)
    } else {
      content
        .singleActionAccessibility(label: [browser.name, browser.description, browser.actionTitle])
    }
  }
}

struct HomeView_Previews: PreviewProvider {
  static var previews: some View {
    HomeView()
  }
}
