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

  // Between the button and the menu below it
  static let menuOffset: CGFloat = 1

  static let buttonShadowRadius: CGFloat = 4
  static let buttonShadowY: CGFloat = 3
}

fileprivate enum Strings {
  // You can translate your strings here
  static let nextBrowsers = String(localized: "Next", comment: "Button scrolling to the next cards of the browsers")
  // Of Chrome, and of Brave, which installs extensions from the same store
  static let chromeWebStoreDescription = String(localized: "One click in the\nChrome Web Store.", comment: "The line break keeps the name of the store together, and can be left out")

  static func removeFrom(_ browser: String) -> String {
    String(localized: "Remove from \(browser)", comment: "Option of the card of a browser, opening the page of Ghostery in its extension store, which has the button removing it. The name of the browser is like Chrome or Firefox.")
  }

  static func protectedBrowsers(_ count: Int, of total: Int) -> String {
    String(localized: "\(count)/\(total) protected", comment: "Number of the browsers in which Ghostery is enabled, of all the browsers found on the Mac, Safari included")
  }
}

// Safari, and the other browsers by popularity, shown when they're found in
// the system
fileprivate let homeBrowsers = [
  HomeBrowser(
    kind: .safari,
    icon: .browserSafari,
    description: SectionStrings.Home.safariDescription,
    enabledDescription: SectionStrings.Home.enabledDescription,
    actionTitle: SectionStrings.Home.viewInstructions,
    isPrimary: true
  ),
  HomeBrowser(
    kind: .external(.chrome),
    icon: .browserChrome,
    description: Strings.chromeWebStoreDescription,
    enabledDescription: SectionStrings.Home.enabledDescription,
    actionTitle: String(localized: "Add to Chrome", comment: "Button opening Ghostery in the Chrome Web Store"),
    isPrimary: false
  ),
  HomeBrowser(
    kind: .external(.edge),
    icon: .browserEdge,
    description: SectionStrings.Home.edgeDescription,
    enabledDescription: SectionStrings.Home.enabledDescription,
    actionTitle: String(localized: "Add to Edge", comment: "Button opening Ghostery in the Edge Add-ons store"),
    isPrimary: false
  ),
  HomeBrowser(
    kind: .external(.firefox),
    icon: .browserFirefox,
    description: String(localized: "One click in\nFirefox Add-ons.", comment: "The line break keeps the name of the store together, and can be left out"),
    enabledDescription: SectionStrings.Home.enabledDescription,
    actionTitle: String(localized: "Add to Firefox", comment: "Button opening Ghostery in the Firefox Add-ons store"),
    isPrimary: false
  ),
  HomeBrowser(
    kind: .external(.opera),
    icon: .browserOpera,
    description: String(localized: "One click in\nOpera Add-ons.", comment: "The line break keeps the name of the store together, and can be left out"),
    enabledDescription: SectionStrings.Home.enabledDescription,
    actionTitle: String(localized: "Add to Opera", comment: "Button opening Ghostery in the Opera Add-ons store"),
    isPrimary: false
  ),
  HomeBrowser(
    kind: .external(.brave),
    icon: .browserBrave,
    description: Strings.chromeWebStoreDescription,
    enabledDescription: SectionStrings.Home.enabledDescription,
    actionTitle: String(localized: "Add to Brave", comment: "Button opening Ghostery in the Chrome Web Store, from which Brave installs extensions"),
    isPrimary: false
  ),
]

struct HomeView: View {
  private var safari: SafariExtension { .shared }
  private var externalBrowsers: ExternalBrowserStates { .shared }
  @Environment(\.performAction) private var performAction
  @State private var showsSafariInstructions = DebugLaunch.opens(.safariInstructions)
  @State private var menuBrowserID: HomeBrowser.Kind?
  /// Of the browsers opening the extension store, whose buttons wait for it
  @State private var openingBrowserIDs: Set<HomeBrowser.Kind> = []
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
      Text(SectionStrings.Home.browsersHeader)
        .textStyle(.labelM)
        .foregroundColor(Colors.foregroundPrimary)
        .accessibilityAddTraits(.isHeader)
      Text(Strings.protectedBrowsers(browsers.filter(isEnabled).count, of: browsers.count))
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
            needsAccess: needsAccess(browser),
            isLoading: openingBrowserIDs.contains(browser.id),
            isMenuShown: menuBrowserID == browser.id,
            action: { action(for: browser) },
            showMenu: { menuBrowserID = browser.id }
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

  private func needsAccess(_ browser: HomeBrowser) -> Bool {
    guard case .external(let externalBrowser) = browser.kind else { return false }
    return externalBrowsers.needsAccess(to: externalBrowser)
  }

  private func action(for browser: HomeBrowser) {
    switch browser.kind {
    case .safari: showsSafariInstructions = true
    case .external(let externalBrowser) where externalBrowsers.needsAccess(to: externalBrowser):
      performAction(.showDialog(.browserAccess(externalBrowser)))
    case .external(let externalBrowser):
      openingBrowserIDs.insert(browser.id)
      Task {
        // Buttons take the click which brings their window to the front, so
        // the second click of a double-click waits too, as it can come when
        // the browser is already in front
        let doubleClickEnd = ContinuousClock.now + .seconds(NSEvent.doubleClickInterval)
        await externalBrowser.openExtensionStore()
        try? await Task.sleep(until: doubleClickEnd)
        openingBrowserIDs.remove(browser.id)
      }
    }
  }

  private func menuItems(for browser: HomeBrowser) -> [HomeBrowserMenu.Item] {
    switch browser.kind {
    case .safari:
      return [
        HomeBrowserMenu.Item(title: SectionStrings.Home.disableInSafari, action: SafariExtension.showSettings),
        HomeBrowserMenu.Item(title: SectionStrings.Home.viewInstructions, action: { showsSafariInstructions = true }),
      ]
    case .external(let externalBrowser):
      return [
        HomeBrowserMenu.Item(title: Strings.removeFrom(externalBrowser.name)) {
          Task { await externalBrowser.openRemovalPage() }
        },
      ]
    }
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

#Preview {
  HomeView()
    .frame(width: 736, height: 668)
}
