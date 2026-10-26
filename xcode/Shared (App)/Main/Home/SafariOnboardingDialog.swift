//
//  SafariOnboardingDialog.swift
//  Ghostery
//
//  Dialogs shown when the app opens for the first time, with the steps to
//  enable the extension in Safari, and the confirmation once it's enabled.
//

import SwiftUI

fileprivate enum Constants {
  static let imageSize: CGFloat = 80
  // Centers the ghost, as its image includes the shadow below it
  static let stepsImageOffset: CGFloat = 4

  // The spinner is over the ring in the ghost's image
  static let spinnerSize: CGFloat = 24
  static let spinnerPosition = CGPoint(x: 25, y: 17)
  static let spinnerLineWidth: CGFloat = 3
  static let spinnerLength: CGFloat = 0.37
  static let spinnerTurnDuration: TimeInterval = 2

  static let enabledTextSpacing: CGFloat = 8
  static let doneButtonWidth: CGFloat = 120
}

fileprivate enum Strings {
  // You can translate your strings here
  static let skip = String(localized: "Skip", comment: "Button closing the steps to enable the extension")
  #if os(macOS)
  static let title = String(localized: "Enable Ghostery Privacy Ad Block for Safari", comment: "Ghostery Privacy Ad Block is the name of the extension")
  #else
  static let title = SectionStrings.SafariInstructions.title
  #endif
  static let enabledTitle = String(localized: "Your Safari is protected with Ghostery")
  static let enabledDescription = String(localized: "Ghostery is actively blocking trackers, stopping annoying ads, and protecting your online privacy in the background.")
  static let done = String(localized: "Done", comment: "Button closing the dialog")
}

/// Sizes of the dialogs, which differ between the Mac, iPhones and iPads
fileprivate struct SafariDialogLayout: PlatformLayout {
  var width: CGFloat
  var horizontalPadding: CGFloat
  var spacing: CGFloat
  var titleStyle: AppTextStyle
  /// Of the steps, which are as small as on iPhones also on iPads, to fit
  /// in the dialog
  var steps: SafariStepLayout
  var stepsTopPadding: CGFloat
  var stepsBottomPadding: CGFloat
  /// Below the button closing the dialog, when it ends with it
  var buttonBottomPadding: CGFloat
  var enabledTopPadding: CGFloat
  var enabledHorizontalPadding: CGFloat
  var enabledTitleStyle: AppTextStyle
  /// Of the texts of the confirmation, so they wrap as in the design
  var enabledTitleWidth: CGFloat
  var enabledDescriptionStyle: AppTextStyle
  var enabledDescriptionWidth: CGFloat

  #if os(macOS)
  static let mac = SafariDialogLayout(
    width: 560,
    horizontalPadding: 40,
    spacing: 24,
    titleStyle: .headlineS,
    steps: .mac,
    stepsTopPadding: 39,
    stepsBottomPadding: 40,
    buttonBottomPadding: 81,
    enabledTopPadding: 79,
    enabledHorizontalPadding: 0,
    enabledTitleStyle: .displayS,
    enabledTitleWidth: 280,
    enabledDescriptionStyle: .bodyM,
    enabledDescriptionWidth: 394
  )
  #else
  static let phone = SafariDialogLayout(
    width: 480,
    horizontalPadding: 16,
    spacing: 24,
    titleStyle: .headlineS,
    steps: .phone,
    stepsTopPadding: 64,
    stepsBottomPadding: 16,
    buttonBottomPadding: 40,
    enabledTopPadding: 64,
    enabledHorizontalPadding: 16,
    enabledTitleStyle: .headlineS,
    enabledTitleWidth: 239,
    enabledDescriptionStyle: .bodyM,
    enabledDescriptionWidth: 285
  )
  static let tablet = SafariDialogLayout(
    width: 480,
    horizontalPadding: 40,
    spacing: 32,
    titleStyle: .headlineM,
    steps: .phone,
    stepsTopPadding: 64,
    stepsBottomPadding: 64,
    buttonBottomPadding: 64,
    enabledTopPadding: 64,
    enabledHorizontalPadding: 40,
    enabledTitleStyle: .headlineM,
    enabledTitleWidth: 285,
    enabledDescriptionStyle: .bodyL,
    enabledDescriptionWidth: 400
  )
  #endif
}

