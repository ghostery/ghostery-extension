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
  static let carouselCoordinateSpace = "HomeView.carousel"

  static let cardWidth: CGFloat = 180
  static let cardPadding: CGFloat = 16
  static let cardSpacing: CGFloat = 16
  static let cardCornerRadius: CGFloat = 12
  static let cardIconSize: CGFloat = 64
  static let cardTextHeight: CGFloat = 92
  static let cardTextSpacing: CGFloat = 4

  static let cardActionsSpacing: CGFloat = 4
  static let cardActionHeight: CGFloat = 40
  static let cardActionCornerRadius: CGFloat = 8

  static let alertTopPadding: CGFloat = 16
  static let alertPadding: CGFloat = 12
  static let alertSpacing: CGFloat = 12
  static let alertCornerRadius: CGFloat = 12

  static let menuOffset: CGFloat = 1
  static let menuPadding: CGFloat = 12
  static let menuSpacing: CGFloat = 12
  static let menuCornerRadius: CGFloat = 8

  static let borderLineWidth: CGFloat = 1
  static let buttonShadowRadius: CGFloat = 4
  static let buttonShadowY: CGFloat = 3
}

fileprivate enum Strings {
  // You can translate your strings here
  static let title = String(localized: "Protect your privacy.\nBlock trackers.", comment: "Title of the Home section, in two lines")
  static let description = String(localized: "Ghostery helps you take control of your data across the web.")
  static let installHeader = String(localized: "Install Ghostery in your browser")
  static let nextBrowsers = String(localized: "Next", comment: "Button scrolling to the next cards of the browsers")
  static let enabled = String(localized: "Enabled", comment: "State of Ghostery in a browser")
  static let moreOptions = String(localized: "More options")
  static let disableInSafari = String(localized: "Disable Ghostery in Safari")
  static let viewInstructions = String(localized: "View instructions", comment: "Button showing the steps to enable or disable Ghostery in Safari")
  static let openSystemSettings = String(localized: "Open System Settings", comment: "System Settings is the name of the macOS app")

  static func detectedBrowsers(_ count: Int) -> String {
    String(localized: "Detected browsers: \(count)", comment: "Number of the browsers found on the Mac, Safari included")
  }

  /// Steps to allow the access, with the names of the apps as the settings show them
  static func accessAlert(browsers: [String], appNames: [String]) -> Text {
    let bold = AppTextStyle.labelS.font
    let ghostery = Bundle.main.object(forInfoDictionaryKey: "CFBundleDisplayName") as? String ?? "Ghostery"
    let names = browsers.formatted(.list(type: .and))
    // Like "A, B, and C", in the language of the app, with each name in bold
    var boldAppNames = AttributedString(appNames.formatted(.list(type: .and)))
    var start = boldAppNames.startIndex
    for name in appNames {
      guard let range = boldAppNames[start...].range(of: name) else { continue }
      boldAppNames[range].swiftUI.font = bold
      start = range.upperBound
    }
    return Text(
      "To check if Ghostery is enabled in \(names), open System Settings, click \(Text(ghostery).font(bold)), and turn on \(Text(boldAppNames)).",
      comment: "Shown when the app can't read the data of the browsers. The first placeholder is the list of the browsers, the second one the name of the app, and the last one the list of the browsers, as named in System Settings, which is the name of the macOS app."
    )
  }
}

// Safari, and the other browsers, shown when they're found in the system
fileprivate let homeBrowsers = [
  HomeBrowser(
    kind: .safari,
    icon: Icons.browserSafari,
    description: String(localized: "Follow these simple steps to enable Ghostery in Safari."),
    enabledDescription: String(localized: "Ghostery works correctly in Safari."),
    actionTitle: Strings.viewInstructions,
    isPrimary: true
  ),
  HomeBrowser(
    kind: .external(.firefox),
    icon: Icons.browserFirefox,
    description: String(localized: "Install Ghostery addon from the Firefox\nAdd-ons store.", comment: "The line break keeps the name of the store together, and can be left out"),
    enabledDescription: String(localized: "Ghostery works correctly in Firefox."),
    actionTitle: String(localized: "Install in Firefox"),
    isPrimary: false
  ),
  HomeBrowser(
    kind: .external(.chrome),
    icon: Icons.browserChrome,
    description: String(localized: "Install Ghostery extension from the Chrome web store."),
    enabledDescription: String(localized: "Ghostery works correctly in Chrome."),
    actionTitle: String(localized: "Install in Chrome"),
    isPrimary: false
  ),
  HomeBrowser(
    kind: .external(.edge),
    icon: Icons.browserEdge,
    description: String(localized: "Install Ghostery extension from the Edge Add-ons."),
    enabledDescription: String(localized: "Ghostery works correctly in Edge."),
    actionTitle: String(localized: "Install in Edge"),
    isPrimary: false
  ),
]

