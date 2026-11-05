//
//  Typography.swift
//  Ghostery
//
//  Styles of texts of the design, shared by the macOS and iOS apps.
//

import SwiftUI
#if os(macOS)
import AppKit
#else
import UIKit
#endif

/// Style of texts, in the size of the design. On iPhones and iPads, it
/// scales with the size of text chosen by the user, like the system style
/// it's relative to. Unchecked, as AppKit doesn't mark its fonts as
/// Sendable, though they can't change.
struct AppTextStyle: @unchecked Sendable {
  let size: CGFloat
  let weight: PlatformFont.Weight
  let lineHeight: CGFloat
  let relativeTo: Font.TextStyle

  // Computed once, as the styles are applied to every text
  fileprivate let platformFont: PlatformFont
  /// Added to the line height of the font, to get the one of the style
  fileprivate let extraLineHeight: CGFloat

  init(size: CGFloat, weight: PlatformFont.Weight, lineHeight: CGFloat, relativeTo: Font.TextStyle) {
    self.size = size
    self.weight = weight
    self.lineHeight = lineHeight
    self.relativeTo = relativeTo
    platformFont = PlatformFont(name: weight.interFontName, size: size) ?? PlatformFont.systemFont(ofSize: size, weight: weight)
    extraLineHeight = lineHeight - platformFont.textLineHeight
  }

  static let display2XL = AppTextStyle(size: 48, weight: .bold, lineHeight: 52, relativeTo: .largeTitle)
  static let displayL = AppTextStyle(size: 32, weight: .bold, lineHeight: 34, relativeTo: .title)
  static let displayM = AppTextStyle(size: 28, weight: .bold, lineHeight: 30, relativeTo: .title)
  static let displayS = AppTextStyle(size: 22, weight: .bold, lineHeight: 24, relativeTo: .title2)
  static let headlineM = AppTextStyle(size: 24, weight: .semibold, lineHeight: 32, relativeTo: .title2)
  static let headlineS = AppTextStyle(size: 18, weight: .semibold, lineHeight: 22, relativeTo: .headline)
  static let bodyL = AppTextStyle(size: 16, weight: .regular, lineHeight: 24, relativeTo: .body)
  static let bodyM = AppTextStyle(size: 14, weight: .regular, lineHeight: 20, relativeTo: .subheadline)
  static let bodyS = AppTextStyle(size: 12, weight: .regular, lineHeight: 16, relativeTo: .footnote)
  static let labelL = AppTextStyle(size: 16, weight: .semibold, lineHeight: 20, relativeTo: .callout)
  static let labelM = AppTextStyle(size: 14, weight: .semibold, lineHeight: 18, relativeTo: .subheadline)
  static let labelS = AppTextStyle(size: 12, weight: .semibold, lineHeight: 16, relativeTo: .footnote)
  static let labelXS = AppTextStyle(size: 11, weight: .semibold, lineHeight: 13, relativeTo: .caption2)

  /// Font of the style in the size of the design, without its line height,
  /// for parts of a text
  var font: Font {
    Font(platformFont: platformFont)
  }

  #if os(iOS)
  /// The font and the extra line height for the size of text chosen by
  /// the user
  fileprivate func scaled(to dynamicTypeSize: DynamicTypeSize) -> (font: PlatformFont, extraLineHeight: CGFloat) {
    guard dynamicTypeSize != .large else { return (platformFont, extraLineHeight) }
    let traits = UITraitCollection(preferredContentSizeCategory: UIContentSizeCategory(dynamicTypeSize))
    let scaledSize = UIFontMetrics(forTextStyle: relativeTo.uiTextStyle).scaledValue(for: size, compatibleWith: traits)
    let font = platformFont.withSize(scaledSize)
    return (font, lineHeight * scaledSize / size - font.textLineHeight)
  }
  #endif
}

private extension Font {
  init(platformFont: PlatformFont) {
    #if os(macOS)
    self.init(platformFont as CTFont)
    #else
    self.init(platformFont)
    #endif
  }
}

#if os(iOS)
private extension Font.TextStyle {
  var uiTextStyle: UIFont.TextStyle {
    switch self {
    case .largeTitle: return .largeTitle
    case .title: return .title1
    case .title2: return .title2
    case .title3: return .title3
    case .headline: return .headline
    case .subheadline: return .subheadline
    case .callout: return .callout
    case .footnote: return .footnote
    case .caption: return .caption1
    case .caption2: return .caption2
    default: return .body
    }
  }
}
#endif

private extension PlatformFont.Weight {
  // Inter faces bundled in the Fonts folder of the app, registered with
  // ATSApplicationFontsPath in the Info.plist of the macOS app, and with
  // UIAppFonts in the one of the iOS app
  var interFontName: String {
    switch self {
    case .bold: return "Inter28pt-Bold"
    case .semibold: return "Inter-SemiBold"
    default: return "Inter-Regular"
    }
  }
}

private extension PlatformFont {
  /// Height of a line of the font, as texts lay it out
  var textLineHeight: CGFloat {
    #if os(macOS)
    NSLayoutManager().defaultLineHeight(for: self)
    #else
    lineHeight
    #endif
  }
}

private struct AppTextStyleModifier: ViewModifier {
  let style: AppTextStyle

  #if os(iOS)
  @Environment(\.dynamicTypeSize) private var dynamicTypeSize
  #endif

  func body(content: Content) -> some View {
    #if os(iOS)
    let (font, extraLineHeight) = style.scaled(to: dynamicTypeSize)
    #else
    let (font, extraLineHeight) = (style.platformFont, style.extraLineHeight)
    #endif

    content
      .font(Font(platformFont: font))
      .lineSpacing(max(extraLineHeight, 0))
      .padding(.vertical, extraLineHeight / 2)
  }
}

extension View {
  func textStyle(_ style: AppTextStyle) -> some View {
    modifier(AppTextStyleModifier(style: style))
  }
}

extension Text {
  /// Translated text whose parts between ** are in the bold font, like
  /// the names of the buttons and options it refers to
  init(_ resource: LocalizedStringResource, boldFont: Font) {
    var string = AttributedString(localized: resource)
    for run in string.runs where run.inlinePresentationIntent?.contains(.stronglyEmphasized) == true {
      string[run.range].swiftUI.font = boldFont
      string[run.range].inlinePresentationIntent = nil
    }
    self.init(string)
  }
}