/// The steps to enable the extension, replaced with the confirmation
/// as soon as the extension is enabled
struct SafariOnboardingDialog: View {
  var onClose: () -> Void
  var onEnabled: () -> Void

  @CurrentLayout private var layout: SafariDialogLayout
  private var safari: SafariExtension { .shared }

  var body: some View {
    let layout = self.layout
    // Without the state, the app can't tell when the extension is enabled,
    // so the dialog ends with the button closing it, instead of skipping it
    let isStateAvailable = SafariExtension.isStateAvailable

    AppDialog(width: layout.width, closeTitle: Strings.skip, onClose: isStateAvailable ? onClose : nil) {
      VStack(spacing: layout.spacing) {
        Image(.safariOnboarding)
          .accessibilityHidden(true)
          .overlay(alignment: .topLeading) {
            AppSpinner(
              color: Colors.bgBrandSolid,
              lineWidth: Constants.spinnerLineWidth,
              length: Constants.spinnerLength,
              turnDuration: Constants.spinnerTurnDuration
            )
            .frame(width: Constants.spinnerSize, height: Constants.spinnerSize)
            .offset(x: Constants.spinnerPosition.x, y: Constants.spinnerPosition.y)
          }
          .offset(y: Constants.stepsImageOffset)
          .frame(width: Constants.imageSize, height: Constants.imageSize)
          .background(Circle().fill(Colors.bgBrandSecondary))

        Text(Strings.title)
          .textStyle(layout.titleStyle)
          .foregroundColor(Colors.foregroundPrimary)
          .multilineTextAlignment(.center)
          .fixedSize(horizontal: false, vertical: true)
          .accessibilityAddTraits(.isHeader)

        SafariEnableSteps(layout: layout.steps)

        if !isStateAvailable {
          DoneButton(action: onClose)
        }
      }
      .padding(.top, layout.stepsTopPadding)
      .padding(.bottom, isStateAvailable ? layout.stepsBottomPadding : layout.buttonBottomPadding)
      .padding(.horizontal, layout.horizontalPadding)
    }
    .task { await safari.monitor() }
    .onChange(of: safari.isEnabled) {
      if safari.isEnabled {
        onEnabled()
      }
    }
  }
}

struct SafariEnabledDialog: View {
  var onClose: () -> Void

  @CurrentLayout private var layout: SafariDialogLayout

  var body: some View {
    let layout = self.layout

    AppDialog(width: layout.width, onClose: onClose) {
      VStack(spacing: layout.spacing) {
        // The image includes the shadow below the circle
        Image(.safariOnboardingEnabled)
          .accessibilityHidden(true)
          .frame(width: Constants.imageSize, height: Constants.imageSize, alignment: .top)

        VStack(spacing: Constants.enabledTextSpacing) {
          Text(Strings.enabledTitle)
            .textStyle(layout.enabledTitleStyle)
            .foregroundColor(Colors.foregroundPrimary)
            .frame(maxWidth: layout.enabledTitleWidth)
            .accessibilityAddTraits(.isHeader)
          Text(Strings.enabledDescription)
            .textStyle(layout.enabledDescriptionStyle)
            .foregroundColor(Colors.foregroundSecondary)
            .frame(maxWidth: layout.enabledDescriptionWidth)
        }
        .multilineTextAlignment(.center)
        .fixedSize(horizontal: false, vertical: true)

        DoneButton(action: onClose)
      }
      .frame(maxWidth: .infinity)
      .padding(.top, layout.enabledTopPadding)
      .padding(.bottom, layout.buttonBottomPadding)
      .padding(.horizontal, layout.enabledHorizontalPadding)
    }
  }
}

private struct DoneButton: View {
  var action: () -> Void

  var body: some View {
    Button(Strings.done, action: action)
      .buttonStyle(AppButtonStyle(kind: .primary, size: .large))
      .frame(width: Constants.doneButtonWidth)
  }
}

#Preview("Onboarding") {
  SafariOnboardingDialog(onClose: {}, onEnabled: {})
    .padding(40)
}

#Preview("Enabled") {
  SafariEnabledDialog(onClose: {})
    .padding(40)
}
