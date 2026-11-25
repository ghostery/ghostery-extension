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
}

/// Section requested by a link to the app, handled by the app delegate,
/// until the main window shows it
@MainActor
@Observable
final class AppLinks {
  static let shared = AppLinks()

  var section: MainSection?
}

struct MainView: View {
  // Restored with the window, like the selection of native sidebars. Views
  // that SwiftUI inserts for a change of scene storage aren't updated when
  // their bindings change, so the selection is a state saved to it instead.
  @SceneStorage("MainView.section") private var restoredSection = MainSection.home
  @State private var section = MainSection.home
  @State private var dialogs = DialogPresenter()

  var body: some View {
    VStack(spacing: 0) {
      titleBar
      HStack(alignment: .top, spacing: 0) {
        MainSidebar(selection: $section, onSupport: { dialogs.show(.support) })
        detail
          .frame(maxWidth: .infinity, maxHeight: .infinity)
      }
      // A dialog covers the content below the title bar, but not the title bar
      .dialogHost(dialogs, barHeight: Constants.titleBarHeight)
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
    .task { await dialogs.showSafariOnboardingIfNeeded() }
    .onAppear { section = DebugLaunch.section ?? restoredSection }
    .onChange(of: section) { restoredSection = section }
    // Also for the link launching the app, before the window is shown
    .onChange(of: AppLinks.shared.section, initial: true) {
      guard let section = AppLinks.shared.section else { return }
      AppLinks.shared.section = nil
      open(section)
    }
  }

  private func open(_ section: MainSection) {
    dialogs.dismiss()
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

  // The window's traffic lights are drawn by the system on top of this bar
  private var titleBar: some View {
    Image(.homeLogo)
      .accessibilityHidden(true)
      .frame(maxWidth: .infinity)
      .frame(height: Constants.titleBarHeight)
  }
}

#Preview {
  MainView()
}