struct HomeView: View {
  private let safari = SafariExtension.shared
  private let externalBrowsers = ExternalBrowserStates.shared
  @State private var showsSafariInstructions = false
  @State private var menuBrowserID: HomeBrowser.Kind?
  @State private var carouselWidth: CGFloat = 0
  /// How far the cards are scrolled
  @State private var carouselOffset: CGFloat = 0

  private var browsers: [HomeBrowser] {
    homeBrowsers.filter { browser in
      switch browser.kind {
      case .safari: return true
      case .external(let externalBrowser): return externalBrowsers.browsers.contains(externalBrowser)
      }
    }
  }

  var body: some View {
    Group {
      if showsSafariInstructions {
        SafariInstructionsView(isEnabled: safari.isEnabled, onBack: { showsSafariInstructions = false })
      } else {
        home
      }
    }
    .task { await safari.monitor() }
    .task { await externalBrowsers.monitor() }
    .onChange(of: safari.isEnabled) {
      menuBrowserID = nil
      // The last step of the instructions is going back to the app,
      // which then shows the new state on the card
      showsSafariInstructions = false
    }
  }

  private var home: some View {
    SectionScrollView {
      SectionHeader(
        title: Strings.title,
        description: Strings.description,
        descriptionStyle: .bodyL,
        image: Icons.homeHeaderProtection
      )
      browsersHeader
      browsersCarousel
      let browsersWithoutAccess = externalBrowsers.browsersWithoutAccess
      if !browsersWithoutAccess.isEmpty {
        HomeAccessAlert(
          message: Strings.accessAlert(
            browsers: browsersWithoutAccess.map(\.name),
            appNames: browsersWithoutAccess.map { $0.appName ?? $0.name }
          ),
          action: ExternalBrowser.showAccessSettings
        )
      }
    } footer: {
      Banner()
    }
    // The menu isn't clipped by the carousel, and stays over the banner
    .overlayPreferenceValue(HomeBrowserMenuAnchor.self) { anchor in
      if let anchor, let browser = browsers.first(where: { $0.id == menuBrowserID }) {
        browserMenu(for: browser, below: anchor)
      }
    }
  }

  private var browsersHeader: some View {
    VStack(alignment: .leading, spacing: Constants.browsersHeaderSpacing) {
      Text(Strings.installHeader)
        .textStyle(.labelM)
        .foregroundColor(Colors.foregroundPrimary)
        .accessibilityAddTraits(.isHeader)
      Text(Strings.detectedBrowsers(browsers.count))
        .textStyle(.labelS)
        .foregroundColor(Colors.foregroungTertiary)
    }
    .padding(.leading, Constants.browsersHeaderLeadingPadding)
    .padding(.trailing, Constants.browsersHeaderTrailingPadding)
    .padding(.bottom, Constants.browsersHeaderBottomPadding)
  }

