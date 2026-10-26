//
//  GhosteryApp.swift
//  Ghostery
//
//  Entry point of the iOS app, for iPhones and iPads.
//

import SwiftUI

@main
struct GhosteryApp: App {
  init() {
    // Handles the transactions of the App Store from the launch
    Donations.shared.start()
  }

  var body: some Scene {
    WindowGroup {
      MainView()
    }
  }
}
