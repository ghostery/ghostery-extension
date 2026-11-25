//
//  SectionPage.swift
//  Ghostery
//
//  Building blocks of the pages of the sections, which the apps lay out in
//  their own ways. On the Mac, the header has the illustration of the
//  section, and the banner stays at the bottom of taller windows. On
//  iPhones and iPads, the page is a column below the title bar with the
//  logo, with the banner after its content.
//

import SwiftUI
#if os(iOS)
import UIKit
#endif

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
  static let backIconSize: CGFloat = 16
  #else
  // The column of a section stays centered in wider windows, like on iPads
  // in landscape
  static let maxWidth: CGFloat = 1032

  // Title bar, the same on iPhones and iPads. Its background fades in from
  // the top of the screen, and the border is below it.
  static let titleBarHeight: CGFloat = 52
  static let titleBarOpacity: Double = 0.5
  static let titleBarBorderColor = Color(hex: "#CCE8F5")
  static let titleBarLeadingPadding: CGFloat = 16
  static let titleBarTrailingPadding: CGFloat = 20
  static let logoHeight: CGFloat = 32
  // The round back button can be tapped also around its circle
  static let backButtonSize: CGFloat = 44
  static let backCircleSize: CGFloat = 36
  // The item at the trailing edge, like the button restoring the
  // donations, wraps into two lines, and its longer words shrink to fit
  static let trailingItemWidth: CGFloat = 100
  static let trailingItemLineLimit = 2
  static let trailingItemMinimumScale: CGFloat = 0.5
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
  /// Below the title bar
  var topPadding: CGFloat
  var bottomPadding: CGFloat
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
    topPadding: 20,
    bottomPadding: 16,
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
    topPadding: 40,
    bottomPadding: 40,
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
    // The content scrolls below the tab bar, which floats over it, but only
    // below the title bar, whose background would let it show through
    .mask {
      Rectangle()
        .ignoresSafeArea(edges: .bottom)
    }
    #endif
  }
}

extension SectionScrollView where Footer == EmptyView {
  init(@ViewBuilder content: () -> Content) {
    self.init(content: content) { EmptyView() }
  }
}

/// Header of a section, with its title and description. On the Mac, the
/// illustration of the section follows them.
struct SectionHeader: View {
  /// Lines of the title, separated with "\n"
  var title: String
  var description: String?
  /// Whether the description is one of the longer ones, which are smaller
  var isDescriptionLong = false
  /// Shown on the Mac
  var image: ImageResource?
  #if os(iOS)
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

#if os(macOS)
/// Goes back from a subpage to its section, at the top of the subpage.
/// On iPhones and iPads, the title bar has the button.
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
      .contentShape(Rectangle())
    }
    .buttonStyle(.plain)
  }
}
#endif

/// Page of a section with a subpage opening from it. On iPhones and iPads,
/// the subpage slides in on a navigation stack, below the title bar, which
/// then has the button going back. The user can also go back by swiping
/// from the leading edge of the screen, or with the escape gesture of
/// VoiceOver. On the Mac, the subpage replaces the page, and has its own
/// buttons at its top.
struct SectionNavigation<Page: View, Subpage: View, TitleBarItem: View>: View {
  @Binding var showsSubpage: Bool
  private let page: Page
  private let subpage: Subpage
  private let titleBarItem: TitleBarItem

  #if os(iOS)
  @State private var titleBarHeight = Constants.titleBarHeight + Borders.width
  #endif

  /// - Parameter titleBarItem: At the trailing edge of the title bar with
  ///   the subpage, on iPhones and iPads
  init(
    showsSubpage: Binding<Bool>,
    @ViewBuilder page: () -> Page,
    @ViewBuilder subpage: () -> Subpage,
    @ViewBuilder titleBarItem: () -> TitleBarItem = { EmptyView() }
  ) {
    _showsSubpage = showsSubpage
    self.page = page()
    self.subpage = subpage()
    self.titleBarItem = titleBarItem()
  }

  var body: some View {
    #if os(macOS)
    if showsSubpage {
      subpage
    } else {
      page
    }
    #else
    NavigationStack {
      page
        .sectionStackPage(titleBarHeight: titleBarHeight)
        .navigationDestination(isPresented: $showsSubpage) {
          subpage
            .sectionStackPage(titleBarHeight: titleBarHeight)
            .accessibilityAction(.escape) { showsSubpage = false }
        }
    }
    // The pages slide below the title bar
    .safeAreaInset(edge: .top, spacing: 0) {
      SectionTitleBar(onBack: showsSubpage ? { showsSubpage = false } : nil) {
        if showsSubpage {
          titleBarItem
        }
      }
      .onGeometryChange(for: CGFloat.self) { $0.size.height } action: { titleBarHeight = $0 }
    }
    #endif
  }
}

#if os(iOS)
extension View {
  /// Shows the title bar of the app above the page of a section without
  /// subpages, which `SectionNavigation` shows for the others
  func sectionTitleBar() -> some View {
    safeAreaInset(edge: .top, spacing: 0) {
      SectionTitleBar(onBack: nil) { EmptyView() }
    }
  }

