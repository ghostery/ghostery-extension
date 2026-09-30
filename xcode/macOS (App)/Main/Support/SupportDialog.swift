//
//  SupportDialog.swift
//  Ghostery
//
//  Support dialog of the main window, opened from the sidebar.
//

import SwiftUI

fileprivate enum Constants {
  static let width: CGFloat = 640
  static let cornerRadius: CGFloat = 24
  static let shadowRadius: CGFloat = 25
  static let topPadding: CGFloat = 40
  static let bottomPadding: CGFloat = 24
  static let horizontalPadding: CGFloat = 24
  static let spacing: CGFloat = 24
  static let textSpacing: CGFloat = 8
  static let descriptionWidth: CGFloat = 550

  static let imageWidth: CGFloat = 240
  static let imageHeight: CGFloat = 144

  static let closeButtonSize: CGFloat = 24
  static let closeButtonPadding: CGFloat = 32

  static let optionsSpacing: CGFloat = 4
  static let optionPadding: CGFloat = 12
  static let optionSpacing: CGFloat = 16
  static let optionCornerRadius: CGFloat = 12
  static let optionIconSize: CGFloat = 64
  static let optionTextHeight: CGFloat = 92
  static let optionTextSpacing: CGFloat = 4

  static let borderLineWidth: CGFloat = 1
}

fileprivate enum Strings {
  // You can translate your strings here
  static let title = "Support"
  static let description = "Need help, want to share feedback, or spotted a tracker Ghostery doesn’t catch? Choose an option below and help us make Ghostery better."
  static let close = "Close"
}

fileprivate let options = [
  SupportOption(
    id: "tracker",
    icon: Icons.supportTracker,
    title: "Submit\na new tracker",
    description: "Help us identify unblocked trackers by submitting details for analysis.",
    actionTitle: "Submit a tracker",
    isPrimary: true
  ),
  SupportOption(
    id: "feedback",
    icon: Icons.supportFeedback,
    title: "Ask\nfor feedback",
    description: "Tell us about your experience and what features you’d like to see next.",
    actionTitle: "Take the survey",
    isPrimary: false
  ),
  SupportOption(
    id: "contact",
    icon: Icons.supportContact,
    title: "Contact\nsupport",
    description: "Have a question or technical issue? Our team is ready to help.",
    actionTitle: "Open a Ticket",
    isPrimary: false
  ),
]

struct SupportDialog: View {
  var onClose: () -> Void

  var body: some View {
    let shape = RoundedRectangle(cornerRadius: Constants.cornerRadius)

    // Scrolls only when the window is too short for it
    ViewThatFits(in: .vertical) {
      content
      ScrollView(.vertical) {
        content
      }
      .scrollBounceBehavior(.basedOnSize)
    }
    .frame(width: Constants.width)
    .clipShape(shape)
    .background(
      shape
        .fill(Colors.bgPrimary)
        .shadow(color: Colors.shadowPanel, radius: Constants.shadowRadius)
    )
    .overlay(shape.strokeBorder(Colors.borderPrimary, lineWidth: Constants.borderLineWidth))
    .overlay(alignment: .topTrailing) {
      Button(action: onClose) {
        Image(Icons.supportClose)
          .frame(width: Constants.closeButtonSize, height: Constants.closeButtonSize)
          .contentShape(Rectangle())
      }
      .buttonStyle(.plain)
      .keyboardShortcut(.cancelAction)
      .help(Strings.close)
      .accessibilityLabel(Strings.close)
      .padding(Constants.closeButtonPadding)
    }
    .accessibilityElement(children: .contain)
    .accessibilityAddTraits(.isModal)
  }

  private var content: some View {
    VStack(spacing: Constants.spacing) {
      Image(decorative: Icons.supportHeader)
        .frame(width: Constants.imageWidth, height: Constants.imageHeight)

      VStack(spacing: Constants.textSpacing) {
        Text(Strings.title)
          .textStyle(.displayS)
          .accessibilityAddTraits(.isHeader)
        Text(Strings.description)
          .textStyle(.bodyM)
          .multilineTextAlignment(.center)
          .frame(width: Constants.descriptionWidth)
          .fixedSize(horizontal: false, vertical: true)
      }
      .foregroundColor(Colors.foregroundPrimary)

      HStack(alignment: .top, spacing: Constants.optionsSpacing) {
        ForEach(options) { option in
          SupportOptionCard(option: option, action: {})
        }
      }
    }
    .padding(.top, Constants.topPadding)
    .padding(.bottom, Constants.bottomPadding)
    .padding(.horizontal, Constants.horizontalPadding)
  }
}

// MARK: - Option card

struct SupportOption: Identifiable {
  let id: String
  let icon: String
  /// Lines of the title, separated with "\n"
  let title: String
  let description: String
  let actionTitle: String
  let isPrimary: Bool
}

struct SupportOptionCard: View {
  let option: SupportOption
  var action: () -> Void

  var body: some View {
    let shape = RoundedRectangle(cornerRadius: Constants.optionCornerRadius)

    VStack(alignment: .leading, spacing: Constants.optionSpacing) {
      Image(decorative: option.icon)
        .frame(width: Constants.optionIconSize, height: Constants.optionIconSize)
        .background(Circle().fill(Colors.bgBrandSecondary))

      VStack(alignment: .leading, spacing: Constants.optionTextSpacing) {
        Text(option.title)
          .textStyle(.headlineS)
          .foregroundColor(Colors.foregroundPrimary)
          .fixedSize(horizontal: false, vertical: true)
        Text(option.description)
          .textStyle(.bodyS)
          .foregroundColor(Colors.foregroundSecondary)
          .fixedSize(horizontal: false, vertical: true)
      }
      .frame(maxWidth: .infinity, alignment: .leading)
      // As tall as two lines of the title and three of the description,
      // so the buttons line up
      .frame(height: Constants.optionTextHeight, alignment: .top)

      Button(action: action) {
        Text(option.actionTitle)
      }
      .buttonStyle(AppButtonStyle(kind: option.isPrimary ? .primary : .secondary))
    }
    .padding(Constants.optionPadding)
    .frame(maxWidth: .infinity)
    .background(shape.fill(Colors.bgPrimary))
    .overlay(shape.strokeBorder(Colors.borderPrimary, lineWidth: Constants.borderLineWidth))
    // Read as one element, with the action of its button, whose title
    // the combined label leaves out
    .accessibilityElement(children: .combine)
    .accessibilityLabel(
      [option.title.replacingOccurrences(of: "\n", with: " "), option.description, option.actionTitle]
        .joined(separator: ", ")
    )
  }
}

struct SupportDialog_Previews: PreviewProvider {
  static var previews: some View {
    SupportDialog(onClose: {})
      .padding(40)
  }
}