  private var browsersCarousel: some View {
    ScrollViewReader { proxy in
      ScrollView(.horizontal, showsIndicators: false) {
        // The cards stretch to the tallest one, so their buttons line up
        HStack(alignment: .top, spacing: Constants.carouselSpacing) {
          ForEach(browsers) { browser in
            HomeBrowserCard(
              browser: browser,
              isEnabled: isEnabled(browser),
              isMenuShown: menuBrowserID == browser.id,
              action: { action(for: browser) },
              // Only Safari has options so far
              showMenu: browser.kind == .safari ? { menuBrowserID = browser.id } : nil
            )
            .frame(maxHeight: .infinity)
          }
        }
        .fixedSize(horizontal: false, vertical: true)
        .onGeometryChange(for: CGFloat.self) { geometry in
          geometry.frame(in: .named(Constants.carouselCoordinateSpace)).minX
        } action: { minX in
          carouselOffset = Constants.carouselHorizontalPadding - minX
        }
      }
      // Kept also next to the cards scrolled to the edge
      .contentMargins(.horizontal, Constants.carouselHorizontalPadding, for: .scrollContent)
      .coordinateSpace(.named(Constants.carouselCoordinateSpace))
      .onGeometryChange(for: CGFloat.self) { $0.size.width } action: { carouselWidth = $0 }
      .overlay(alignment: .topTrailing) {
        if cardsWidth > carouselWidth {
          nextBrowsersButton { showNextBrowsers(with: proxy) }
        }
      }
    }
  }

  // Of all the cards, with the spaces between them and the margins
  private var cardsWidth: CGFloat {
    let count = CGFloat(browsers.count)
    return count * Constants.cardWidth + max(count - 1, 0) * Constants.carouselSpacing
      + 2 * Constants.carouselHorizontalPadding
  }

  // Scrolls to the card after the first one shown, and from the last ones
  // back to the first one
  private func showNextBrowsers(with proxy: ScrollViewProxy) {
    let step = Constants.cardWidth + Constants.carouselSpacing
    let isAtEnd = carouselOffset >= cardsWidth - carouselWidth - 1
    let index = isAtEnd ? 0 : min(Int(carouselOffset / step) + 1, browsers.count - 1)

    withAnimation {
      proxy.scrollTo(browsers[index].id, anchor: .leading)
    }
  }

