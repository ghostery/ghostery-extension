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
}

fileprivate enum Strings {
  // You can translate your strings here
  static let enabledTitle = String(localized: "Ghostery Privacy Ad Block\nis enabled for Safari", comment: "Title in two lines. Ghostery Privacy Ad Block is the name of the extension.")
  static let enableStepsHeader = String(localized: "How to enable Ghostery in Safari")
  static let disableStepsHeader = String(localized: "How to disable Ghostery in Safari")
  static let uninstallWarning = String(localized: "Warning: The Uninstall option will remove the app from your entire system.\nDon’t use it if you want to keep using Ghostery in other browsers.", comment: "Uninstall is the name of the button in the extension settings of Safari")
  static let expanded = String(localized: "Expanded", comment: "State of a list of steps, for assistive technologies")
  static let collapsed = String(localized: "Collapsed", comment: "State of a list of steps, for assistive technologies")

  // The part between ** is in bold
  static let uncheckCheckbox = LocalizedStringResource("Uncheck the checkbox next to **Ghostery** under Installed Apps.", comment: "Step of the instructions, with the part between ** in bold")
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
        Text(SectionStrings.SafariInstructions.stepsHeader)
          .textStyle(.labelM)
          .foregroundColor(Colors.foregroundPrimary)
          .accessibilityAddTraits(.isHeader)
          .modifier(SafariInstructionsStepsHeaderPadding())
        enableSteps
      }
    }
  }

  private var header: some View {
    HStack(spacing: Constants.headerSpacing) {
      VStack(alignment: .leading, spacing: Constants.headerSpacing) {
        SectionBackButton(style: .labelM, action: onBack)

        if isEnabled {
          HStack(alignment: .top, spacing: Constants.enabledTitleSpacing) {
            Image(.homeCheck)
              .accessibilityHidden(true)
              .frame(width: Constants.enabledIconSize, height: Constants.enabledIconSize)
              .background(Circle().fill(Colors.bgSuccessSecondary))
            SectionTitle(title: Strings.enabledTitle, style: .displayS)
          }
        } else {
          SectionTitle(title: SectionStrings.SafariInstructions.title)
        }
      }
      .foregroundColor(Colors.foregroundPrimary)
      .frame(maxWidth: .infinity, alignment: .leading)

      Image(.safariInstructionsHeader)
        .accessibilityHidden(true)
        .frame(width: Constants.headerImageWidth, height: Constants.headerImageHeight)
    }
    .padding(.top, Constants.headerTopPadding)
    .padding(.bottom, Constants.headerBottomPadding)
    .padding(.horizontal, Constants.headerHorizontalPadding)
  }

  private var enableSteps: some View {
    SafariEnableSteps(layout: .mac)
      .sectionContentPadding()
  }

  private var disableSteps: some View {
    VStack(spacing: Constants.stepsSpacing) {
      SafariOpenSettingsStep(layout: .mac)
      SafariInstructionsStep(
        number: 2,
        text: Text(Strings.uncheckCheckbox, boldFont: AppTextStyle.labelL.font),
        note: Strings.uninstallWarning,
        layout: .mac
      )
      SafariReturnStep(number: 3, layout: .mac)
    }
    .sectionContentPadding()
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
          Image(isExpanded ? ImageResource.homeChevronUp : .homeChevronDown)
            .accessibilityHidden(true)
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

#Preview("Disabled") {
  SafariInstructionsView(isEnabled: false, onBack: {})
    .frame(width: 736, height: 668)
}

#Preview("Enabled") {
  SafariInstructionsView(isEnabled: true, onBack: {})
    .frame(width: 736, height: 668)
}
