//
//  MainView.swift
//  Ghostery
//
//  Root view of the main window. The title bar and the sidebar are shared,
//  and the section selected in the sidebar is shown next to them.
//

import SwiftUI

fileprivate enum Constants {
  static let windowWidth: CGFloat = 800
  static let windowHeight: CGFloat = 720
  static let windowMinHeight: CGFloat = 500

  static let titleBarHeight: CGFloat = 52

  static let dialogBlurRadius: CGFloat = 8
  static let dialogBackdropOpacity: Double = 0.5
  static let dialogMargin: CGFloat = 17
  static let dialogAnimationDuration: Double = 0.2
}

fileprivate enum Strings {
  // You can translate your strings here
  static let home = String(localized: "Home", comment: "Section of the main window")
  static let learningZone = String(localized: "Learning Zone", comment: "Section of the main window, with articles about privacy")
  static let contribute = String(localized: "Contribute", comment: "Section of the main window, with the ways to support Ghostery")
  static let settings = String(localized: "Settings", comment: "Section of the main window")
}

/// Sections of the main window, in the order of the sidebar
enum MainSection: String, CaseIterable, Identifiable {
  case home
  case learningZone
  case contribute
  case settings

  var id: Self { self }

  /// Section opened by a link to the app, like the one of the settings
  /// page of the extension in Safari
  init?(url: URL) {
    guard url.scheme == "ghosteryapp" else { return nil }
    // The extension links only to the contribution page so far
    self = .contribute
  }

  var title: String {
    switch self {
    case .home: return Strings.home
    case .learningZone: return Strings.learningZone
    case .contribute: return Strings.contribute
    case .settings: return Strings.settings
    }
  }

  var icon: String {
    switch self {
    case .home: return Icons.homeNavHome
    case .learningZone: return Icons.homeNavLearn
    case .contribute: return Icons.homeNavContribute
    case .settings: return Icons.homeNavSettings
    }
  }
}

/// Section requested by a link to the app, handled by the app delegate,
/// until the main window shows it
@MainActor
@Observable
final class AppLinks {
  static let shared = AppLinks()

  var section: MainSection?
}

/// Dialogs shown over the sections of the main window
enum MainDialog {
  case support
  case otherDevice
  case spreadTheWord
  case safariOnboarding
  case safariEnabled
}

/// What a button of a card or a banner does
enum MainAction {
  /// Opens the link in the browser
  case open(URL)
  case showDialog(MainDialog)
  /// Changes the view showing the button, like showing its subpage
  case perform(@MainActor () -> Void)
}

/// Performs the action of a button, called like a function, as SwiftUI's
/// own actions
struct PerformAction: Equatable {
  fileprivate let showDialog: (MainDialog) -> Void
  fileprivate let openURL: OpenURLAction

  @MainActor
  func callAsFunction(_ action: MainAction) {
    switch action {
    case .open(let url): openURL(url)
    case .showDialog(let dialog): showDialog(dialog)
    case .perform(let perform): perform()
    }
  }

  // Every action goes through the state of the main window, so a new one
  // doesn't need to update the views reading it
  static func == (lhs: Self, rhs: Self) -> Bool { true }
}

extension EnvironmentValues {
  @Entry var performAction = PerformAction(showDialog: { _ in }, openURL: OpenURLAction { _ in .systemAction })
}

struct MainView: View {
  // Restored with the window, like the selection of native sidebars. Views
  // that SwiftUI inserts for a change of scene storage aren't updated when
  // their bindings change, so the selection is a state saved to it instead.
  @SceneStorage("MainView.section") private var restoredSection = MainSection.home
  @State private var section = MainSection.home
  @State private var dialog: MainDialog?
  // Whether the app checked if it should show the onboarding, which it
  // does only when it opens for the first time
  @AppStorage("MainView.safariOnboardingChecked") private var isSafariOnboardingChecked = false
  @Environment(\.openURL) private var openURL

