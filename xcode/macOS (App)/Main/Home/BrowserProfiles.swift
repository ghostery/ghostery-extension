//
//  BrowserProfiles.swift
//  Ghostery
//
//  What the files of the browser profiles tell about Ghostery, apart from
//  reading the files, so the tests can check it with samples of them.
//

import Foundation

enum BrowserProfiles {
  /// The sections of an INI file, like profiles.ini of Firefox, with their
  /// keys and values
  static func parseINI(_ text: String) -> [[String: String]] {
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

  /// The folders of the Firefox profiles listed in profiles.ini, in the
  /// folder of the profiles or elsewhere
  static func firefoxProfiles(listedIn sections: [[String: String]], profilesURL: URL) -> [URL] {
    sections.compactMap { section in
      guard let path = section["Path"] else { return nil }
      return section["IsRelative"] == "1" ? profilesURL.appending(path: path) : URL(fileURLWithPath: path)
    }
  }

  /// Whether the app opened the Firefox profile last, by its compatibility.ini,
  /// as Firefox Nightly and Developer Edition share the profiles with Firefox
  static func isFirefoxProfile(compatibility sections: [[String: String]], lastOpenedBy appURL: URL) -> Bool {
    guard let platformPath = sections.lazy.compactMap({ $0["LastPlatformDir"] }).first else { return false }
    return platformPath.hasPrefix(appURL.standardizedFileURL.path + "/")
  }

  /// Whether the extension is enabled, by extensions.json of a Firefox
  /// profile, or nil when it isn't installed
  static func isFirefoxExtensionEnabled(_ json: [String: Any], id: String) -> Bool? {
    guard let addons = json["addons"] as? [[String: Any]],
          let addon = addons.first(where: { $0["id"] as? String == id }) else { return nil }

    return addon["active"] as? Bool == true
      && addon["userDisabled"] as? Bool != true
      && addon["appDisabled"] as? Bool != true
      && addon["embedderDisabled"] as? Bool != true
  }

  /// The folders of the profiles of a Chromium browser, by its Local State
  /// file, or nil when it doesn't list them
  static func chromiumProfileNames(localState json: [String: Any]) -> [String]? {
    ((json["profile"] as? [String: Any])?["info_cache"] as? [String: Any]).map { Array($0.keys) }
  }

  /// Whether the extension is enabled, by the preferences of a profile of
  /// a Chromium browser, or nil when it isn't installed
  static func isChromiumExtensionEnabled(_ json: [String: Any], id: String) -> Bool? {
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
}
