//
//  DebugLaunch.swift
//  Ghostery
//
//  Launch arguments of the Debug builds, which open the app on a section,
//  a page or a dialog, and keep the banner on an item, for UI tests,
//  screenshots and checking changes. The Debug schemes have them, turned
//  off. Release builds ignore them.
//
//    -DebugLaunch.section home | learningZone | contribute | settings
//    -DebugLaunch.page safariInstructions | donation
//    -DebugLaunch.dialog support | otherDevice | spreadTheWord |
//                        safariOnboarding | safariEnabled | none
//    -DebugLaunch.bannerItem <number of the item, from 0>
//
//  The dialog is shown instead of the onboarding, which Debug builds
//  otherwise show on every launch.
//

import Foundation

enum DebugLaunch {
  /// Subpages of the sections
  enum Page: String {
    case safariInstructions
    case donation
  }

  /// Section the app opens on
  static let section = value("section").flatMap(MainSection.init(rawValue:))

  /// Whether the dialog shown at the start is chosen, instead of the
  /// onboarding
  static let choosesDialog = value("dialog") != nil
  /// Dialog shown at the start, which none is for "none"
  static let dialog = value("dialog").flatMap(MainDialog.init(rawValue:))

  /// Item shown by the banner, which stays
  static let bannerItem = value("bannerItem").flatMap { Int($0) }

  /// Whether its section opens on the page
  static func opens(_ page: Page) -> Bool {
    value("page") == page.rawValue
  }

  private static func value(_ name: String) -> String? {
    #if DEBUG
    UserDefaults.standard.string(forKey: "DebugLaunch.\(name)")
    #else
    nil
    #endif
  }
}
