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

  // Privacy & Security, Files and Folders, where the user allows the app
  // to access the data of the browsers
  static let filesAndFoldersSettingsURL = URL(string: "x-apple.systempreferences:com.apple.preference.security?Privacy_FilesAndFolders")!
}

fileprivate let logger = Logger(subsystem: Bundle.main.bundleIdentifier ?? "Ghostery", category: "ExternalBrowsers")

enum ExternalBrowser: String, CaseIterable, Codable, Identifiable {
  case firefox
  case chrome
  case edge

  var id: Self { self }

  var name: String {
    switch self {
    case .firefox: return "Firefox"
    case .chrome: return "Chrome"
    case .edge: return "Edge"
    }
  }

  var bundleIdentifier: String {
    switch self {
    case .firefox: return "org.mozilla.firefox"
    case .chrome: return "com.google.Chrome"
    case .edge: return "com.microsoft.edgemac"
    }
  }

  /// The IDs of Ghostery in the extension stores the browser installs from,
  /// as Edge can install extensions from the Chrome Web Store too
  fileprivate var extensionIDs: [String] {
    switch self {
    case .firefox: return ["firefox@ghostery.com"]
    case .chrome: return ["mlomiejdfkolichcflejclcbmpeaniij"]
    case .edge: return ["fclbdkbhjlgkbpfldjodgjncejkkjcme", "mlomiejdfkolichcflejclcbmpeaniij"]
    }
  }

  /// The folder of the profiles, relative to the home folder. The app can
  /// only read the ones listed in its entitlements, so update both together.
  fileprivate var profilesPath: String {
    switch self {
    case .firefox: return "Library/Application Support/Firefox"
    case .chrome: return "Library/Application Support/Google/Chrome"
    case .edge: return "Library/Application Support/Microsoft Edge"
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

  /// Opens the page of Ghostery in the extension store of the browser
  func openExtensionStore() {
    guard let appURL else { return }

    NSWorkspace.shared.open(
      [Constants.extensionStoreURL],
      withApplicationAt: appURL,
      configuration: NSWorkspace.OpenConfiguration()
    ) { _, error in
      if let error {
        logger.error("Opening the extension store in \(self.rawValue, privacy: .public) failed: \(String(describing: error), privacy: .public)")
      }
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

      let profilesURL = homeURL.appending(path: browser.profilesPath, directoryHint: .isDirectory)
      if !canReadProfiles(of: browser, in: profilesURL) {
        states[browser] = .noAccess
      } else if isGhosteryEnabled(in: browser, profilesURL: profilesURL, appURL: appURL) {
        states[browser] = .enabled
      } else {
        states[browser] = .notEnabled
      }
    }
    return states
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

  private func isGhosteryEnabled(in browser: ExternalBrowser, profilesURL: URL, appURL: URL) -> Bool {
    switch browser {
    case .firefox:
      return firefoxProfiles(in: profilesURL).contains { profile in
        guard isFirefoxProfile(profile, lastOpenedBy: appURL) else { return false }
        return browser.extensionIDs.contains { id in
          readJSON(profile.appending(path: "extensions.json")) { isFirefoxExtensionEnabled($0, id: id) } == true
        }
      }
    case .chrome, .edge:
      return chromiumProfiles(in: profilesURL).contains { profile in
        browser.extensionIDs.contains { id in
          isExtensionEnabled(inChromiumProfile: profile, id: id)
        }
      }
    }
  }

  // The profiles of profiles.ini, and the ones in the folder of profiles,
  // as the profile manager of Firefox doesn't list all of them there
  private func firefoxProfiles(in profilesURL: URL) -> [URL] {
    var profiles: [URL] = []

    let sections = readINI(profilesURL.appending(path: "profiles.ini")) ?? []
    for section in sections {
      guard let path = section["Path"] else { continue }
      profiles.append(section["IsRelative"] == "1" ? profilesURL.appending(path: path) : URL(fileURLWithPath: path))
    }

    let folder = profilesURL.appending(path: "Profiles", directoryHint: .isDirectory)
    if let urls = try? FileManager.default.contentsOfDirectory(at: folder, includingPropertiesForKeys: nil) {
      profiles.append(contentsOf: urls)
    }

    // The same folder can be listed with and without the trailing slash
    let paths = Set(profiles.map(\.standardizedFileURL.path))
    return paths.map { URL(fileURLWithPath: $0, isDirectory: true) }
  }

  // Firefox Nightly and Developer Edition share the profiles with Firefox,
  // and each profile keeps the location of the app which opened it last
  private func isFirefoxProfile(_ profile: URL, lastOpenedBy appURL: URL) -> Bool {
    let sections = readINI(profile.appending(path: "compatibility.ini")) ?? []
    guard let platformPath = sections.lazy.compactMap({ $0["LastPlatformDir"] }).first else { return false }
    return platformPath.hasPrefix(appURL.standardizedFileURL.path + "/")
  }

  /// The sections of the INI file, with their keys and values
  private func readINI(_ url: URL) -> [[String: String]]? {
    readFile(url) { data in
      guard let text = String(data: data, encoding: .utf8) else { return nil }

      var sections: [[String: String]] = []
      for line in text.components(separatedBy: .newlines) {
        let line = line.trimmingCharacters(in: .whitespaces)
        if line.hasPrefix("[") {
          sections.append([:])
        } else if let separator = line.firstIndex(of: "="), !sections.isEmpty {
          sections[sections.count - 1][String(line[..<separator])] = String(line[line.index(after: separator)...])
        }
      }
      return sections
    }
  }

  private func chromiumProfiles(in profilesURL: URL) -> [URL] {
    let names = readJSON(profilesURL.appending(path: "Local State")) { json in
      ((json["profile"] as? [String: Any])?["info_cache"] as? [String: Any]).map { Array($0.keys) }
    }
    return (names ?? ["Default"]).map { profilesURL.appending(path: $0, directoryHint: .isDirectory) }
  }

  private func isExtensionEnabled(inChromiumProfile profile: URL, id: String) -> Bool {
    // The settings of extensions are in the secure file, and older
    // versions of the browsers kept them in the other one
    for name in ["Secure Preferences", "Preferences"] {
      if let isEnabled = readJSON(profile.appending(path: name), parse: { isChromiumExtensionEnabled($0, id: id) }) {
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

/// Whether the extension is enabled, or nil when it isn't installed
fileprivate func isFirefoxExtensionEnabled(_ json: [String: Any], id: String) -> Bool? {
  guard let addons = json["addons"] as? [[String: Any]],
        let addon = addons.first(where: { $0["id"] as? String == id }) else { return nil }

  return addon["active"] as? Bool == true
    && addon["userDisabled"] as? Bool != true
    && addon["appDisabled"] as? Bool != true
    && addon["embedderDisabled"] as? Bool != true
}

/// Whether the extension is enabled, or nil when it isn't installed
fileprivate func isChromiumExtensionEnabled(_ json: [String: Any], id: String) -> Bool? {
  guard let settings = (json["extensions"] as? [String: Any])?["settings"] as? [String: Any],
        let extensionSettings = settings[id] as? [String: Any] else { return nil }

  // A list of reasons, which used to be a bit mask, and older versions also
  // keep a state, of which 1 is enabled
  switch extensionSettings["disable_reasons"] {
  case let reasons as [Any] where !reasons.isEmpty: return false
  case let reasons as Int where reasons != 0: return false
  default: break
  }
  if let state = extensionSettings["state"] as? Int {
    return state == 1
  }
  return true
}
