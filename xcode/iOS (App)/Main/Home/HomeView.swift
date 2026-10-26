//
//  HomeView.swift
//  Ghostery
//
//  Home section of the app.
//

import SwiftUI
import UIKit

fileprivate enum Constants {
  static let iconSize: CGFloat = 40
  // The browser's logo leaves a margin of the circle around it
  static let iconPadding: CGFloat = 4.44
  static let cornerRadius: CGFloat = 12

  static let enabledSpacing: CGFloat = 4
  static let enabledCornerRadius: CGFloat = 8
}

fileprivate enum Strings {
  // You can translate your strings here
  static let instructions = String(localized: "Instructions", comment: "Button showing the steps to enable Ghostery in Safari")
  static let install = String(localized: "Install", comment: "Button opening the App Store, to install the browser")
  static let open = String(localized: "Open", comment: "Button opening the browser installed on the device, to use Ghostery in it")
}

fileprivate enum URLs {
  // Redirects to Microsoft's link of Edge for iPhones and iPads, which opens
  // Edge in the App Store, or opened in Edge, the way to use Ghostery in it
  static let edge = URL(string: "https://www.ghostery.com/download/edge-mobile")!.tagged(campaign: "home")
}

/// Sizes of the browsers, which are rows one below the other on iPhones,
/// and cards next to each other on iPads
fileprivate struct HomeBrowserLayout: PlatformLayout {
  /// Between the header of the browsers and them
  var headerSpacing: CGFloat
  /// Whether the browsers are next to each other, rather than one below
  /// the other
  var isRow: Bool
  var spacing: CGFloat
  /// Whether the logo is above the texts, rather than before them
  var isIconAbove: Bool
  var padding: EdgeInsets
  /// Between the logo, the texts and the button
  var contentSpacing: CGFloat
  /// Between the name and the description
  var textSpacing: CGFloat
  var nameStyle: AppTextStyle
  var descriptionStyle: AppTextStyle
  /// Of the description, so it wraps as in the design, also next to shorter
  /// buttons
  var descriptionWidth: CGFloat?
  var buttonSize: AppButtonStyle.Size
  /// Added to the padding of the button, as in the design
  var buttonLabelPadding: CGFloat
  /// Of the state of Ghostery where it's enabled, as tall as the button, with
  /// the label as far from the edges as its title
  var enabledHeight: CGFloat
  var enabledLabelPadding: CGFloat

  static let phone = HomeBrowserLayout(
    headerSpacing: 8,
    isRow: false,
    spacing: 4,
    isIconAbove: false,
    padding: EdgeInsets(top: 12, leading: 8, bottom: 12, trailing: 8),
    contentSpacing: 8,
    textSpacing: 4,
    nameStyle: .labelL,
    descriptionStyle: .bodyS,
    descriptionWidth: 192,
    buttonSize: .small,
    buttonLabelPadding: 4,
    enabledHeight: 32,
    enabledLabelPadding: 12
  )
  static let tablet = HomeBrowserLayout(
    headerSpacing: 16,
    isRow: true,
    spacing: 16,
    isIconAbove: true,
    padding: EdgeInsets(top: 24, leading: 24, bottom: 24, trailing: 24),
    contentSpacing: 18,
    textSpacing: 8,
    nameStyle: .headlineM,
    descriptionStyle: .bodyL,
    descriptionWidth: nil,
    buttonSize: .large,
    buttonLabelPadding: 8,
    enabledHeight: 48,
    enabledLabelPadding: 20
  )
}

/// Microsoft Edge, which opens the links of its own scheme. Apps can check if
/// it's installed, as the scheme is in LSApplicationQueriesSchemes of the app.
fileprivate enum Edge {
  private static let scheme = "microsoft-edge-https"

  /// Checked when the views are created, which is on the main thread
  static var isInstalled: Bool {
    guard let url = URL(string: "\(scheme)://www.ghostery.com") else { return false }
    return MainActor.assumeIsolated { UIApplication.shared.canOpenURL(url) }
  }

  /// The link, opened in Edge
  static func link(_ url: URL) -> URL {
    guard var components = URLComponents(url: url, resolvingAgainstBaseURL: false) else { return url }
    components.scheme = scheme
    return components.url ?? url
  }
}

