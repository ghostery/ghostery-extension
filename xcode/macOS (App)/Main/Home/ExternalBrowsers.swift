//
//  ExternalBrowsers.swift
//  Ghostery
//
//  Browsers other than Safari found in the system, and the state of
//  Ghostery in them, as installed by the user from the extension stores.
//

import AppKit
import Observation
import OSLog

fileprivate enum Constants {
  // Redirects to the extension store of the browser which opens it
  static let extensionStoreURL = URL(string: "https://www.ghostery.com/downloads/extension")!.tagged(campaign: "home")

  // The longest wait for the browser to come to the front, as it can take
  // a few seconds to launch
  static let launchTimeout: Duration = .seconds(10)

  // Privacy & Security, Files and Folders, where the user allows the app
  // to access the data of the browsers
  static let filesAndFoldersSettingsURL = URL(string: "x-apple.systempreferences:com.apple.preference.security?Privacy_FilesAndFolders")!
}

fileprivate let logger = Logger(category: "ExternalBrowsers")

/// The extension stores from which the browsers install Ghostery, which has
/// a different ID in each
fileprivate enum ExtensionStore {
  case chromeWebStore
  case edgeAddons
  case operaAddons
  case firefoxAddons

  var extensionID: String {
    switch self {
    case .chromeWebStore: return "mlomiejdfkolichcflejclcbmpeaniij"
    case .edgeAddons: return "fclbdkbhjlgkbpfldjodgjncejkkjcme"
    case .operaAddons: return "bbkekonodcdmedgffkkbgmnnekbainbg"
    case .firefoxAddons: return "firefox@ghostery.com"
    }
  }

  /// The page of Ghostery, which has the button removing it when it's
  /// installed in the browser opening the page. Opera Add-ons only shows
  /// that it is, and the user removes it in the extensions page of Opera.
  var removalPageURL: URL {
    switch self {
    case .chromeWebStore: return URL(string: "https://chromewebstore.google.com/detail/\(extensionID)")!
    case .edgeAddons: return URL(string: "https://microsoftedge.microsoft.com/addons/detail/\(extensionID)")!
    case .operaAddons: return URL(string: "https://addons.opera.com/extensions/details/ghostery/")!
    case .firefoxAddons: return URL(string: "https://addons.mozilla.org/firefox/addon/ghostery/")!
    }
  }
}

enum ExternalBrowser: String, CaseIterable, Codable, Identifiable {
  // By popularity, as the app lists them
  case chrome
  case edge
  case firefox
  case opera
  case brave

  var id: Self { self }

  var name: String {
    switch self {
    case .chrome: return "Chrome"
    case .edge: return "Edge"
    case .firefox: return "Firefox"
    case .opera: return "Opera"
    case .brave: return "Brave"
    }
  }

  var bundleIdentifier: String {
    switch self {
    case .chrome: return "com.google.Chrome"
    case .edge: return "com.microsoft.edgemac"
    case .firefox: return "org.mozilla.firefox"
    case .opera: return "com.operasoftware.Opera"
    case .brave: return "com.brave.Browser"
    }
  }

  /// The extension stores the browser installs Ghostery from, as Edge and
  /// Opera can install extensions from the Chrome Web Store too
  fileprivate var extensionStores: [ExtensionStore] {
    switch self {
    case .chrome, .brave: return [.chromeWebStore]
    case .edge: return [.edgeAddons, .chromeWebStore]
    case .firefox: return [.firefoxAddons]
    case .opera: return [.operaAddons, .chromeWebStore]
    }
  }

  /// The folder of the profiles, relative to the home folder. The app can
  /// only read the ones listed in its entitlements, so update both together.
  fileprivate var profilesPath: String {
    switch self {
    case .chrome: return "Library/Application Support/Google/Chrome"
    case .edge: return "Library/Application Support/Microsoft Edge"
    case .firefox: return "Library/Application Support/Firefox"
    case .opera: return "Library/Application Support/com.operasoftware.Opera"
    case .brave: return "Library/Application Support/BraveSoftware/Brave-Browser"
    }
  }

  fileprivate var appURL: URL? {
    NSWorkspace.shared.urlForApplication(withBundleIdentifier: bundleIdentifier)
  }

  /// The name of the app as the system shows it, like "Google Chrome"
  var appName: String? {
    guard let appURL, let name = try? appURL.resourceValues(forKeys: [.localizedNameKey]).localizedName else { return nil }
    // With the extension, when Finder shows all of them
    return name.hasSuffix(".app") ? String(name.dropLast(4)) : name
  }

  /// Opens the page of Ghostery in the extension store of the browser, and
  /// returns once the browser is in front of the app
  @MainActor
  func openExtensionStore() async {
    guard let appURL else { return }

    // The browser comes to the front by taking it from the app, which can
    // happen before the system reports back
    let deactivations = NotificationCenter.default.notifications(named: NSApplication.didResignActiveNotification)
    do {
      _ = try await NSWorkspace.shared.open(
        [Constants.extensionStoreURL],
        withApplicationAt: appURL,
        configuration: NSWorkspace.OpenConfiguration()
      )
    } catch {
      logger.error("Opening the extension store in \(self.rawValue, privacy: .public) failed: \(String(describing: error), privacy: .public)")
      return
    }
    guard NSApp.isActive else { return }

    // For a browser which isn't running, the system reports back right after
    // it starts, while it comes to the front when it finishes launching
    let inFront = Task {
      for await _ in deactivations { return }
    }
    let timeout = Task {
      try? await Task.sleep(for: Constants.launchTimeout)
      inFront.cancel()
    }
    await inFront.value
    timeout.cancel()
  }

