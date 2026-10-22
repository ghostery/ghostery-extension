//
//  MainNavigation.swift
//  Ghostery
//
//  Sections of the app, its dialogs, and the actions of its buttons. Both
//  apps have the same ones, except for Settings, whose options are only for
//  the macOS app. Each shows them in its own way: the macOS app in the
//  sidebar of its window, and the iOS app in its tab bar.
//

import SwiftUI

fileprivate enum Strings {
  // You can translate your strings here
  static let home = String(localized: "Home", comment: "Section of the main window")
  static let learningZone = String(localized: "Learning Zone", comment: "Section of the main window, with articles about privacy")
  static let contribute = String(localized: "Contribute", comment: "Section of the main window, with the ways to support Ghostery")
  #if os(macOS)
  static let settings = String(localized: "Settings", comment: "Section of the main window")
  #endif
}

/// Sections of the app, in the order of the sidebar and of the tab bar
enum MainSection: String, CaseIterable, Identifiable {
  case home
  case learningZone
  case contribute
  #if os(macOS)
  case settings
  #endif

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
    #if os(macOS)
    case .settings: return Strings.settings
    #endif
    }
  }

  var icon: String {
    switch self {
    case .home: return Icons.homeNavHome
    case .learningZone: return Icons.homeNavLearn
    case .contribute: return Icons.homeNavContribute
    #if os(macOS)
    case .settings: return Icons.homeNavSettings
    #endif
    }
  }
}

/// Dialogs shown over the sections
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
  private let showDialog: (MainDialog) -> Void
  private let openURL: OpenURLAction

  init(showDialog: @escaping (MainDialog) -> Void, openURL: OpenURLAction) {
    self.showDialog = showDialog
    self.openURL = openURL
  }

  @MainActor
  func callAsFunction(_ action: MainAction) {
    switch action {
    case .open(let url): openURL(url)
    case .showDialog(let dialog): showDialog(dialog)
    case .perform(let perform): perform()
    }
  }

  // Every action goes through the state of the root view, so a new one
  // doesn't need to update the views reading it
  static func == (lhs: Self, rhs: Self) -> Bool { true }
}

extension EnvironmentValues {
  @Entry var performAction = PerformAction(showDialog: { _ in }, openURL: OpenURLAction { _ in .systemAction })
}