struct HomeView: View {
  private var safari: SafariExtension { .shared }
  @State private var showsSafariInstructions = DebugLaunch.opens(.safariInstructions)
  // The user can install Edge while the app is in the background
  @State private var isEdgeInstalled = Edge.isInstalled
  @CurrentLayout private var layout: HomeBrowserLayout
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
    SectionScrollView {
      SectionHeader(title: SectionStrings.Home.title, description: SectionStrings.Home.description)

      Text(SectionStrings.Home.installHeader)
        .textStyle(.labelL)
        .foregroundColor(Colors.foregroundPrimary)
        .accessibilityAddTraits(.isHeader)
        .padding(.bottom, layout.headerSpacing)

      CardStack(data: browsers, isRow: layout.isRow, spacing: layout.spacing) { browser in
        HomeBrowserCard(browser: browser, layout: layout)
      }
    } footer: {
      Banner()
    }
  }

  // Safari, and Edge, which the button installs from the App Store, or once
  // it's installed, opens with the same link
  private var browsers: [HomeBrowser] {
    [
      HomeBrowser(
        id: "safari",
        name: "Safari",
        icon: .browserSafari,
        description: SectionStrings.Home.safariDescription,
        enabledDescription: SectionStrings.Home.safariEnabledDescription,
        actionTitle: Strings.instructions,
        action: .perform { showsSafariInstructions = true },
        isPrimary: true,
        isEnabled: safari.isEnabled,
        menuItems: [
          HomeBrowserMenuItem(title: SectionStrings.Home.disableInSafari, action: .perform { SafariExtension.showSettings() }),
          HomeBrowserMenuItem(title: SectionStrings.Home.viewInstructions, action: .perform { showsSafariInstructions = true }),
        ]
      ),
      HomeBrowser(
        id: "edge",
        name: "Edge",
        icon: .browserEdge,
        description: SectionStrings.Home.edgeDescription,
        actionTitle: isEdgeInstalled ? Strings.open : Strings.install,
        action: .open(isEdgeInstalled ? Edge.link(URLs.edge) : URLs.edge),
        isPrimary: false
      ),
    ]
  }
}

// MARK: - Browsers

/// Browser in which the user can use Ghostery
private struct HomeBrowser: Identifiable {
  let id: String
  let name: String
  let icon: ImageResource
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

/// Browser with its button, in a row on iPhones, and in a card on iPads
private struct HomeBrowserCard: View {
  let browser: HomeBrowser
  let layout: HomeBrowserLayout

  @Environment(\.performAction) private var performAction

  var body: some View {
    let stack = layout.isIconAbove
      ? AnyLayout(VStackLayout(alignment: .leading, spacing: layout.contentSpacing))
      : AnyLayout(HStackLayout(spacing: layout.contentSpacing))

    stack {
      HomeBrowserIcon(icon: browser.icon)

      VStack(alignment: .leading, spacing: layout.textSpacing) {
        Text(browser.name)
          .textStyle(layout.nameStyle)
          .foregroundColor(Colors.foregroundPrimary)
        Text(browser.currentDescription)
          .textStyle(layout.descriptionStyle)
          .foregroundColor(Colors.foregroundSecondary)
          .fixedSize(horizontal: false, vertical: true)
          .frame(maxWidth: layout.descriptionWidth, alignment: .leading)
      }
      .frame(maxWidth: .infinity, alignment: .leading)
      // Longer texts make the cards taller
      .frame(maxHeight: layout.isIconAbove ? .infinity : nil, alignment: .top)

      if browser.isEnabled {
        HomeBrowserEnabledState(
          menuItems: browser.menuItems,
          height: layout.enabledHeight,
          labelPadding: layout.enabledLabelPadding
        )
      } else {
        Button {
          performAction(browser.action)
        } label: {
          Text(browser.actionTitle)
            .padding(.horizontal, layout.buttonLabelPadding)
        }
        .buttonStyle(AppButtonStyle(kind: browser.isPrimary ? .primary : .secondary, size: layout.buttonSize))
        .fixedSize()
      }
    }
    .padding(layout.padding)
    .frame(maxWidth: .infinity, maxHeight: layout.isIconAbove ? .infinity : nil, alignment: .topLeading)
    .cardBackground(cornerRadius: Constants.cornerRadius)
    .modifier(HomeBrowserAccessibility(browser: browser))
  }
}

/// Logo of a browser, on a white circle
private struct HomeBrowserIcon: View {
  let icon: ImageResource

  var body: some View {
    Image(icon)
      .resizable()
      .accessibilityHidden(true)
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
      Text(SectionStrings.Home.enabled)
        .textStyle(.labelM)
        .foregroundColor(Colors.foregroundSuccessPrimary)
        .lineLimit(1)
        .padding(.horizontal, labelPadding)
        .frame(minHeight: height)
        .background(shape.fill(Colors.bgSuccessPrimary))

      if !menuItems.isEmpty {
        Menu {
          ForEach(menuItems) { item in
            Button(item.title) { performAction(item.action) }
          }
        } label: {
          Image(.homeMore)
            .accessibilityHidden(true)
            .frame(width: height, height: height)
            .background(shape.fill(Colors.bgPrimary))
            .overlay(shape.strokeBorder(Colors.borderSecondary, lineWidth: Borders.width))
            .contentShape(shape)
        }
        .accessibilityLabel(SectionStrings.Home.moreOptions)
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

#Preview {
  HomeView()
}
