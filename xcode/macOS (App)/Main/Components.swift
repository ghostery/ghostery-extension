//
//  Components.swift
//  Ghostery
//
//  Building blocks shared by the sections of the main window.
//

import AppKit
import SwiftUI

fileprivate enum Constants {
  static let buttonHeight: CGFloat = 40
  static let largeButtonHeight: CGFloat = 48
  static let smallButtonHeight: CGFloat = 32
  static let buttonCornerRadius: CGFloat = 8
  static let buttonHorizontalPadding: CGFloat = 8
  static let buttonShadowRadius: CGFloat = 4
  static let buttonShadowY: CGFloat = 3
  static let buttonPressedOpacity: Double = 0.8
  static let borderLineWidth: CGFloat = 1

  // 16 after the label, and 40 before the switch
  static let toggleSpacing: CGFloat = 56
  static let toggleTopPadding: CGFloat = 4
  static let toggleWidth: CGFloat = 36
  static let toggleHeight: CGFloat = 20
  static let toggleKnobSize: CGFloat = 16
  static let toggleKnobPadding: CGFloat = 2
  static let toggleKnobShadowRadius: CGFloat = 1.5
  static let toggleKnobShadowY: CGFloat = 1
  static let toggleStateSpacing: CGFloat = 8
  static let toggleStateWidth: CGFloat = 80
  static let toggleAnimationDuration: Double = 0.15

  static let headerTextWidth: CGFloat = 318
  static let headerTextSpacing: CGFloat = 8
  static let headerImageWidth: CGFloat = 300
  static let headerImageHeight: CGFloat = 144
  static let headerTopPadding: CGFloat = 40
  static let headerBottomPadding: CGFloat = 48
  static let headerHorizontalPadding: CGFloat = 40

  static let dialogCornerRadius: CGFloat = 24
  static let dialogShadowRadius: CGFloat = 25
  static let dialogCloseButtonSize: CGFloat = 24
  static let dialogCloseButtonPadding: CGFloat = 32
  static let dialogCloseTitleTopPadding: CGFloat = 23
  static let dialogCloseTitleTrailingPadding: CGFloat = 26
}

fileprivate enum Strings {
  // You can translate your strings here
  static let toggleOn = String(localized: "ON", comment: "State of a switch, shown next to it")
  static let toggleOff = String(localized: "OFF", comment: "State of a switch, shown next to it")
  static let close = String(localized: "Close", comment: "Button closing a dialog")
}

// MARK: - Typography

struct AppTextStyle {
  let size: CGFloat
  let weight: NSFont.Weight
  let lineHeight: CGFloat

  // Computed once, as the styles are applied to every text
  fileprivate let nsFont: NSFont
  /// Added to the line height of the font, to get the one of the style
  fileprivate let extraLineHeight: CGFloat

  init(size: CGFloat, weight: NSFont.Weight, lineHeight: CGFloat) {
    self.size = size
    self.weight = weight
    self.lineHeight = lineHeight
    nsFont = NSFont(name: weight.interFontName, size: size) ?? NSFont.systemFont(ofSize: size, weight: weight)
    extraLineHeight = lineHeight - NSLayoutManager().defaultLineHeight(for: nsFont)
  }

  static let displayM = AppTextStyle(size: 28, weight: .bold, lineHeight: 30)
  static let displayS = AppTextStyle(size: 22, weight: .bold, lineHeight: 24)
  static let headlineS = AppTextStyle(size: 18, weight: .semibold, lineHeight: 22)
  static let bodyL = AppTextStyle(size: 16, weight: .regular, lineHeight: 24)
  static let bodyM = AppTextStyle(size: 14, weight: .regular, lineHeight: 20)
  static let bodyS = AppTextStyle(size: 12, weight: .regular, lineHeight: 16)
  static let labelL = AppTextStyle(size: 16, weight: .semibold, lineHeight: 20)
  static let labelM = AppTextStyle(size: 14, weight: .semibold, lineHeight: 18)
  static let labelS = AppTextStyle(size: 12, weight: .semibold, lineHeight: 16)

  /// Font of the style, without its line height, for parts of a text
  var font: Font { Font(nsFont as CTFont) }
}