  /// Opens the page of Ghostery in the extension store it was installed
  /// from, which has the button removing it, apart from Opera Add-ons. The
  /// pages of the browser where the user manages its extensions can't be
  /// opened, as the system doesn't pass their URLs from the sandbox of the app.
  @MainActor
  func openRemovalPage() async {
    guard let appURL,
      let url = await ExternalBrowserDetector.shared.enabledExtensionStore(in: self)?.removalPageURL
    else { return }

    do {
      _ = try await NSWorkspace.shared.open([url], withApplicationAt: appURL, configuration: NSWorkspace.OpenConfiguration())
    } catch {
      logger.error("Opening the removal page in \(self.rawValue, privacy: .public) failed: \(String(describing: error), privacy: .public)")
    }
  }

  /// Opens the settings where the user allows the app to read the profiles
  static func showAccessSettings() {
    NSWorkspace.shared.open(Constants.filesAndFoldersSettingsURL)
  }
}

/// State of Ghostery in a browser
fileprivate enum GhosteryState: String, Codable {
  /// Enabled in any of the profiles
  case enabled
  case notEnabled
  /// The system doesn't let the app read the profiles
  case noAccess
}

/// The browsers found in the system, with the state of Ghostery in them.
/// The last known states are kept between launches, so views don't change
/// right after one.
@MainActor
@Observable
final class ExternalBrowserStates {
  static let shared = ExternalBrowserStates()

  private static let statesKey = "ExternalBrowserStates.states"

  private var states: [ExternalBrowser: GhosteryState]

  // The browsers don't notify other apps about changes of their profiles
  @ObservationIgnored private let periodicRefresh = PeriodicRefresh(every: .seconds(2)) {
    await ExternalBrowserStates.shared.refresh()
  }

  private init() {
    let data = UserDefaults.standard.data(forKey: Self.statesKey)
    states = data.flatMap { try? JSONDecoder().decode([ExternalBrowser: GhosteryState].self, from: $0) } ?? [:]
  }

  var browsers: [ExternalBrowser] {
    ExternalBrowser.allCases.filter { states[$0] != nil }
  }

  var browsersWithoutAccess: [ExternalBrowser] {
    browsers.filter { states[$0] == .noAccess }
  }

  func isGhosteryEnabled(in browser: ExternalBrowser) -> Bool {
    states[browser] == .enabled
  }

  /// Keeps the states up to date until the calling task is cancelled, like
  /// the task of a view, as the user can change them at any time
  func monitor() async {
    await periodicRefresh.run()
  }

  private func refresh() async {
    let detected = await ExternalBrowserDetector.shared.states()
    guard detected != states else { return }

    states = detected
    UserDefaults.standard.set(try? JSONEncoder().encode(detected), forKey: Self.statesKey)
  }
}

