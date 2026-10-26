//
//  GhosteryApp.swift
//  Ghostery
//
//  Entry point of the macOS app, with its delegate handling the launch, the
//  links to the app and the menus.
//

import Cocoa
import SwiftUI

@MainActor
class AppDelegate: NSObject, NSApplicationDelegate {
  func applicationWillFinishLaunching(_ notification: Notification) {
    // Handled here rather than by SwiftUI, which opens a new window for
    // a link while the main window is hidden, and none for the link
    // launching the app
    NSAppleEventManager.shared().setEventHandler(
      self,
      andSelector: #selector(handleURLEvent(_:withReply:)),
      forEventClass: AEEventClass(kInternetEventClass),
      andEventID: AEEventID(kAEGetURL)
    )
    // The app keeps running while the main window is hidden, when it
    // shouldn't refresh what the window shows
    PeriodicRefresh.isAppVisible = { MainWindowController.shared.isWindowVisible }
  }

  func applicationDidFinishLaunching(_ aNotification: Notification) {
    NSWindow.allowsAutomaticWindowTabbing = false
    keepOnlyAppMenu()

    // Launched at login, the app starts in the background when it has
    // its icon in the menu bar
    let launchedAtLogin = (aNotification.userInfo?[NSApplication.launchIsDefaultUserInfoKey] as? Bool) == false
      && NSAppleEventManager.shared().currentAppleEvent?.paramDescriptor(forKeyword: keyAEPropData)?.enumCodeValue == keyAELaunchedAsLogInItem
    if launchedAtLogin && AppSettings.shared.showsMenuBarIcon {
      NSApp.setActivationPolicy(.accessory)
      MainWindowController.shared.hideAtStart()
    }
    MenuBarIcon.shared.isShown = AppSettings.shared.showsMenuBarIcon
  }

  func applicationDidBecomeActive(_ notification: Notification) {
    AppSettings.shared.refreshLaunchAtLogin()
  }

  // Links to the app, like the one of the settings page of the extension
  // in Safari, show a section in the main window
  @objc private func handleURLEvent(_ event: NSAppleEventDescriptor, withReply reply: NSAppleEventDescriptor) {
    if let link = event.paramDescriptor(forKeyword: keyDirectObject)?.stringValue,
       let url = URL(string: link),
       let section = MainSection(url: url) {
      AppLinks.shared.section = section
    }
    MainWindowController.shared.show()
  }

  // Opening the app again, like from the Finder, shows its hidden window
  func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool {
    MainWindowController.shared.show()
    return false
  }

  func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
    return !AppSettings.shared.showsMenuBarIcon
  }

  // The menu bar shows only the menu of the app, without the File, Edit,
  // View, Window and Help menus that SwiftUI adds, and adds again while
  // the app runs
  private var mainMenuObservation: NSKeyValueObservation?

  private func keepOnlyAppMenu() {
    removeOtherMenus()
    // The menus are changed on the main thread, and removed after SwiftUI
    // finishes adding them
    NotificationCenter.default.addObserver(forName: NSMenu.didAddItemNotification, object: nil, queue: .main) { [weak self] notification in
      let menu = (notification.object as? NSMenu).map(ObjectIdentifier.init)
      MainActor.assumeIsolated {
        guard menu != nil, menu == NSApp.mainMenu.map(ObjectIdentifier.init) else { return }
        self?.removeOtherMenusLater()
      }
    }
    mainMenuObservation = NSApp.observe(\.mainMenu) { [weak self] _, _ in
      MainActor.assumeIsolated {
        self?.removeOtherMenusLater()
      }
    }

    // Shortcuts of the removed menus, for closing and minimizing the window
    NSEvent.addLocalMonitorForEvents(matching: .keyDown) { event in
      guard event.modifierFlags.intersection(.deviceIndependentFlagsMask) == .command else { return event }
      let key = event.charactersIgnoringModifiers
      // Events are handled on the main thread
      let isHandled = MainActor.assumeIsolated {
        guard let window = NSApp.keyWindow else { return false }
        switch key {
        case "w": window.performClose(nil)
        case "m": window.miniaturize(nil)
        default: return false
        }
        return true
      }
      return isHandled ? nil : event
    }
  }

  private func removeOtherMenus() {
    guard let menu = NSApp.mainMenu, menu.items.count > 1 else { return }
    for item in menu.items.dropFirst() {
      menu.removeItem(item)
    }
  }

  private func removeOtherMenusLater() {
    DispatchQueue.main.async {
      MainActor.assumeIsolated { self.removeOtherMenus() }
    }
  }
}

@main
struct GhosteryApp: App {
  @NSApplicationDelegateAdaptor(AppDelegate.self)
  var appDelegate

  init() {
    // Handles the transactions of the App Store from the launch
    Donations.shared.start()
  }

  var body: some Scene {
    WindowGroup {
      MainView()
    }
    .windowStyle(.hiddenTitleBar)
    .windowResizability(.contentSize)
    // There's one main window. The menus that would open another one
    // are removed too, but SwiftUI adds them again for a moment.
    .commands {
      CommandGroup(replacing: .newItem) {}
    }
  }
}
