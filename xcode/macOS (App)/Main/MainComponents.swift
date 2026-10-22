//
//  MainComponents.swift
//  Ghostery
//
//  Building blocks of the sections and dialogs of the main window.
//

import SwiftUI

fileprivate enum Constants {
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
            .foregroundColor(configuration.isOn ? Colors.foregroundSecondary : Colors.foregroundTertiary)
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