  /// A page on the navigation stack of a section, without the navigation
  /// bar of the system, as the title bar replaces it. The space of the title
  /// bar, which the stack doesn't pass to its pages, is added to its safe
  /// area. It has its own copy of the background of the app, also behind the
  /// title bar, so the pages don't show through each other while one slides
  /// over the other.
  fileprivate func sectionStackPage(titleBarHeight: CGFloat) -> some View {
    safeAreaPadding(.top, titleBarHeight)
      .toolbar(.hidden, for: .navigationBar)
      .containerBackground(for: .navigation) {
        MainBackground()
      }
      .background(SwipeBackEnabler())
  }
}

/// Keeps the swipe from the leading edge of the screen going back on the
/// navigation stacks of the sections, which UIKit turns off with their
/// hidden navigation bars. Each page of a stack sets it up when it appears,
/// as the app can open on a subpage, without showing the page below it.
private struct SwipeBackEnabler: UIViewControllerRepresentable {
  func makeUIViewController(context: Context) -> SwipeBackController {
    SwipeBackController()
  }

  func updateUIViewController(_ controller: SwipeBackController, context: Context) {}
}

private final class SwipeBackController: UIViewController {
  override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
    navigationController?.interactivePopGestureRecognizer?.delegate = SwipeBackDelegate.shared
  }
}

/// Lets the swipe begin on a subpage. Shared by the stacks, and kept, as
/// the gesture recognizer only holds its delegate weakly.
@MainActor
private final class SwipeBackDelegate: NSObject, UIGestureRecognizerDelegate {
  static let shared = SwipeBackDelegate()

  func gestureRecognizerShouldBegin(_ gestureRecognizer: UIGestureRecognizer) -> Bool {
    // The stack whose view has the gesture recognizer
    guard let navigationController = gestureRecognizer.view?.next as? UINavigationController else { return false }
    // Only on a subpage, and not while a page is still sliding in or out,
    // which leaves the stack stuck
    return navigationController.viewControllers.count > 1 && navigationController.transitionCoordinator == nil
  }
}

/// Title bar of the app, with the logo in its center. On a subpage, it has
/// the button going back to its section, and it can have an item at its
/// trailing edge, like a text button.
private struct SectionTitleBar<TrailingItem: View>: View {
  private let onBack: (() -> Void)?
  private let trailingItem: TrailingItem

  init(onBack: (() -> Void)?, @ViewBuilder trailingItem: () -> TrailingItem) {
    self.onBack = onBack
    self.trailingItem = trailingItem()
  }

  var body: some View {
    VStack(spacing: 0) {
      ZStack {
        Image(.homeLogo)
          .resizable()
          .scaledToFit()
          .frame(height: Constants.logoHeight)
          .accessibilityHidden(true)

        HStack(spacing: 0) {
          if let onBack {
            SectionTitleBarBackButton(action: onBack)
          }
          Spacer(minLength: 0)
          if TrailingItem.self != EmptyView.self {
            trailingItem
              .buttonStyle(.plain)
              .textStyle(.labelM)
              .foregroundColor(Colors.foregroundPrimary)
              .multilineTextAlignment(.trailing)
              .lineLimit(Constants.trailingItemLineLimit)
              .minimumScaleFactor(Constants.trailingItemMinimumScale)
              .frame(maxWidth: Constants.trailingItemWidth, alignment: .trailing)
          }
        }
        .padding(.leading, Constants.titleBarLeadingPadding)
        .padding(.trailing, Constants.titleBarTrailingPadding)
        // The buttons of a subpage fade in while it slides in
        .animation(.default, value: onBack == nil)
      }
      // Taller only for the largest sizes of text
      .frame(maxWidth: .infinity, minHeight: Constants.titleBarHeight)

      Constants.titleBarBorderColor
        .frame(height: Borders.width)
    }
    .background {
      LinearGradient(
        colors: [Colors.bgPrimary.opacity(0), Colors.bgPrimary.opacity(Constants.titleBarOpacity)],
        startPoint: .top,
        endPoint: .bottom
      )
      .ignoresSafeArea(edges: .top)
    }
  }
}

/// Round button of the title bar, going back from a subpage to its section
private struct SectionTitleBarBackButton: View {
  var action: () -> Void

  var body: some View {
    Button(action: action) {
      Image(.titleBarBack)
        .frame(width: Constants.backCircleSize, height: Constants.backCircleSize)
        .background(Circle().fill(Colors.bgPrimary))
        .overlay(Circle().strokeBorder(Constants.titleBarBorderColor, lineWidth: Borders.width))
        .frame(width: Constants.backButtonSize, height: Constants.backButtonSize)
        .contentShape(Rectangle())
    }
    .buttonStyle(.plain)
    .accessibilityLabel(Strings.back)
  }
}
#endif

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
