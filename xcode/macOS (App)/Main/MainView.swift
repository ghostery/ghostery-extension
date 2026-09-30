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
  static let home = "Home"
  static let learningZone = "Learning Zone"
  static let contribute = "Contribute"
  static let settings = "Settings"
}

/// Sections of the main window, in the order of the sidebar
enum MainSection: String, CaseIterable, Identifiable {
  case home
  case learningZone
  case contribute
  case settings

  var id: Self { self }

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

/// Dialogs shown over the sections of the main window
enum MainDialog {
  case support
  case otherDevice
}

extension EnvironmentValues {
  /// Shows a dialog over the sections of the main window
  @Entry var showDialog: (MainDialog) -> Void = { _ in }
}

struct MainView: View {
  // Restored with the window, like the selection of native sidebars. Views
  // that SwiftUI inserts for a change of scene storage aren't updated when
  // their bindings change, so the selection is a state saved to it instead.
  @SceneStorage("MainView.section") private var restoredSection = MainSection.home
  @State private var section = MainSection.home
  @State private var dialog: MainDialog?

  var body: some View {
    VStack(spacing: 0) {
      titleBar
      HStack(alignment: .top, spacing: 0) {
        MainSidebar(selection: $section, onSupport: { showDialog(.support) })
        detail
          .frame(maxWidth: .infinity, maxHeight: .infinity)
      }
      .environment(\.showDialog, showDialog)
      // A dialog covers the content below the title bar, but not the title bar
      .disabled(dialog != nil)
      .accessibilityHidden(dialog != nil)
      .blur(radius: dialog != nil ? Constants.dialogBlurRadius : 0)
      .overlay {
        if let dialog {
          dialogView(dialog)
        }
      }
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
    .onAppear { section = restoredSection }
    .onChange(of: section) { restoredSection = section }
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
  }
}
