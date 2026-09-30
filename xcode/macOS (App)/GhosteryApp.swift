//
//  AppDelegate.swift
//  macOS (App)
//
//  Created by Krzysztof Jan Modras on 27.09.21.
//

import Cocoa
import SwiftUI

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
    @MainActor @objc private func handleURLEvent(_ event: NSAppleEventDescriptor, withReply reply: NSAppleEventDescriptor) {
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
        func removeOtherMenus() {
            guard let menu = NSApp.mainMenu, menu.items.count > 1 else { return }
            for item in menu.items.dropFirst() {
                menu.removeItem(item)
            }
        }
        removeOtherMenus()
        // Changed after SwiftUI finishes adding the menus
        NotificationCenter.default.addObserver(forName: NSMenu.didAddItemNotification, object: nil, queue: .main) { notification in
            guard let menu = notification.object as? NSMenu else { return }
            MainActor.assumeIsolated {
                guard menu === NSApp.mainMenu else { return }
                DispatchQueue.main.async { removeOtherMenus() }
            }
        }
        mainMenuObservation = NSApp.observe(\.mainMenu) { _, _ in
            DispatchQueue.main.async { removeOtherMenus() }
        }

        // Shortcuts of the removed menus, for closing and minimizing the window
        NSEvent.addLocalMonitorForEvents(matching: .keyDown) { event in
            guard event.modifierFlags.intersection(.deviceIndependentFlagsMask) == .command,
                  let window = NSApp.keyWindow
            else { return event }
            switch event.charactersIgnoringModifiers {
            case "w": window.performClose(nil)
            case "m": window.miniaturize(nil)
            default: return event
            }
            return nil
        }
    }
}

@main
struct GhosteryApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self)
    var appDelegate
    // Created at the launch, to handle the transactions of the App Store
    @State private var donations = Donations()
  
    var body: some Scene {
        WindowGroup {
          MainView()
            .environment(donations)
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