private extension NSFont.Weight {
  // Inter faces bundled in the Fonts folder of the app,
  // registered with ATSApplicationFontsPath in its Info.plist
  var interFontName: String {
    switch self {
    case .bold: return "Inter28pt-Bold"
    case .semibold: return "Inter-SemiBold"
    default: return "Inter-Regular"
    }
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
      .padding(.horizontal, Constants.buttonHorizontalPadding)
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

// MARK: - Toggles

/// Label of the toggle, followed by its switch and the state of the switch
struct AppToggleStyle: ToggleStyle {
  func makeBody(configuration: ToggleStyleConfiguration) -> some View {
    HStack(alignment: .top, spacing: Constants.toggleSpacing) {
      configuration.label
        .frame(maxWidth: .infinity, alignment: .leading)

      Button {
        configuration.isOn.toggle()
      } label: {
        HStack(spacing: Constants.toggleStateSpacing) {
          toggleSwitch(isOn: configuration.isOn)
          Text(configuration.isOn ? Strings.toggleOn : Strings.toggleOff)
            .textStyle(.labelM)
            .foregroundColor(configuration.isOn ? Colors.foregroundSecondary : Colors.foregroungTertiary)
            // Assistive technologies get the state as the value of the toggle
            .accessibilityHidden(true)
        }
        .contentShape(Rectangle())
      }
      .buttonStyle(.plain)
      // Wider for the longer states of some languages
      .frame(minWidth: Constants.toggleStateWidth, alignment: .leading)
      .padding(.top, Constants.toggleTopPadding)
    }
    // Assistive technologies get a single toggle, named by its label
    .accessibilityElement(children: .combine)
    .accessibilityAddTraits(.isToggle)
  }

  private func toggleSwitch(isOn: Bool) -> some View {
    Capsule()
      .fill(isOn ? Colors.foregroundSecondary : Colors.foregroundQuaternary)
      .frame(width: Constants.toggleWidth, height: Constants.toggleHeight)
      .overlay(alignment: isOn ? .trailing : .leading) {
        Circle()
          .fill(Colors.bgPrimary)
          .shadow(color: Colors.shadowSmall, radius: Constants.toggleKnobShadowRadius, y: Constants.toggleKnobShadowY)
          .frame(width: Constants.toggleKnobSize, height: Constants.toggleKnobSize)
          .padding(Constants.toggleKnobPadding)
      }
      .animation(.easeInOut(duration: Constants.toggleAnimationDuration), value: isOn)
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

// MARK: - Sections

/// Scrolling content of a section, with a footer at its end. In taller
/// windows the footer stays at the bottom, and in shorter ones it scrolls
/// with the content below the title bar.
struct SectionScrollView<Content: View, Footer: View>: View {
  private let content: Content
  private let footer: Footer

  init(@ViewBuilder content: () -> Content, @ViewBuilder footer: () -> Footer) {
    self.content = content()
    self.footer = footer()
  }

  var body: some View {
    GeometryReader { proxy in
      ScrollView(.vertical) {
        VStack(alignment: .leading, spacing: 0) {
          content
          Spacer(minLength: 0)
          footer
        }
        // Fills the visible height when the content is shorter
        .frame(minHeight: proxy.size.height, alignment: .top)
      }
      .scrollBounceBehavior(.basedOnSize)
      // SwiftUI extends scroll views under the window's title bar,
      // but the content should scroll only below the header
      .clipped()
    }
  }
}

/// Header of a section, with its title, description and illustration
struct SectionHeader: View {
  /// Lines of the title, separated with "\n"
  var title: String
  var description: String
  var descriptionStyle: AppTextStyle
  var image: String

  var body: some View {
    HStack(spacing: 0) {
      VStack(alignment: .leading, spacing: Constants.headerTextSpacing) {
        SectionTitle(title: title)
        Text(description)
          .textStyle(descriptionStyle)
          .fixedSize(horizontal: false, vertical: true)
      }
      .foregroundColor(Colors.foregroundPrimary)
      .frame(width: Constants.headerTextWidth, alignment: .leading)

      Spacer(minLength: 0)

      Image(decorative: image)
        .frame(width: Constants.headerImageWidth, height: Constants.headerImageHeight)
    }
    .padding(.top, Constants.headerTopPadding)
    .padding(.bottom, Constants.headerBottomPadding)
    .padding(.horizontal, Constants.headerHorizontalPadding)
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

// MARK: - Dialogs

/// Dialog of the main window, with a button closing it. It scrolls only
/// when the window is too short for it.
struct AppDialog<Content: View>: View {
  private let width: CGFloat
  private let closeTitle: String?
  private let onClose: () -> Void
  private let content: Content

  /// The close button shows the title instead of the icon, when it's set
  init(width: CGFloat, closeTitle: String? = nil, onClose: @escaping () -> Void, @ViewBuilder content: () -> Content) {
    self.width = width
    self.closeTitle = closeTitle
    self.onClose = onClose
    self.content = content()
  }

  var body: some View {
    let shape = RoundedRectangle(cornerRadius: Constants.dialogCornerRadius)

    ViewThatFits(in: .vertical) {
      content
      ScrollView(.vertical) {
        content
      }
      .scrollBounceBehavior(.basedOnSize)
    }
    .frame(width: width)
    .clipShape(shape)
    .background(
      shape
        .fill(Colors.bgPrimary)
        .shadow(color: Colors.shadowPanel, radius: Constants.dialogShadowRadius)
    )
    .overlay(shape.strokeBorder(Colors.borderPrimary, lineWidth: Constants.borderLineWidth))
    .overlay(alignment: .topTrailing) {
      closeButton
    }
    .accessibilityElement(children: .contain)
    .accessibilityAddTraits(.isModal)
  }

  @ViewBuilder
  private var closeButton: some View {
    if let closeTitle {
      Button(action: onClose) {
        Text(closeTitle)
          .textStyle(.labelM)
          .foregroundColor(Colors.foregroundPrimary)
          .contentShape(Rectangle())
      }
      .buttonStyle(.plain)
      .keyboardShortcut(.cancelAction)
      .padding(.top, Constants.dialogCloseTitleTopPadding)
      .padding(.trailing, Constants.dialogCloseTitleTrailingPadding)
    } else {
      Button(action: onClose) {
        Image(Icons.dialogClose)
          .frame(width: Constants.dialogCloseButtonSize, height: Constants.dialogCloseButtonSize)
          .contentShape(Rectangle())
      }
      .buttonStyle(.plain)
      .keyboardShortcut(.cancelAction)
      .help(Strings.close)
      .accessibilityLabel(Strings.close)
      .padding(Constants.dialogCloseButtonPadding)
    }
  }
}

// MARK: - Links

extension URL {
  /// The link tagged as opened from a part of this app, for the statistics
  /// of the website
  func tagged(campaign: String) -> URL {
    guard var components = URLComponents(url: self, resolvingAgainstBaseURL: false) else { return self }
    components.queryItems = (components.queryItems ?? []) + [
      URLQueryItem(name: "utm_source", value: "native-macos"),
      URLQueryItem(name: "utm_campaign", value: campaign),
    ]
    return components.url ?? self
  }
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
