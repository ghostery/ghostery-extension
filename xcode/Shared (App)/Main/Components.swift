//
//  Components.swift
//  Ghostery
//
//  Building blocks of the views, shared by the macOS and iOS apps.
//

import SwiftUI
#if os(macOS)
import AppKit
#else
import UIKit
#endif

fileprivate enum Constants {
  static let buttonHeight: CGFloat = 40
  static let largeButtonHeight: CGFloat = 48
  static let smallButtonHeight: CGFloat = 32
  static let buttonCornerRadius: CGFloat = 8
  static let buttonHorizontalPadding: CGFloat = 8
  static let largeButtonHorizontalPadding: CGFloat = 12
  static let buttonShadowRadius: CGFloat = 4
  static let buttonShadowY: CGFloat = 3
  static let buttonPressedOpacity: Double = 0.8
  static let borderLineWidth: CGFloat = 1
}

// MARK: - Typography

#if os(macOS)
typealias PlatformFont = NSFont
#else
typealias PlatformFont = UIFont
#endif

struct AppTextStyle {
  let size: CGFloat
  let weight: PlatformFont.Weight
  let lineHeight: CGFloat

  // Computed once, as the styles are applied to every text
  fileprivate let platformFont: PlatformFont
  /// Added to the line height of the font, to get the one of the style
  fileprivate let extraLineHeight: CGFloat

  init(size: CGFloat, weight: PlatformFont.Weight, lineHeight: CGFloat) {
    self.size = size
    self.weight = weight
    self.lineHeight = lineHeight
    platformFont = PlatformFont(name: weight.interFontName, size: size) ?? PlatformFont.systemFont(ofSize: size, weight: weight)
    extraLineHeight = lineHeight - platformFont.textLineHeight
  }

  static let display2XL = AppTextStyle(size: 48, weight: .bold, lineHeight: 52)
  static let displayL = AppTextStyle(size: 32, weight: .bold, lineHeight: 34)
  static let displayM = AppTextStyle(size: 28, weight: .bold, lineHeight: 30)
  static let displayS = AppTextStyle(size: 22, weight: .bold, lineHeight: 24)
  static let headlineM = AppTextStyle(size: 24, weight: .semibold, lineHeight: 32)
  static let headlineS = AppTextStyle(size: 18, weight: .semibold, lineHeight: 22)
  static let bodyL = AppTextStyle(size: 16, weight: .regular, lineHeight: 24)
  static let bodyM = AppTextStyle(size: 14, weight: .regular, lineHeight: 20)
  static let bodyS = AppTextStyle(size: 12, weight: .regular, lineHeight: 16)
  static let labelL = AppTextStyle(size: 16, weight: .semibold, lineHeight: 20)
  static let labelM = AppTextStyle(size: 14, weight: .semibold, lineHeight: 18)
  static let labelS = AppTextStyle(size: 12, weight: .semibold, lineHeight: 16)
  static let labelXS = AppTextStyle(size: 11, weight: .semibold, lineHeight: 13)

  /// Font of the style, without its line height, for parts of a text
  var font: Font {
    #if os(macOS)
    Font(platformFont as CTFont)
    #else
    Font(platformFont)
    #endif
  }
}

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

  func body(content: Content) -> some View {
    content
      .font(style.font)
      .lineSpacing(max(style.extraLineHeight, 0))
      .padding(.vertical, style.extraLineHeight / 2)
  }
}

extension View {
  func textStyle(_ style: AppTextStyle) -> some View {
    modifier(AppTextStyleModifier(style: style))
  }
}

// MARK: - Buttons

struct AppButtonStyle: ButtonStyle {
  enum Kind {
    case primary
    case secondary
    /// Secondary, in the colors of a warning, for the action of an alert
    case warning
    /// Secondary, in gray, next to the main action
    case secondaryGray
  }

  enum Size {
    /// Fills the available width
    case regular
    /// Fills the available width, taller for the main action of a dialog
    case large
    /// Fits its label
    case small
  }

