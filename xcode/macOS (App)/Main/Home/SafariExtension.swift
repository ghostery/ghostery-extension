//
//  SafariExtension.swift
//  Ghostery
//
//  State of the Safari extension, as set in the settings of Safari.
//

import Observation
import SafariServices

@MainActor
@Observable
final class SafariExtension {
  static let shared = SafariExtension()

  private static let identifier = Bundle.main.bundleIdentifier! + ".safari"
  private static let isEnabledKey = "SafariExtension.isEnabled"

  /// Whether the extension is turned on in the settings of Safari. The last
  /// known state is kept between launches, so views don't change right
  /// after one.
  private(set) var isEnabled = UserDefaults.standard.bool(forKey: isEnabledKey)

  // Safari doesn't notify apps about changes of its settings
  @ObservationIgnored private let periodicRefresh = PeriodicRefresh(every: .seconds(1)) {
    await SafariExtension.shared.refresh()
  }

  // SafariServices crashes the app when two requests start at the same
  // time, so a request made while another one runs gets its result
  @ObservationIgnored private var pendingRequest: Task<Bool?, Never>?

  private init() {}

  /// Keeps the state up to date until the calling task is cancelled, like
  /// the task of a view, as the user can change it in Safari at any time
  func monitor() async {
    await periodicRefresh.run()
  }

  /// Asks Safari for the state, which is nil when Safari can't tell
  @discardableResult
  func refresh() async -> Bool? {
    if let pendingRequest {
      return await pendingRequest.value
    }

    let request = Task { await Self.requestState() }
    pendingRequest = request
    let state = await request.value
    pendingRequest = nil

    if let state, state != isEnabled {
      isEnabled = state
      UserDefaults.standard.set(state, forKey: Self.isEnabledKey)
    }
    return state
  }

  private static func requestState() async -> Bool? {
    await withCheckedContinuation { continuation in
      SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: identifier) { state, error in
        continuation.resume(returning: error == nil ? state?.isEnabled : nil)
      }
    }
  }

  /// Opens the settings of Safari, with the extension selected
  static func showSettings() {
    SFSafariApplication.showPreferencesForExtension(withIdentifier: identifier)
  }
}
