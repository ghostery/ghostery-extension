//
//  SafariInstructionsView.swift
//  Ghostery
//
//  Steps to enable or disable the extension in Safari, opened from the Home
//  section.
//

import SwiftUI

fileprivate enum Constants {
  static let headerSpacing: CGFloat = 24
  static let headerTopPadding: CGFloat = 40
  static let headerBottomPadding: CGFloat = 48
  static let headerHorizontalPadding: CGFloat = 40
  static let headerImageWidth: CGFloat = 240
  static let headerImageHeight: CGFloat = 144
  static let backIconSize: CGFloat = 16

  static let enabledTitleSpacing: CGFloat = 16
  static let enabledIconSize: CGFloat = 40

  static let stepsHeaderSpacing: CGFloat = 8
  static let stepsHeaderLeadingPadding: CGFloat = 24
  static let stepsHeaderTrailingPadding: CGFloat = 20
  static let stepsHeaderBottomPadding: CGFloat = 12
  // Between the steps of a section and the header of the next one
  static let stepsHeaderTopPadding: CGFloat = 16
  static let chevronSize: CGFloat = 16

  static let stepsSpacing: CGFloat = 4
  static let stepsHorizontalPadding: CGFloat = 20
  static let stepPadding: CGFloat = 16
  static let stepSpacing: CGFloat = 16
  static let stepTextSpacing: CGFloat = 10
  static let stepCornerRadius: CGFloat = 12
  static let stepNumberSize: CGFloat = 40
  // Added to the padding of the button, as in the design
  static let stepButtonLabelPadding: CGFloat = 8
  static let notePadding: CGFloat = 12
  static let noteCornerRadius: CGFloat = 8
}

fileprivate enum Strings {
  // You can translate your strings here
  static let back = String(localized: "Back", comment: "Button going back to the previous page")
  static let title = String(localized: "Enable Ghostery Privacy\nAd Block for Safari", comment: "Title in two lines. Ghostery Privacy Ad Block is the name of the extension.")
  static let enabledTitle = String(localized: "Ghostery Privacy Ad Block\nis enabled for Safari", comment: "Title in two lines. Ghostery Privacy Ad Block is the name of the extension.")
  static let stepsHeader = String(localized: "How to enable Ghostery")
  static let enableStepsHeader = String(localized: "How to enable Ghostery in Safari")
  static let disableStepsHeader = String(localized: "How to disable Ghostery in Safari")
  static let openSettings = String(localized: "Open Settings", comment: "Button opening the extension settings of Safari")
  static let uninstallWarning = String(localized: "Warning: The Uninstall option will remove the app from your entire system.\nDon’t use it if you want to keep using Ghostery in other browsers.", comment: "Uninstall is the name of the button in the extension settings of Safari")
  static let expanded = String(localized: "Expanded", comment: "State of a list of steps, for assistive technologies")
  static let collapsed = String(localized: "Collapsed", comment: "State of a list of steps, for assistive technologies")

  // The parts between ** are in bold
  static let openExtensionSettings = LocalizedStringResource("Open Safari extension **settings**.", comment: "Step of the instructions, with the part between ** in bold")
  static let selectCheckbox = LocalizedStringResource("Select the checkbox next to **Ghostery**.", comment: "Step of the instructions, with the part between ** in bold")
  static let allowOnEveryWebsite = LocalizedStringResource("Enable permission to **Always Allow on Every Website**.", comment: "Step of the instructions, with the part between ** in bold. Always Allow on Every Website is the name of the option in Safari.")
  static let uncheckCheckbox = LocalizedStringResource("Uncheck the checkbox next to **Ghostery** under Installed Apps.", comment: "Step of the instructions, with the part between ** in bold")
  static let goBack = LocalizedStringResource("Go back to this app.", comment: "Last step of the instructions")
}

struct SafariInstructionsView: View {
  /// Whether Ghostery is enabled in Safari, which shows how to disable it
  var isEnabled: Bool
  var onBack: () -> Void

  @State private var showsEnableSteps = false
  @State private var showsDisableSteps = true

  var body: some View {
    SectionScrollView {
      header
      if isEnabled {
        SafariInstructionsSection(title: Strings.enableStepsHeader, isExpanded: $showsEnableSteps) {
          enableSteps
        }
        SafariInstructionsSection(title: Strings.disableStepsHeader, isExpanded: $showsDisableSteps) {
          disableSteps
        }
        .padding(.top, Constants.stepsHeaderTopPadding)
      } else {
        Text(Strings.stepsHeader)
          .textStyle(.labelM)
          .foregroundColor(Colors.foregroundPrimary)
          .accessibilityAddTraits(.isHeader)
          .modifier(SafariInstructionsStepsHeaderPadding())
        enableSteps
      }
    } footer: {
      EmptyView()
    }
  }

  private var header: some View {
    HStack(spacing: Constants.headerSpacing) {
      VStack(alignment: .leading, spacing: Constants.headerSpacing) {
        Button(action: onBack) {
          HStack(spacing: 0) {
            Image(decorative: Icons.homeBack)
              .frame(width: Constants.backIconSize, height: Constants.backIconSize)
            Text(Strings.back)
              .textStyle(.labelM)
          }
          .contentShape(Rectangle())
        }
        .buttonStyle(.plain)

        if isEnabled {
          HStack(alignment: .top, spacing: Constants.enabledTitleSpacing) {
            Image(decorative: Icons.homeCheck)
              .frame(width: Constants.enabledIconSize, height: Constants.enabledIconSize)
              .background(Circle().fill(Colors.bgSuccessSecondary))
            SectionTitle(title: Strings.enabledTitle, style: .displayS)
          }
        } else {
          SectionTitle(title: Strings.title)
        }
      }
      .foregroundColor(Colors.foregroundPrimary)
      .frame(maxWidth: .infinity, alignment: .leading)

      Image(decorative: Icons.safariInstructionsHeader)
        .frame(width: Constants.headerImageWidth, height: Constants.headerImageHeight)
    }
    .padding(.top, Constants.headerTopPadding)
    .padding(.bottom, Constants.headerBottomPadding)
    .padding(.horizontal, Constants.headerHorizontalPadding)
  }

