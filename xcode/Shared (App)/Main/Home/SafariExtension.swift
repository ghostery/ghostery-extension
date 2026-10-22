//
//  SafariExtension.swift
//  Ghostery
//
//  State of the Safari extension, as set in the settings of Safari.
//

import Observation
import SafariServices
#if os(iOS)
import OSLog
import UIKit

fileprivate let logger = Logger(subsystem: Bundle.main.bundleIdentifier ?? "Ghostery", category: "SafariExtension")
#endif

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

  #if os(iOS)
  /// Whether Safari tells the app the state, which it does since iOS 26.2.
  /// Before, the extension stays disabled for the app.
  static var isStateAvailable: Bool {
    if #available(iOS 26.2, *) { return true }
    return false
  }

  /// Whether the app can open the settings of the extension, which it can
  /// since iOS 26.2. Before, it opens its own settings instead.
  static var canShowSettings: Bool {
    if #available(iOS 26.2, *) { return true }
    return false
  }
  #endif

  // Safari doesn't notify apps about changes of its settings
  @ObservationIgnored private let periodicRefresh = PeriodicRefresh(every: .seconds(1)) {
    await SafariExtension.shared.refresh()
  }

  // SafariServices crashes the app when two requests start at the same
  // time, so a request made while another one runs gets its result
  @ObservationIgnored private var pendingRequest: Task<Bool?, Never>?
  #if os(iOS)
  @ObservationIgnored private var isOpeningSettings = false
  #endif

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
    #if os(macOS)
    await withCheckedContinuation { continuation in
      SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: identifier) { state, error in
        continuation.resume(returning: error == nil ? state?.isEnabled : nil)
      }
    }
    #else
    // Safari tells apps since iOS 26.2
    guard #available(iOS 26.2, *) else { return nil }
    return await withCheckedContinuation { continuation in
      SFSafariExtensionManager.getStateOfExtension(withIdentifier: identifier) { state, error in
        continuation.resume(returning: error == nil ? state?.isEnabled : nil)
      }
    }
    #endif
  }

  /// Opens the settings of Safari, with the extension selected
  static func showSettings() {
    #if os(macOS)
    SFSafariApplication.showPreferencesForExtension(withIdentifier: identifier)
    #else
    // Before iOS 26.2 apps can't open them, so it opens the settings of the app
    guard #available(iOS 26.2, *) else {
      showAppSettings()
      return
    }
    Task { await shared.openSettings() }
    #endif
  }

  #if os(iOS)
  // Safari opens them for an app at most twice a minute, and fails other
  // requests. The settings of the app aren't opened then, as they don't
  // have the ones of the extension.
  @available(iOS 26.2, *)
  private func openSettings() async {
    // A second tap while they open doesn't use up a request
    guard !isOpeningSettings else { return }
    isOpeningSettings = true
    defer { isOpeningSettings = false }

    do {
      try await SFSafariSettings.openExtensionsSettings(forIdentifiers: [Self.identifier])
    } catch {
      logger.error("Opening the settings of the extension failed: \(String(describing: error), privacy: .public)")
    }
  }

  private static func showAppSettings() {
    guard let url = URL(string: UIApplication.openSettingsURLString) else { return }
    UIApplication.shared.open(url)
  }
  #endif
}