  var body: some View {
    VStack(spacing: 0) {
      titleBar
      HStack(alignment: .top, spacing: 0) {
        MainSidebar(selection: $section, onSupport: { showDialog(.support) })
        detail
          .frame(maxWidth: .infinity, maxHeight: .infinity)
      }
      // A dialog covers the content below the title bar, but not the title bar
      .disabled(dialog != nil)
      .accessibilityHidden(dialog != nil)
      .blur(radius: dialog != nil ? Constants.dialogBlurRadius : 0)
      .overlay {
        if let dialog {
          dialogView(dialog)
        }
      }
      // For the buttons of the sections and of the dialogs
      .environment(\.performAction, PerformAction(showDialog: showDialog, openURL: openURL))
    }
    .frame(width: Constants.windowWidth)
    .frame(maxHeight: .infinity)
    .background(background)
    .ignoresSafeArea()
    // SwiftUI sizes the window to fit the content below the title bar,
    // so leave the title bar out of the window heights
    .frame(width: Constants.windowWidth)
    .frame(
      minHeight: Constants.windowMinHeight - MainWindowConfigurator.titleBarHeight,
      idealHeight: Constants.windowHeight - MainWindowConfigurator.titleBarHeight,
      maxHeight: .infinity
    )
    .background(
      MainWindowConfigurator(size: CGSize(width: Constants.windowWidth, height: Constants.windowHeight))
    )
    .preferredColorScheme(.light)
    .task { await showSafariOnboardingIfNeeded() }
    .onAppear { section = restoredSection }
    .onChange(of: section) { restoredSection = section }
    // Also for the link launching the app, before the window is shown
    .onChange(of: AppLinks.shared.section, initial: true) {
      guard let section = AppLinks.shared.section else { return }
      AppLinks.shared.section = nil
      open(section)
    }
  }

  private func open(_ section: MainSection) {
    dialog = nil
    self.section = section
    // When the link launches the app, the restored section is applied after it
    restoredSection = section
  }

  @ViewBuilder
  private var detail: some View {
    switch section {
    case .home:
      HomeView()
    case .learningZone:
      LearningZoneView()
    case .contribute:
      BecomeContributorView()
    case .settings:
      SettingsView()
    }
  }

  // Frosted glass at the top, fading into solid white towards the bottom
  private var background: some View {
    LinearGradient(
      colors: [Colors.bgPrimary.opacity(0), Colors.bgPrimary],
      startPoint: .top,
      endPoint: .bottom
    )
    .background(MainWindowBackground())
  }

  // The dialog over a frosted backdrop, which closes it when clicked
  private func dialogView(_ dialog: MainDialog) -> some View {
    ZStack {
      Colors.bgPrimary
        .opacity(Constants.dialogBackdropOpacity)
        .contentShape(Rectangle())
        .onTapGesture { closeDialog() }
        .accessibilityHidden(true)
      DialogLayout(titleBarHeight: Constants.titleBarHeight) {
        switch dialog {
        case .support:
          SupportDialog(onClose: closeDialog)
        case .otherDevice:
          OtherDeviceDialog(onClose: closeDialog)
        case .spreadTheWord:
          SpreadTheWordDialog(onClose: closeDialog)
        case .safariOnboarding:
          SafariOnboardingDialog(onClose: closeDialog, onEnabled: { showDialog(.safariEnabled) })
        case .safariEnabled:
          SafariEnabledDialog(onClose: closeDialog)
        }
      }
      .padding(Constants.dialogMargin)
    }
    .transition(.opacity)
  }

  private func showDialog(_ dialog: MainDialog) {
    withAnimation(.easeOut(duration: Constants.dialogAnimationDuration)) {
      self.dialog = dialog
    }
  }

  private func closeDialog() {
    withAnimation(.easeOut(duration: Constants.dialogAnimationDuration)) {
      dialog = nil
    }
  }

  // Shows the steps to enable the extension, unless it's enabled already.
  // When Safari can't tell, it's checked again the next time.
  private func showSafariOnboardingIfNeeded() async {
    #if DEBUG
    // Debug builds show it on every launch, to make working on it easier
    let isChecked = false
    #else
    let isChecked = isSafariOnboardingChecked
    #endif
    guard !isChecked, let isEnabled = await SafariExtension.shared.refresh() else { return }

    isSafariOnboardingChecked = true
    if !isEnabled {
      showDialog(.safariOnboarding)
    }
  }

  // The window's traffic lights are drawn by the system on top of this bar
  private var titleBar: some View {
    Image(decorative: Icons.homeLogo)
      .frame(maxWidth: .infinity)
      .frame(height: Constants.titleBarHeight)
  }
}

/// Centers a dialog in the window rather than in the space below the title
/// bar, as long as it stays below the title bar
private struct DialogLayout: Layout {
  var titleBarHeight: CGFloat

  func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
    proposal.replacingUnspecifiedDimensions()
  }

  func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
    guard let dialog = subviews.first else { return }
    let size = dialog.sizeThatFits(ProposedViewSize(bounds.size))
    let top = max(bounds.midY - titleBarHeight / 2 - size.height / 2, bounds.minY)
    dialog.place(at: CGPoint(x: bounds.midX, y: top), anchor: .top, proposal: ProposedViewSize(size))
  }
}

struct MainView_Previews: PreviewProvider {
  static var previews: some View {
    MainView()
      .environment(Donations())
  }
}
