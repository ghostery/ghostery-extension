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
}

fileprivate enum Strings {
  // You can translate your strings here
  static let toggleOn = "ON"
  static let toggleOff = "OFF"
  static let close = "Close"
}

// MARK: - Typography

struct AppTextStyle {
  let size: CGFloat
  let weight: NSFont.Weight
  let lineHeight: CGFloat

  static let displayM = AppTextStyle(size: 28, weight: .bold, lineHeight: 30)
  static let displayS = AppTextStyle(size: 22, weight: .bold, lineHeight: 24)
  static let headlineS = AppTextStyle(size: 18, weight: .semibold, lineHeight: 22)
  static let bodyL = AppTextStyle(size: 16, weight: .regular, lineHeight: 24)
  static let bodyM = AppTextStyle(size: 14, weight: .regular, lineHeight: 20)
  static let bodyS = AppTextStyle(size: 12, weight: .regular, lineHeight: 16)
  static let labelL = AppTextStyle(size: 16, weight: .semibold, lineHeight: 20)
  static let labelM = AppTextStyle(size: 14, weight: .semibold, lineHeight: 18)
  static let labelS = AppTextStyle(size: 12, weight: .semibold, lineHeight: 16)
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
    let font = NSFont(name: style.weight.interFontName, size: style.size)
      ?? NSFont.systemFont(ofSize: style.size, weight: style.weight)
    let extraLineHeight = style.lineHeight - NSLayoutManager().defaultLineHeight(for: font)

    content
      .font(Font(font as CTFont))
      .lineSpacing(max(extraLineHeight, 0))
      .padding(.vertical, extraLineHeight / 2)
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
  }

  enum Size {
    /// Fills the available width
    case regular
    /// Fits its label
    case small
  }

  var kind: Kind
  var size: Size = .regular

  func makeBody(configuration: ButtonStyleConfiguration) -> some View {
    let shape = RoundedRectangle(cornerRadius: Constants.buttonCornerRadius)

    configuration.label
      .textStyle(.labelM)
      .foregroundColor(kind == .primary ? Colors.foregroundOnBrand : Colors.foregroundBrandPrimary)
      .lineLimit(1)
      .padding(.horizontal, Constants.buttonHorizontalPadding)
      .frame(maxWidth: size == .regular ? .infinity : nil)
      .frame(height: size == .regular ? Constants.buttonHeight : Constants.smallButtonHeight)
      .background(
        shape
          .fill(kind == .primary ? Colors.bgBrandSolid : Colors.bgPrimary)
          .shadow(color: Colors.shadowButton, radius: Constants.buttonShadowRadius, y: Constants.buttonShadowY)
      )
      .overlay(
        shape.strokeBorder(kind == .primary ? Color.clear : Colors.borderBrandSolid, lineWidth: Constants.borderLineWidth)
      )
      .contentShape(shape)
      .opacity(configuration.isPressed ? Constants.buttonPressedOpacity : 1)
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
      .frame(width: Constants.toggleStateWidth, alignment: .leading)
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
        // Each line is a separate text, as the title's line height
        // is smaller than the one of its font
        VStack(alignment: .leading, spacing: 0) {
          ForEach(Array(title.components(separatedBy: "\n").enumerated()), id: \.offset) { _, line in
            Text(line)
              .textStyle(.displayM)
          }
        }
        // Read as one heading
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(title.replacingOccurrences(of: "\n", with: " "))
        .accessibilityAddTraits(.isHeader)
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

// MARK: - Dialogs

/// Dialog of the main window, with a button closing it. It scrolls only
/// when the window is too short for it.
struct AppDialog<Content: View>: View {
  private let width: CGFloat
  private let onClose: () -> Void
  private let content: Content

  init(width: CGFloat, onClose: @escaping () -> Void, @ViewBuilder content: () -> Content) {
    self.width = width
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
    .accessibilityElement(children: .contain)
    .accessibilityAddTraits(.isModal)
  }
}
