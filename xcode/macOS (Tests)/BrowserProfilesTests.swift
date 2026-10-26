//
//  BrowserProfilesTests.swift
//  Ghostery
//
//  Reading of the files of the browser profiles, with samples of the files
//  as the browsers write them.
//

import Foundation
import Testing

private func jsonObject(_ text: String) throws -> [String: Any] {
  try #require(JSONSerialization.jsonObject(with: Data(text.utf8)) as? [String: Any])
}

@Suite struct FirefoxProfilesTests {
  private let profilesURL = URL(fileURLWithPath: "/Users/someone/Library/Application Support/Firefox", isDirectory: true)

  @Test func listsTheProfilesOfProfilesINI() {
    let sections = BrowserProfiles.parseINI("""
      [Install4F96D1932A9F858E]
      Default=Profiles/abc123.default-release
      Locked=1

      [Profile1]
      Name=default
      IsRelative=1
      Path=Profiles/xyz789.default
      Default=1

      [Profile0]
      Name=default-release
      IsRelative=1
      Path=Profiles/abc123.default-release

      [Profile2]
      Name=work
      IsRelative=0
      Path=/Users/someone/Work Profile

      [General]
      StartWithLastProfile=1
      Version=2
      """)

    #expect(sections.count == 5)
    #expect(BrowserProfiles.firefoxProfiles(listedIn: sections, profilesURL: profilesURL).map(\.path) == [
      "/Users/someone/Library/Application Support/Firefox/Profiles/xyz789.default",
      "/Users/someone/Library/Application Support/Firefox/Profiles/abc123.default-release",
      "/Users/someone/Work Profile",
    ])
  }

  @Test func readsValuesWithEqualSignsAndSpaces() {
    let sections = BrowserProfiles.parseINI("""
      key before any section=is left out
        [Section]
        Path = with spaces
      Query=a=b
      """)

    #expect(sections == [["Path ": " with spaces", "Query": "a=b"]])
  }

  @Test func tellsTheAppWhichOpenedTheProfileLast() {
    let compatibility = BrowserProfiles.parseINI("""
      [Compatibility]
      LastVersion=144.0_20251020094502/20251020094502
      LastOSABI=Darwin_aarch64-gcc3
      LastPlatformDir=/Applications/Firefox.app/Contents/Resources
      LastAppDir=/Applications/Firefox.app/Contents/Resources/browser
      """)

    #expect(BrowserProfiles.isFirefoxProfile(compatibility: compatibility, lastOpenedBy: URL(fileURLWithPath: "/Applications/Firefox.app")))
    #expect(!BrowserProfiles.isFirefoxProfile(compatibility: compatibility, lastOpenedBy: URL(fileURLWithPath: "/Applications/Firefox Nightly.app")))
    #expect(!BrowserProfiles.isFirefoxProfile(compatibility: compatibility, lastOpenedBy: URL(fileURLWithPath: "/Applications/Firefox.ap")))
    #expect(!BrowserProfiles.isFirefoxProfile(compatibility: [], lastOpenedBy: URL(fileURLWithPath: "/Applications/Firefox.app")))
  }

  @Test(arguments: [
    (#"{"id": "firefox@ghostery.com", "active": true, "userDisabled": false, "appDisabled": false, "embedderDisabled": false}"#, true),
    (#"{"id": "firefox@ghostery.com", "active": true}"#, true),
    (#"{"id": "firefox@ghostery.com", "active": false, "userDisabled": true}"#, false),
    (#"{"id": "firefox@ghostery.com", "active": true, "userDisabled": true}"#, false),
    (#"{"id": "firefox@ghostery.com", "active": true, "appDisabled": true}"#, false),
    (#"{"id": "firefox@ghostery.com", "active": true, "embedderDisabled": true}"#, false),
    (#"{"id": "firefox@ghostery.com"}"#, false),
  ])
  func readsTheStateOfTheExtension(addon: String, isEnabled: Bool) throws {
    let json = try jsonObject(#"{"schemaVersion": 36, "addons": [{"id": "other@example.com", "active": true}, \#(addon)]}"#)

    #expect(BrowserProfiles.isFirefoxExtensionEnabled(json, id: "firefox@ghostery.com") == isEnabled)
  }

  @Test func leavesOutTheExtensionWhenItIsNotInstalled() throws {
    let json = try jsonObject(#"{"schemaVersion": 36, "addons": [{"id": "other@example.com", "active": true}]}"#)

    #expect(BrowserProfiles.isFirefoxExtensionEnabled(json, id: "firefox@ghostery.com") == nil)
    #expect(BrowserProfiles.isFirefoxExtensionEnabled([:], id: "firefox@ghostery.com") == nil)
  }
}

@Suite struct ChromiumProfilesTests {
  private let id = "mlomiejdfkolichcflejclcbmpeaniij"

  @Test func listsTheProfilesOfLocalState() throws {
    let json = try jsonObject("""
      {"profile": {"info_cache": {"Default": {"name": "Person 1"}, "Profile 3": {"name": "Work"}}, "last_used": "Default"}}
      """)

    #expect(BrowserProfiles.chromiumProfileNames(localState: json)?.sorted() == ["Default", "Profile 3"])
    #expect(BrowserProfiles.chromiumProfileNames(localState: [:]) == nil)
  }

  @Test(arguments: [
    (#"{}"#, true),
    (#"{"disable_reasons": []}"#, true),
    (#"{"disable_reasons": [1]}"#, false),
    (#"{"disable_reasons": 0}"#, true),
    (#"{"disable_reasons": 8192}"#, false),
    (#"{"state": 1}"#, true),
    (#"{"state": 0}"#, false),
    (#"{"disable_reasons": [], "state": 0}"#, false),
  ])
  func readsTheStateOfTheExtension(settings: String, isEnabled: Bool) throws {
    let json = try jsonObject(#"{"extensions": {"settings": {"\#(id)": \#(settings), "other": {"state": 1}}}}"#)

    #expect(BrowserProfiles.isChromiumExtensionEnabled(json, id: id) == isEnabled)
  }

  @Test func leavesOutTheExtensionWhenItIsNotInstalled() throws {
    let json = try jsonObject(#"{"extensions": {"settings": {"other": {"state": 1}}}}"#)

    #expect(BrowserProfiles.isChromiumExtensionEnabled(json, id: id) == nil)
    #expect(BrowserProfiles.isChromiumExtensionEnabled([:], id: id) == nil)
  }
}