  var kind: Kind
  var size: Size = .regular

  func makeBody(configuration: ButtonStyleConfiguration) -> some View {
    let shape = RoundedRectangle(cornerRadius: Constants.buttonCornerRadius)
    let colors = self.colors

    configuration.label
      .textStyle(.labelM)
      .foregroundColor(colors.label)
      .lineLimit(1)
      .padding(.horizontal, size == .large ? Constants.largeButtonHorizontalPadding : Constants.buttonHorizontalPadding)
      .frame(maxWidth: size == .small ? nil : .infinity)
      .frame(height: height)
      .background(
        shape
          .fill(colors.fill)
          .shadow(color: Colors.shadowButton, radius: Constants.buttonShadowRadius, y: Constants.buttonShadowY)
      )
      .overlay(
        shape.strokeBorder(colors.border, lineWidth: Constants.borderLineWidth)
      )
      .contentShape(shape)
      .opacity(configuration.isPressed ? Constants.buttonPressedOpacity : 1)
  }

  private var colors: (label: Color, fill: Color, border: Color) {
    switch kind {
    case .primary: return (Colors.foregroundOnBrand, Colors.bgBrandSolid, .clear)
    case .secondary: return (Colors.foregroundBrandPrimary, Colors.bgPrimary, Colors.borderBrandSolid)
    case .warning: return (Colors.foregroundWarningPrimary, Colors.bgPrimary, Colors.borderWarningSolid)
    case .secondaryGray: return (Colors.foregroundPrimary, Colors.bgPrimary, Colors.borderSecondary)
    }
  }

  private var height: CGFloat {
    switch size {
    case .regular: return Constants.buttonHeight
    case .large: return Constants.largeButtonHeight
    case .small: return Constants.smallButtonHeight
    }
  }
}

// MARK: - Texts

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

/// Title of a section, read as one heading
struct SectionTitle: View {
  /// Lines of the title, separated with "\n"
  var title: String
  var style: AppTextStyle = .displayM

  var body: some View {
    // Each line is a separate text, as the title's line height
    // is smaller than the one of its font
    VStack(alignment: .leading, spacing: 0) {
      ForEach(Array(title.components(separatedBy: "\n").enumerated()), id: \.offset) { _, line in
        Text(line)
          .textStyle(style)
      }
    }
    .accessibilityElement(children: .ignore)
    .accessibilityLabel(title.replacingOccurrences(of: "\n", with: " "))
    .accessibilityAddTraits(.isHeader)
  }
}

// MARK: - Cards

extension View {
  /// Background of a card, with a thin border
  func cardBackground(cornerRadius: CGFloat, fill: Color = Colors.bgPrimary) -> some View {
    let shape = RoundedRectangle(cornerRadius: cornerRadius)

    return background(shape.fill(fill))
      .overlay(shape.strokeBorder(Colors.borderPrimary, lineWidth: Constants.borderLineWidth))
  }

  /// Reads a card with a single button as one element, with the action of
  /// the button. The combined label leaves out the title of the button, so
  /// it's set from the parts of the card.
  func singleActionAccessibility(label parts: [String?]) -> some View {
    accessibilityElement(children: .combine)
      .accessibilityLabel(parts.compactMap { $0 }.joined(separator: ", "))
  }
}

// MARK: - Links

extension URL {
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

// MARK: - Spinners

/// Arc turning continuously, shown while waiting
struct AppSpinner: View {
  var color: Color
  var lineWidth: CGFloat
  /// Part of the circle covered by the arc
  var length: CGFloat
  var turnDuration: TimeInterval

  var body: some View {
    // Follows the clock, so animations of the views around don't affect it
    TimelineView(.animation) { context in
      let turns = context.date.timeIntervalSinceReferenceDate / turnDuration

      Circle()
        .trim(from: 0, to: length)
        .stroke(color, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
        // Starts at the top
        .rotationEffect(.degrees(turns.truncatingRemainder(dividingBy: 1) * 360 - 90))
    }
  }
}