  private var enableSteps: some View {
    SafariEnableSteps()
      .padding(.horizontal, Constants.stepsHorizontalPadding)
  }

  private var disableSteps: some View {
    SafariInstructionsSteps {
      SafariInstructionsStep(number: 1, text: Strings.openExtensionSettings, action: (
        Strings.openSettings, SafariExtension.showSettings
      ))
      SafariInstructionsStep(number: 2, text: Strings.uncheckCheckbox, note: Strings.uninstallWarning)
      SafariInstructionsStep(number: 3, text: Strings.goBack)
    }
    .padding(.horizontal, Constants.stepsHorizontalPadding)
  }
}

/// Steps to enable the extension in Safari, also shown by the onboarding
struct SafariEnableSteps: View {
  var body: some View {
    SafariInstructionsSteps {
      SafariInstructionsStep(number: 1, text: Strings.openExtensionSettings, action: (
        Strings.openSettings, SafariExtension.showSettings
      ))
      SafariInstructionsStep(number: 2, text: Strings.selectCheckbox)
      SafariInstructionsStep(number: 3, text: Strings.allowOnEveryWebsite)
      SafariInstructionsStep(number: 4, text: Strings.goBack)
    }
  }
}

private struct SafariInstructionsStepsHeaderPadding: ViewModifier {
  func body(content: Content) -> some View {
    content
      .padding(.leading, Constants.stepsHeaderLeadingPadding)
      .padding(.trailing, Constants.stepsHeaderTrailingPadding)
      .padding(.bottom, Constants.stepsHeaderBottomPadding)
  }
}

/// Steps under a header, which shows or hides them
private struct SafariInstructionsSection<Steps: View>: View {
  let title: String
  @Binding var isExpanded: Bool
  @ViewBuilder var steps: Steps

  var body: some View {
    VStack(alignment: .leading, spacing: 0) {
      Button {
        isExpanded.toggle()
      } label: {
        HStack(spacing: Constants.stepsHeaderSpacing) {
          Text(title)
            .textStyle(.labelM)
            .foregroundColor(Colors.foregroundPrimary)
          Image(decorative: isExpanded ? Icons.homeChevronUp : Icons.homeChevronDown)
            .frame(width: Constants.chevronSize, height: Constants.chevronSize)
        }
        .contentShape(Rectangle())
      }
      .buttonStyle(.plain)
      .accessibilityAddTraits(.isHeader)
      .accessibilityValue(isExpanded ? Strings.expanded : Strings.collapsed)
      .modifier(SafariInstructionsStepsHeaderPadding())

      if isExpanded {
        steps
      }
    }
  }
}

private struct SafariInstructionsSteps<Content: View>: View {
  @ViewBuilder var content: Content

  var body: some View {
    VStack(spacing: Constants.stepsSpacing) {
      content
    }
  }
}

private struct SafariInstructionsStep: View {
  let number: Int
  /// The parts between ** are in bold
  let text: LocalizedStringResource
  var action: (title: String, perform: () -> Void)?
  /// Shown below the text of the step
  var note: String?

  var body: some View {
    HStack(spacing: Constants.stepSpacing) {
      // A step with a note is aligned to the top of its number
      HStack(alignment: note == nil ? .center : .top, spacing: Constants.stepSpacing) {
        Text(String(number))
          .textStyle(.headlineS)
          .foregroundColor(Colors.foregroundBrandPrimary)
          .frame(width: Constants.stepNumberSize, height: Constants.stepNumberSize)
          .background(Circle().fill(Colors.bgBrandSecondary))
        VStack(alignment: .leading, spacing: Constants.stepTextSpacing) {
          Text(text, boldFont: AppTextStyle.labelL.font)
            .textStyle(.bodyL)
            .foregroundColor(Colors.foregroundPrimary)
          if let note {
            Text(note)
              .textStyle(.bodyS)
              .foregroundColor(Colors.foregroundSecondary)
              .fixedSize(horizontal: false, vertical: true)
              .frame(maxWidth: .infinity, alignment: .leading)
              .padding(Constants.notePadding)
              .background(RoundedRectangle(cornerRadius: Constants.noteCornerRadius).fill(Colors.bgSecondary))
          }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
      }
      .accessibilityElement(children: .combine)

      if let action {
        Button(action: action.perform) {
          Text(action.title)
            .padding(.horizontal, Constants.stepButtonLabelPadding)
        }
        .buttonStyle(AppButtonStyle(kind: .primary))
        .fixedSize()
      }
    }
    .padding(Constants.stepPadding)
    .cardBackground(cornerRadius: Constants.stepCornerRadius)
  }
}

struct SafariInstructionsView_Previews: PreviewProvider {
  static var previews: some View {
    SafariInstructionsView(isEnabled: false, onBack: {})
      .frame(width: 736, height: 668)
    SafariInstructionsView(isEnabled: true, onBack: {})
      .frame(width: 736, height: 668)
  }
}
