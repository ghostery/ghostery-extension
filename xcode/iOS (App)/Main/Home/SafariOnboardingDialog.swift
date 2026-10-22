//
//  SafariOnboardingDialog.swift
//  Ghostery
//
//  Dialogs shown when the app opens for the first time, with the steps to
//  enable the extension in Safari, and the confirmation once it's enabled.
//

import SwiftUI

fileprivate enum Constants {
  static let width: CGFloat = 480
  static let topPadding: CGFloat = 64
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
  static let title = String(localized: "Enable Ghostery Privacy\nAd Block for Safari", comment: "Title in two lines. Ghostery Privacy Ad Block is the name of the extension.")
  static let enabledTitle = String(localized: "Your Safari is protected with Ghostery")
  static let enabledDescription = String(localized: "Ghostery is actively blocking trackers, stopping annoying ads, and protecting your online privacy in the background.")
  static let done = String(localized: "Done", comment: "Button closing the dialog")
}

/// Sizes of the dialogs, which are larger on iPads
fileprivate struct SafariDialogLayout {
  var horizontalPadding: CGFloat
  var spacing: CGFloat
  var titleStyle: AppTextStyle
  var stepsBottomPadding: CGFloat
  /// Below the button closing the dialog, when it ends with it
  var buttonBottomPadding: CGFloat
  /// Of the texts of the confirmation, so they wrap as in the design
  var enabledTitleWidth: CGFloat
  var enabledDescriptionStyle: AppTextStyle
  var enabledDescriptionWidth: CGFloat

  static let phone = SafariDialogLayout(
    horizontalPadding: 16,
    spacing: 24,
    titleStyle: .headlineS,
    stepsBottomPadding: 16,
    buttonBottomPadding: 40,
    enabledTitleWidth: 239,
    enabledDescriptionStyle: .bodyM,
    enabledDescriptionWidth: 285
  )
  static let tablet = SafariDialogLayout(
    horizontalPadding: 40,
    spacing: 32,
    titleStyle: .headlineM,
    stepsBottomPadding: 64,
    buttonBottomPadding: 64,
    enabledTitleWidth: 285,
    enabledDescriptionStyle: .bodyL,
    enabledDescriptionWidth: 400
  )
}

extension SafariDialogLayout {
  /// The layout for the width of the window
  init(_ horizontalSizeClass: UserInterfaceSizeClass?) {
    self = horizontalSizeClass == .regular ? .tablet : .phone
  }
}

/// The steps to enable the extension, replaced with the confirmation
/// as soon as the extension is enabled
struct SafariOnboardingDialog: View {
  var onClose: () -> Void
  var onEnabled: () -> Void

  private let safari = SafariExtension.shared
  @Environment(\.horizontalSizeClass) private var horizontalSizeClass

  var body: some View {
    let layout = SafariDialogLayout(horizontalSizeClass)
    // Without the state, the app can't tell when the extension is enabled,
    // so the dialog ends with the button closing it, instead of skipping it
    let isStateAvailable = SafariExtension.isStateAvailable

    AppDialog(width: Constants.width, closeTitle: Strings.skip, onClose: isStateAvailable ? onClose : nil) {
      VStack(spacing: layout.spacing) {
        Image(decorative: Icons.safariOnboarding)
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

        // As small as on iPhones also on iPads, to fit in the dialog
        SafariEnableSteps(layout: .phone)

        if !isStateAvailable {
          DoneButton(action: onClose)
        }
      }
      .padding(.top, Constants.topPadding)
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

  @Environment(\.horizontalSizeClass) private var horizontalSizeClass

  var body: some View {
    let layout = SafariDialogLayout(horizontalSizeClass)

    AppDialog(width: Constants.width, onClose: onClose) {
      VStack(spacing: layout.spacing) {
        // The image includes the shadow below the circle
        Image(decorative: Icons.safariOnboardingEnabled)
          .frame(width: Constants.imageSize, height: Constants.imageSize, alignment: .top)

        VStack(spacing: Constants.enabledTextSpacing) {
          Text(Strings.enabledTitle)
            .textStyle(layout.titleStyle)
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
      .padding(.top, Constants.topPadding)
      .padding(.bottom, layout.buttonBottomPadding)
      .padding(.horizontal, layout.horizontalPadding)
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

struct SafariOnboardingDialog_Previews: PreviewProvider {
  static var previews: some View {
    SafariOnboardingDialog(onClose: {}, onEnabled: {})
      .padding(16)
    SafariEnabledDialog(onClose: {})
      .padding(16)
  }
}
