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

  static let alertTopPadding: CGFloat = 16
  static let alertPadding: CGFloat = 12
  static let alertSpacing: CGFloat = 12
  static let alertCornerRadius: CGFloat = 12

  // Between the button and the menu below it
  static let menuOffset: CGFloat = 1

  static let buttonShadowRadius: CGFloat = 4
  static let buttonShadowY: CGFloat = 3
}

fileprivate enum Strings {
  // You can translate your strings here
  static let nextBrowsers = String(localized: "Next", comment: "Button scrolling to the next cards of the browsers")
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
    icon: .browserSafari,
    description: SectionStrings.Home.safariDescription,
    enabledDescription: SectionStrings.Home.safariEnabledDescription,
    actionTitle: SectionStrings.Home.viewInstructions,
    isPrimary: true
  ),
  HomeBrowser(
    kind: .external(.firefox),
    icon: .browserFirefox,
    description: String(localized: "Install Ghostery addon from the Firefox\nAdd-ons store.", comment: "The line break keeps the name of the store together, and can be left out"),
    enabledDescription: String(localized: "Ghostery works correctly in Firefox."),
    actionTitle: String(localized: "Install in Firefox"),
    isPrimary: false
  ),
  HomeBrowser(
    kind: .external(.chrome),
    icon: .browserChrome,
    description: String(localized: "Install Ghostery extension from the Chrome web store."),
    enabledDescription: String(localized: "Ghostery works correctly in Chrome."),
    actionTitle: String(localized: "Install in Chrome"),
    isPrimary: false
  ),
  HomeBrowser(
    kind: .external(.edge),
    icon: .browserEdge,
    description: SectionStrings.Home.edgeDescription,
    enabledDescription: String(localized: "Ghostery works correctly in Edge."),
    actionTitle: String(localized: "Install in Edge"),
    isPrimary: false
  ),
]

struct HomeView: View {
  private var safari: SafariExtension { .shared }
  private var externalBrowsers: ExternalBrowserStates { .shared }
  @State private var showsSafariInstructions = DebugLaunch.opens(.safariInstructions)
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
        title: SectionStrings.Home.title,
        description: SectionStrings.Home.description,
        image: .homeHeaderProtection
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
      Text(SectionStrings.Home.installHeader)
        .textStyle(.labelM)
        .foregroundColor(Colors.foregroundPrimary)
        .accessibilityAddTraits(.isHeader)
      Text(Strings.detectedBrowsers(browsers.count))
        .textStyle(.labelS)
        .foregroundColor(Colors.foregroundTertiary)
    }
    .padding(.leading, Constants.browsersHeaderLeadingPadding)
    .padding(.trailing, Constants.browsersHeaderTrailingPadding)
    .padding(.bottom, Constants.browsersHeaderBottomPadding)
  }

  private var browsersCarousel: some View {
    ScrollViewReader { proxy in
      ScrollView(.horizontal, showsIndicators: false) {
        CardStack(data: browsers, isRow: true, spacing: Constants.carouselSpacing) { browser in
          HomeBrowserCard(
            browser: browser,
            isEnabled: isEnabled(browser),
            isMenuShown: menuBrowserID == browser.id,
            action: { action(for: browser) },
            // Only Safari has options so far
            showMenu: browser.kind == .safari ? { menuBrowserID = browser.id } : nil
          )
        }
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
    return count * HomeBrowserCard.width + max(count - 1, 0) * Constants.carouselSpacing
      + 2 * Constants.carouselHorizontalPadding
  }

  // Scrolls to the card after the first one shown, and from the last ones
  // back to the first one
  private func showNextBrowsers(with proxy: ScrollViewProxy) {
    let step = HomeBrowserCard.width + Constants.carouselSpacing
    let isAtEnd = carouselOffset >= cardsWidth - carouselWidth - 1
    let index = isAtEnd ? 0 : min(Int(carouselOffset / step) + 1, browsers.count - 1)

    withAnimation {
      proxy.scrollTo(browsers[index].id, anchor: .leading)
    }
  }

  private func nextBrowsersButton(action: @escaping () -> Void) -> some View {
    Button(action: action) {
      Image(.homeChevronRight)
        .frame(width: Constants.carouselButtonSize, height: Constants.carouselButtonSize)
        .background(
          Circle()
            .fill(Colors.bgPrimary)
            .shadow(color: Colors.shadowButton, radius: Constants.buttonShadowRadius, y: Constants.buttonShadowY)
        )
        .overlay(Circle().strokeBorder(Colors.borderSecondary, lineWidth: Borders.width))
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
      HomeBrowserMenu.Item(title: SectionStrings.Home.disableInSafari, action: SafariExtension.showSettings),
      HomeBrowserMenu.Item(title: SectionStrings.Home.viewInstructions, action: { showsSafariInstructions = true }),
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

// MARK: - Access alert

/// Shown below the cards when the state of Ghostery in some of the browsers
/// can't be checked, with the action which opens the settings to fix it
private struct HomeAccessAlert: View {
  let message: Text
  var action: () -> Void

  var body: some View {
    let shape = RoundedRectangle(cornerRadius: Constants.alertCornerRadius)

    HStack(spacing: Constants.alertSpacing) {
      Image(.homeWarning)
        .renderingMode(.template)
        .accessibilityHidden(true)
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
    .overlay(shape.strokeBorder(Colors.borderWarningPrimary, lineWidth: Borders.width))
    .padding(.top, Constants.alertTopPadding)
    .padding(.horizontal, Constants.carouselHorizontalPadding)
    .accessibilityElement(children: .combine)
  }
}

#Preview {
  HomeView()
    .frame(width: 736, height: 668)
}
