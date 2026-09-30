//
//  SafariOnboardingDialog.swift
//  Ghostery
//
//  Dialogs shown when the app opens for the first time, with the steps to
//  enable the extension in Safari, and the confirmation once it's enabled.
//

import SwiftUI

fileprivate enum Constants {
  static let width: CGFloat = 560
  static let spacing: CGFloat = 24
  static let horizontalPadding: CGFloat = 40
  static let imageSize: CGFloat = 80

  static let stepsTopPadding: CGFloat = 39
  static let stepsBottomPadding: CGFloat = 40
  // Centers the ghost, as its image includes the shadow below it
  static let stepsImageOffset: CGFloat = 4

  // The spinner is over the ring in the ghost's image
  static let spinnerSize: CGFloat = 24
  static let spinnerPosition = CGPoint(x: 25, y: 17)
  static let spinnerLineWidth: CGFloat = 3
  static let spinnerLength: CGFloat = 0.37
  static let spinnerTurnDuration: TimeInterval = 2

  static let enabledTopPadding: CGFloat = 79
  static let enabledBottomPadding: CGFloat = 81
  static let enabledTextSpacing: CGFloat = 8
  static let enabledTitleWidth: CGFloat = 280
  static let enabledDescriptionWidth: CGFloat = 394
  static let doneButtonWidth: CGFloat = 120
}

fileprivate enum Strings {
  // You can translate your strings here
  static let skip = "Skip"
  static let title = "Enable Ghostery Privacy Ad Block for Safari"
  static let enabledTitle = "Your Safari is protected with Ghostery"
  static let enabledDescription = "Ghostery is actively blocking trackers, stopping annoying ads, and protecting your online privacy in the background."
  static let done = "Done"
}

/// The steps to enable the extension, replaced with the confirmation
/// as soon as the extension is enabled
struct SafariOnboardingDialog: View {
  var onClose: () -> Void
  var onEnabled: () -> Void

  private let safari = SafariExtension.shared

  var body: some View {
    AppDialog(width: Constants.width, closeTitle: Strings.skip, onClose: onClose) {
      VStack(spacing: Constants.spacing) {
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
          .textStyle(.headlineS)
          .foregroundColor(Colors.foregroundPrimary)
          .multilineTextAlignment(.center)
          .fixedSize(horizontal: false, vertical: true)
          .accessibilityAddTraits(.isHeader)

        SafariEnableSteps()
      }
      .padding(.top, Constants.stepsTopPadding)
      .padding(.bottom, Constants.stepsBottomPadding)
      .padding(.horizontal, Constants.horizontalPadding)
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

  var body: some View {
    AppDialog(width: Constants.width, onClose: onClose) {
      VStack(spacing: Constants.spacing) {
        // The image includes the shadow below the circle
        Image(decorative: Icons.safariOnboardingEnabled)
          .frame(width: Constants.imageSize, height: Constants.imageSize, alignment: .top)

        VStack(spacing: Constants.enabledTextSpacing) {
          Text(Strings.enabledTitle)
            .textStyle(.displayS)
            .foregroundColor(Colors.foregroundPrimary)
            .frame(width: Constants.enabledTitleWidth)
            .accessibilityAddTraits(.isHeader)
          Text(Strings.enabledDescription)
            .textStyle(.bodyM)
            .foregroundColor(Colors.foregroundSecondary)
            .frame(width: Constants.enabledDescriptionWidth)
        }
        .multilineTextAlignment(.center)
        .fixedSize(horizontal: false, vertical: true)

        Button(Strings.done, action: onClose)
          .buttonStyle(AppButtonStyle(kind: .primary, size: .large))
          .frame(width: Constants.doneButtonWidth)
      }
      .frame(maxWidth: .infinity)
      .padding(.top, Constants.enabledTopPadding)
      .padding(.bottom, Constants.enabledBottomPadding)
    }
  }
}

struct SafariOnboardingDialog_Previews: PreviewProvider {
  static var previews: some View {
    SafariOnboardingDialog(onClose: {}, onEnabled: {})
      .padding(40)
    SafariEnabledDialog(onClose: {})
      .padding(40)
  }
}
