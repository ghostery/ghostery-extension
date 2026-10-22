//
//  GhosteryApp.swift
//  Ghostery
//
//  Entry point of the iOS app, for iPhones and iPads.
//

import SwiftUI

@main
struct GhosteryApp: App {
  // Created at the launch, to handle the transactions of the App Store
  @State private var donations = Donations()

  var body: some Scene {
    WindowGroup {
      MainView()
        .environment(donations)
    }
  }
}
