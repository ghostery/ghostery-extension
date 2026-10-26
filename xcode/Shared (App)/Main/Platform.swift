//
//  Platform.swift
//  Ghostery
//
//  What differs between the Mac, and iPhones and iPads, for the code shared
//  by the macOS and iOS apps.
//

import OSLog
import SwiftUI
#if os(macOS)
import AppKit

typealias PlatformFont = NSFont
/// Image as decoded on the platform, like the ones fetched by the app
typealias PlatformImage = NSImage
#else
import UIKit

typealias PlatformFont = UIFont
/// Image as decoded on the platform, like the ones fetched by the app
typealias PlatformImage = UIImage
#endif

extension Image {
  init(platformImage: PlatformImage) {
    #if os(macOS)
    self.init(nsImage: platformImage)
    #else
    self.init(uiImage: platformImage)
    #endif
  }
}

// MARK: - Layouts

/// Sizes of a view, which differ between the Mac, iPhones and iPads
protocol PlatformLayout: Sendable {
  #if os(macOS)
  static var mac: Self { get }
  #else
  static var phone: Self { get }
  static var tablet: Self { get }
  #endif
}

/// The layout of a view for the device, and on iPads for the width of the
/// window
@propertyWrapper
struct CurrentLayout<Layout: PlatformLayout>: DynamicProperty {
  #if os(iOS)
  @Environment(\.horizontalSizeClass) private var horizontalSizeClass
  #endif

  var wrappedValue: Layout {
    #if os(macOS)
    .mac
    #else
    horizontalSizeClass == .regular ? .tablet : .phone
    #endif
  }
}

// MARK: - System

/// Clipboard of the system
enum Pasteboard {
  static func copy(_ text: String) {
    #if os(macOS)
    NSPasteboard.general.clearContents()
    NSPasteboard.general.setString(text, forType: .string)
    #else
    UIPasteboard.general.string = text
    #endif
  }
}

// MARK: - Links

extension URL {
  /// Page of the App Store, opened in the App Store app
  static func appStore(_ path: String) -> URL {
    #if os(macOS)
    URL(string: "macappstores://apps.apple.com/\(path)")!
    #else
    URL(string: "itms-apps://apps.apple.com/\(path)")!
    #endif
  }

  /// The link tagged as opened from a part of this app, for the statistics
  /// of the website
  func tagged(campaign: String) -> URL {
    guard var components = URLComponents(url: self, resolvingAgainstBaseURL: false) else { return self }
    components.queryItems = (components.queryItems ?? []) + [
      URLQueryItem(name: "utm_source", value: Self.utmSource),
      URLQueryItem(name: "utm_campaign", value: campaign),
    ]
    return components.url ?? self
  }

  #if os(macOS)
  private static let utmSource = "native-macos"
  #else
  private static let utmSource = "native-ios"
  #endif
}

// MARK: - Logs

extension Logger {
  /// Logger of a part of the app
  init(category: String) {
    self.init(subsystem: Bundle.main.bundleIdentifier ?? "Ghostery", category: category)
  }
}