  private func nextBrowsersButton(action: @escaping () -> Void) -> some View {
    Button(action: action) {
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
    .help(Strings.nextBrowsers)
    .accessibilityLabel(Strings.nextBrowsers)
    .padding(.top, Constants.carouselButtonTopPadding)
    .padding(.trailing, Constants.carouselButtonTrailingPadding)
  }

  private func isEnabled(_ browser: HomeBrowser) -> Bool {
    switch browser.kind {
    case .safari: return safari.isEnabled
    case .external(let externalBrowser): return externalBrowsers.isGhosteryEnabled(in: externalBrowser)
    }
  }

  private func action(for browser: HomeBrowser) {
    switch browser.kind {
    case .safari: showsSafariInstructions = true
    case .external(let externalBrowser): externalBrowser.openExtensionStore()
    }
  }

  private func menuItems(for browser: HomeBrowser) -> [HomeBrowserMenu.Item] {
    guard browser.kind == .safari else { return [] }
    return [
      HomeBrowserMenu.Item(title: Strings.disableInSafari, action: SafariExtension.showSettings),
      HomeBrowserMenu.Item(title: Strings.viewInstructions, action: { showsSafariInstructions = true }),
    ]
  }

  // The menu is aligned to the trailing edge of the button below which it's shown
  private func browserMenu(for browser: HomeBrowser, below anchor: Anchor<CGRect>) -> some View {
    GeometryReader { proxy in
      let button = proxy[anchor]

      ZStack(alignment: .topLeading) {
        // Clicks outside of the menu, and the Escape key, close it
        Button(action: closeMenu) {
          Color.clear.contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .keyboardShortcut(.cancelAction)
        .accessibilityHidden(true)

        HomeBrowserMenu(items: menuItems(for: browser), onSelect: closeMenu)
          // Stays within the section, as the first card is close to its edge
          .alignmentGuide(.leading) { -max(button.maxX - $0.width, Constants.carouselHorizontalPadding) }
          .alignmentGuide(.top) { _ in -(button.maxY + Constants.menuOffset) }
      }
    }
  }

  private func closeMenu() {
    menuBrowserID = nil
  }
}

// MARK: - Browser card

struct HomeBrowser: Identifiable {
  enum Kind: Hashable {
    case safari
    case external(ExternalBrowser)
  }

  let kind: Kind
  let icon: String
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
  let browser: HomeBrowser
  /// Whether Ghostery is enabled in the browser
  var isEnabled: Bool
  var isMenuShown: Bool
  var action: () -> Void
  /// Shows the options for the enabled state, nil when there are none
  var showMenu: (() -> Void)?

  var body: some View {
    VStack(alignment: .leading, spacing: Constants.cardSpacing) {
      Image(decorative: browser.icon)
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
    .frame(width: Constants.cardWidth)
    .frame(maxHeight: .infinity)
    .cardBackground(cornerRadius: Constants.cardCornerRadius)
    .modifier(HomeBrowserCardAccessibility(browser: browser, isEnabled: isEnabled, hasMenu: showMenu != nil))
  }

  private var enabledActions: some View {
    HStack(spacing: Constants.cardActionsSpacing) {
      Text(Strings.enabled)
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

/// Shown below the cards when the state of Ghostery in some of the browsers
/// can't be checked, with the action which opens the settings to fix it
private struct HomeAccessAlert: View {
  let message: Text
  var action: () -> Void

  var body: some View {
    let shape = RoundedRectangle(cornerRadius: Constants.alertCornerRadius)

    HStack(spacing: Constants.alertSpacing) {
      Image(decorative: Icons.homeWarning)
        .renderingMode(.template)
        .foregroundColor(Colors.warning600)
      message
        .textStyle(.bodyS)
        .foregroundColor(Colors.foregroundPrimary)
        .fixedSize(horizontal: false, vertical: true)
        .frame(maxWidth: .infinity, alignment: .leading)
      Button(Strings.openSystemSettings, action: action)
        .buttonStyle(AppButtonStyle(kind: .warning, size: .small))
    }
    .padding(Constants.alertPadding)
    .background(shape.fill(Colors.bgWarningPrimary))
    .overlay(shape.strokeBorder(Colors.borderWarningPrimary, lineWidth: Constants.borderLineWidth))
    .padding(.top, Constants.alertTopPadding)
    .padding(.horizontal, Constants.carouselHorizontalPadding)
    .accessibilityElement(children: .combine)
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
      Image(decorative: isHighlighted ? Icons.homeMoreHover : Icons.homeMore)
        .frame(width: Constants.cardActionHeight, height: Constants.cardActionHeight)
        .background(shape.fill(Colors.bgPrimary))
        .overlay(
          shape.strokeBorder(
            isHighlighted ? Colors.borderTertiary : Colors.borderSecondary,
            lineWidth: Constants.borderLineWidth
          )
        )
        .contentShape(shape)
    }
    .buttonStyle(.plain)
    .onHover { isHovered = $0 }
    .help(Strings.moreOptions)
    .accessibilityLabel(Strings.moreOptions)
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
        .singleActionAccessibility(label: [browser.name, browser.enabledDescription, Strings.enabled])
    } else {
      content
        .singleActionAccessibility(label: [browser.name, browser.description, browser.actionTitle])
    }
  }
}

// MARK: - Browser menu

/// Bounds of the button whose menu is shown
private struct HomeBrowserMenuAnchor: PreferenceKey {
  static let defaultValue: Anchor<CGRect>? = nil

  static func reduce(value: inout Anchor<CGRect>?, nextValue: () -> Anchor<CGRect>?) {
    value = value ?? nextValue()
  }
}

struct HomeBrowserMenu: View {
  struct Item: Identifiable {
    let title: String
    let action: () -> Void

    var id: String { title }
  }

  let items: [Item]
  var onSelect: () -> Void

  var body: some View {
    let shape = RoundedRectangle(cornerRadius: Constants.menuCornerRadius)

    VStack(alignment: .leading, spacing: Constants.menuSpacing) {
      ForEach(items) { item in
        Button {
          onSelect()
          item.action()
        } label: {
          Text(item.title)
            .textStyle(.labelM)
            .foregroundColor(Colors.foregroundPrimary)
            .frame(maxWidth: .infinity, alignment: .leading)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
      }
    }
    .padding(Constants.menuPadding)
    .fixedSize()
    .background(shape.fill(Colors.bgPrimary))
    .overlay(shape.strokeBorder(Colors.borderSecondary, lineWidth: Constants.borderLineWidth))
    .accessibilityElement(children: .contain)
  }
}

struct HomeView_Previews: PreviewProvider {
  static var previews: some View {
    HomeView()
      .frame(width: 736, height: 668)
  }
}
