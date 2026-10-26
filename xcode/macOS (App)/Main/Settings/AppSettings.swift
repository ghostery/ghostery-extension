//
//  AppSettings.swift
//  Ghostery
//
//  Settings of the app, and the menu bar icon shown by one of them.
//

import AppKit
import Observation
import OSLog
import ServiceManagement

fileprivate enum Keys {
  static let showsMenuBarIcon = "AppSettings.showsMenuBarIcon"
}

fileprivate let logger = Logger(category: "AppSettings")

@MainActor
@Observable
final class AppSettings {
  static let shared = AppSettings()

  /// Whether the app is a login item. The user can change it also in
  /// System Settings, so it's refreshed when the app becomes active.
  private(set) var launchesAtLogin = false

  /// Whether the app has its icon in the menu bar, and keeps running in the
  /// background without a Dock icon when its window is closed
  var showsMenuBarIcon: Bool {
    didSet {
      UserDefaults.standard.set(showsMenuBarIcon, forKey: Keys.showsMenuBarIcon)
      MenuBarIcon.shared.isShown = showsMenuBarIcon
    }
  }

  /// Whether the banner invites to launch the app at login, as the App Store
  /// doesn't allow turning it on without the user's consent. Decided when
  /// the app starts, and removed once the user turns the setting on.
  private(set) var invitesToLaunchAtLogin = false

  private init() {
    showsMenuBarIcon = UserDefaults.standard.object(forKey: Keys.showsMenuBarIcon) as? Bool ?? true
    refreshLaunchAtLogin()
    invitesToLaunchAtLogin = !launchesAtLogin
  }

  func setLaunchesAtLogin(_ isOn: Bool) {
    do {
      if isOn {
        try SMAppService.mainApp.register()
      } else {
        try SMAppService.mainApp.unregister()
      }
    } catch {
      logger.error("Changing the login item failed: \(String(describing: error), privacy: .public)")
    }
    refreshLaunchAtLogin()
    if launchesAtLogin {
      invitesToLaunchAtLogin = false
    }
    // Turned off by the user in System Settings, where it has to be turned on
    if isOn && SMAppService.mainApp.status == .requiresApproval {
      SMAppService.openSystemSettingsLoginItems()
    }
  }

  func refreshLaunchAtLogin() {
    let launchesAtLogin = SMAppService.mainApp.status == .enabled
    if self.launchesAtLogin != launchesAtLogin {
      self.launchesAtLogin = launchesAtLogin
    }
  }
}

/// Icon of the app in the menu bar, which shows the main window when clicked
@MainActor
final class MenuBarIcon: NSObject {
  static let shared = MenuBarIcon()

  private var item: NSStatusItem?

  var isShown: Bool {
    get { item != nil }
    set {
      if newValue, item == nil {
        let item = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
        if let button = item.button {
          button.image = NSImage(resource: .menuBarIcon)
          button.target = self
          button.action = #selector(showWindow)
          button.toolTip = "Ghostery"
          button.setAccessibilityLabel("Ghostery")
        }
        self.item = item
      } else if !newValue, let item {
        NSStatusBar.system.removeStatusItem(item)
        self.item = nil
      }
    }
  }

  @objc private func showWindow() {
    MainWindowController.shared.show()
  }
}