/// Reads the state of Ghostery from the files of the browser profiles,
/// parsing again only the ones changed since the last time
actor ExternalBrowserDetector {
  static let shared = ExternalBrowserDetector()

  private struct CachedFile {
    let modificationDate: Date
    let value: Any?
  }

  private var cachedFiles: [URL: CachedFile] = [:]

  // The home folder of the app is in its container
  private let homeURL: URL = {
    guard let directory = getpwuid(getuid())?.pointee.pw_dir else {
      return FileManager.default.homeDirectoryForCurrentUser
    }
    return URL(fileURLWithPath: String(cString: directory), isDirectory: true)
  }()

  /// States of Ghostery in the browsers found in the system
  fileprivate func states() -> [ExternalBrowser: GhosteryState] {
    var states: [ExternalBrowser: GhosteryState] = [:]
    for browser in ExternalBrowser.allCases {
      guard let appURL = browser.appURL else { continue }

      let profilesURL = profilesURL(of: browser)
      if !canReadProfiles(of: browser, in: profilesURL) {
        states[browser] = .noAccess
      } else if enabledExtensionStore(in: browser, profilesURL: profilesURL, appURL: appURL) != nil {
        states[browser] = .enabled
      } else {
        states[browser] = .notEnabled
      }
    }
    return states
  }

  /// The extension store from which Ghostery enabled in the browser was
  /// installed, or nil when it isn't enabled
  fileprivate func enabledExtensionStore(in browser: ExternalBrowser) -> ExtensionStore? {
    guard let appURL = browser.appURL else { return nil }
    return enabledExtensionStore(in: browser, profilesURL: profilesURL(of: browser), appURL: appURL)
  }

  private func profilesURL(of browser: ExternalBrowser) -> URL {
    homeURL.appending(path: browser.profilesPath, directoryHint: .isDirectory)
  }

  // Since macOS 27, the system protects the profiles of the browsers, and
  // doesn't ask the user, who has to allow the access in the settings
  private func canReadProfiles(of browser: ExternalBrowser, in profilesURL: URL) -> Bool {
    let file = profilesURL.appending(path: browser == .firefox ? "profiles.ini" : "Local State")
    do {
      try FileHandle(forReadingFrom: file).close()
      return true
    } catch {
      // Other errors are like when the browser wasn't opened yet, so it has
      // no profiles, while the system denies the access with this one
      let code = ((error as? CocoaError)?.underlying as? POSIXError)?.code
      return code != .EPERM
    }
  }

  // Of the first profile in which it's enabled
  private func enabledExtensionStore(in browser: ExternalBrowser, profilesURL: URL, appURL: URL) -> ExtensionStore? {
    switch browser {
    case .firefox:
      for profile in firefoxProfiles(in: profilesURL) where isFirefoxProfile(profile, lastOpenedBy: appURL) {
        let store = browser.extensionStores.first { store in
          readJSON(profile.appending(path: "extensions.json")) { BrowserProfiles.isFirefoxExtensionEnabled($0, id: store.extensionID) } == true
        }
        if let store { return store }
      }
      return nil
    case .chrome, .edge, .opera, .brave:
      for profile in chromiumProfiles(in: profilesURL) {
        let store = browser.extensionStores.first { store in
          isExtensionEnabled(inChromiumProfile: profile, id: store.extensionID)
        }
        if let store { return store }
      }
      return nil
    }
  }

  // The profiles of profiles.ini, and the ones in the folder of profiles,
  // as the profile manager of Firefox doesn't list all of them there
  private func firefoxProfiles(in profilesURL: URL) -> [URL] {
    let sections = readINI(profilesURL.appending(path: "profiles.ini")) ?? []
    var profiles = BrowserProfiles.firefoxProfiles(listedIn: sections, profilesURL: profilesURL)

    let folder = profilesURL.appending(path: "Profiles", directoryHint: .isDirectory)
    if let urls = try? FileManager.default.contentsOfDirectory(at: folder, includingPropertiesForKeys: nil) {
      profiles.append(contentsOf: urls)
    }

    // The same folder can be listed with and without the trailing slash
    let paths = Set(profiles.map(\.standardizedFileURL.path))
    return paths.map { URL(fileURLWithPath: $0, isDirectory: true) }
  }

  private func isFirefoxProfile(_ profile: URL, lastOpenedBy appURL: URL) -> Bool {
    let sections = readINI(profile.appending(path: "compatibility.ini")) ?? []
    return BrowserProfiles.isFirefoxProfile(compatibility: sections, lastOpenedBy: appURL)
  }

  private func readINI(_ url: URL) -> [[String: String]]? {
    readFile(url) { data in
      String(data: data, encoding: .utf8).map(BrowserProfiles.parseINI)
    }
  }

  private func chromiumProfiles(in profilesURL: URL) -> [URL] {
    let names = readJSON(profilesURL.appending(path: "Local State")) { BrowserProfiles.chromiumProfileNames(localState: $0) }
    return (names ?? ["Default"]).map { profilesURL.appending(path: $0, directoryHint: .isDirectory) }
  }

  private func isExtensionEnabled(inChromiumProfile profile: URL, id: String) -> Bool {
    // The preferences can keep the settings of an extension after it's
    // removed, like Edge does, while its folder is deleted right away
    let folder = profile.appending(path: "Extensions", directoryHint: .isDirectory).appending(path: id, directoryHint: .isDirectory)
    guard FileManager.default.fileExists(atPath: folder.path) else { return false }

    // The settings of extensions are in the secure file, and older
    // versions of the browsers kept them in the other one
    for name in ["Secure Preferences", "Preferences"] {
      if let isEnabled = readJSON(profile.appending(path: name), parse: { BrowserProfiles.isChromiumExtensionEnabled($0, id: id) }) {
        return isEnabled
      }
    }
    return false
  }

  /// The value parsed from the file, or the cached one when the file
  /// didn't change, nil when it can't be read or parsed
  private func readFile<Value>(_ url: URL, parse: (Data) -> Value?) -> Value? {
    guard let modificationDate = try? url.resourceValues(forKeys: [.contentModificationDateKey]).contentModificationDate else {
      cachedFiles[url] = nil
      return nil
    }
    if let cached = cachedFiles[url], cached.modificationDate == modificationDate {
      return cached.value as? Value
    }

    let value: Value?
    do {
      value = parse(try Data(contentsOf: url))
    } catch {
      logger.error("Reading \(url.lastPathComponent, privacy: .public) failed: \(error, privacy: .public)")
      value = nil
    }
    cachedFiles[url] = CachedFile(modificationDate: modificationDate, value: value)
    return value
  }

  private func readJSON<Value>(_ url: URL, parse: ([String: Any]) -> Value?) -> Value? {
    readFile(url) { data in
      (try? JSONSerialization.jsonObject(with: data) as? [String: Any]).flatMap(parse)
    }
  }
}
