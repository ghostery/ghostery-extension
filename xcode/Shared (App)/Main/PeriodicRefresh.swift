//
//  PeriodicRefresh.swift
//  Ghostery
//
//  Refreshes of what the app shows from sources that don't notify it about
//  their changes.
//

import Foundation
#if os(iOS)
import UIKit
#endif

/// Refreshes what the app shows from sources that don't notify the app about
/// changes. It runs while any view needs it, and refreshes only while the app
/// is seen: on the Mac while its window is visible, and on iPhones and iPads
/// while it's in the foreground.
@MainActor
final class PeriodicRefresh {
  private let interval: Duration
  private let refresh: @MainActor () async -> Void
  private var runs = 0
  private var loop: Task<Void, Never>?

  init(every interval: Duration, refresh: @escaping @MainActor () async -> Void) {
    self.interval = interval
    self.refresh = refresh
  }

  /// Keeps refreshing until the calling task is cancelled, like the task
  /// of a view when it disappears
  func run() async {
    runs += 1
    defer { runs -= 1 }

    // One loop serves all the views
    if loop == nil {
      loop = Task {
        while runs > 0 {
          if Self.isAppVisible {
            await refresh()
          }
          try? await Task.sleep(for: interval)
        }
        loop = nil
      }
    }

    while !Task.isCancelled {
      try? await Task.sleep(for: .seconds(60 * 60))
    }
  }

  private static var isAppVisible: Bool {
    #if os(macOS)
    MainWindowController.shared.isWindowVisible
    #else
    UIApplication.shared.applicationState != .background
    #endif
  }
}
