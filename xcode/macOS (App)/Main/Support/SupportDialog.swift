//
//  SupportDialog.swift
//  Ghostery
//
//  Support dialog of the main window, opened from the sidebar.
//

import SwiftUI

fileprivate enum Constants {
  static let width: CGFloat = 640
  static let topPadding: CGFloat = 40
  static let bottomPadding: CGFloat = 24
  static let horizontalPadding: CGFloat = 24
  static let spacing: CGFloat = 24
  static let textSpacing: CGFloat = 8
  static let descriptionWidth: CGFloat = 550

  static let imageWidth: CGFloat = 240
  static let imageHeight: CGFloat = 144

  static let optionsSpacing: CGFloat = 4
  static let optionPadding: CGFloat = 12
  static let optionSpacing: CGFloat = 16
  static let optionCornerRadius: CGFloat = 12
  static let optionIconSize: CGFloat = 64
  static let optionTextHeight: CGFloat = 92
  static let optionTextSpacing: CGFloat = 4
}

fileprivate enum Strings {
  // You can translate your strings here
  static let title = "Help & feedback"
  static let description = "Need help, want to share feedback, or spotted a tracker Ghostery doesn’t catch? Choose an option below and help us make Ghostery better."
}

fileprivate enum URLs {
  static let submitTracker = URL(string: "https://www.ghostery.com/submit-a-tracker")!.tagged(campaign: "support")
  // Placeholder until the survey is ready
  static let survey = URL(string: "https://www.ghostery.com")!
  static let support = URL(string: "https://www.ghostery.com/support")!.tagged(campaign: "support")
}

fileprivate let options = [
  SupportOption(
    id: "contact",
    icon: Icons.supportContact,
    title: "Something not working?",
    description: "Ghostery missing from a browser, or not behaving as expected? Our team will help.",
    actionTitle: "Contact support",
    action: .open(URLs.support),
    isPrimary: true
  ),
  SupportOption(
    id: "feedback",
    icon: Icons.supportFeedback,
    title: "How’s it going?",
    description: "A few quick questions about setting up and using Ghostery on your Mac.",
    actionTitle: "Share feedback",
    action: .open(URLs.survey),
    isPrimary: false
  ),
  SupportOption(
    id: "tracker",
    icon: Icons.supportTracker,
    title: "Found an unknown tracker?",
    description: "Report it to us to help keep the tracker database up to date.",
    actionTitle: "Submit a tracker",
    action: .open(URLs.submitTracker),
    isPrimary: false
  ),
]

struct SupportDialog: View {
  var onClose: () -> Void

  @Environment(\.performAction) private var performAction

  var body: some View {
    AppDialog(width: Constants.width, onClose: onClose) {
      content
    }
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
          SupportOptionCard(option: option, action: { performAction(option.action) })
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
  let title: String
  let description: String
  let actionTitle: String
  let action: MainAction
  let isPrimary: Bool
}

struct SupportOptionCard: View {
  let option: SupportOption
  var action: () -> Void

  var body: some View {
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
    .cardBackground(cornerRadius: Constants.optionCornerRadius)
    .singleActionAccessibility(label: [option.title, option.description, option.actionTitle])
  }
}

struct SupportDialog_Previews: PreviewProvider {
  static var previews: some View {
    SupportDialog(onClose: {})
      .padding(40)
  }
}
