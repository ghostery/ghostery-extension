//
//  DialogHost.swift
//  Ghostery
//
//  Dialogs shown over the sections of the app, one at a time, which the
//  root views of both apps present the same way.
//

import SwiftUI

fileprivate enum Constants {
  static let blurRadius: CGFloat = 8
  static let backdropOpacity: Double = 0.5
  static let animationDuration: Double = 0.2
  #if os(macOS)
  static let margin: CGFloat = 17
  #else
  static let margin: CGFloat = 16
  #endif
}

fileprivate enum Keys {
  // Whether the app checked if it should show the onboarding, which it does
  // only when it opens for the first time
  static let safariOnboardingChecked = "MainView.safariOnboardingChecked"
}

/// Dialog shown over the sections, if any
@MainActor
@Observable
final class DialogPresenter {
  private(set) var dialog: MainDialog?

  func show(_ dialog: MainDialog) {
    withAnimation(.easeOut(duration: Constants.animationDuration)) {
      self.dialog = dialog
    }
  }

  func close() {
    withAnimation(.easeOut(duration: Constants.animationDuration)) {
      dialog = nil
    }
  }

  /// Closes the dialog at once, like when a link to the app shows a section
  func dismiss() {
    dialog = nil
  }

  /// Shows the steps to enable the extension, unless it's enabled already.
  /// When Safari can't tell, it's checked again the next time.
  func showSafariOnboardingIfNeeded() async {
    // The launch arguments of Debug builds can choose another dialog, or none
    if DebugLaunch.choosesDialog {
      if let dialog = DebugLaunch.dialog {
        show(dialog)
      }
      return
    }
    #if DEBUG
    // Debug builds show it on every launch, to make working on it easier
    let isChecked = false
    #else
    let isChecked = UserDefaults.standard.bool(forKey: Keys.safariOnboardingChecked)
    #endif
    guard !isChecked, let isEnabled = await safariExtensionState() else { return }

    UserDefaults.standard.set(true, forKey: Keys.safariOnboardingChecked)
    if !isEnabled {
      show(.safariOnboarding)
    }
  }

  // When Safari doesn't tell the state, as before iOS 26.2, the extension is
  // taken as disabled, so the steps are shown once
  private func safariExtensionState() async -> Bool? {
    guard SafariExtension.isStateAvailable else { return false }
    return await SafariExtension.shared.refresh()
  }
}

extension View {
  /// Covers the view with the dialog of the presenter, over a frosted
  /// backdrop which closes it when clicked. The dialog is centered in the
  /// view and the bar above it, as long as it stays below the bar.
  func dialogHost(_ presenter: DialogPresenter, barHeight: CGFloat = 0) -> some View {
    modifier(DialogHost(presenter: presenter, barHeight: barHeight))
  }
}

private struct DialogHost: ViewModifier {
  let presenter: DialogPresenter
  var barHeight: CGFloat

  @Environment(\.openURL) private var openURL

  func body(content: Content) -> some View {
    let isCovered = presenter.dialog != nil

    content
      .disabled(isCovered)
      .accessibilityHidden(isCovered)
      .blur(radius: isCovered ? Constants.blurRadius : 0)
      .overlay {
        if let dialog = presenter.dialog {
          dialogView(dialog)
        }
      }
      // For the buttons of the sections and of the dialogs
      .environment(\.performAction, PerformAction(showDialog: presenter.show, openURL: openURL))
  }

  private func dialogView(_ dialog: MainDialog) -> some View {
    ZStack {
      Colors.bgPrimary
        .opacity(Constants.backdropOpacity)
        #if os(iOS)
        .ignoresSafeArea()
        #endif
        .contentShape(Rectangle())
        .onTapGesture { presenter.close() }
        .accessibilityHidden(true)
      DialogLayout(barHeight: barHeight) {
        MainDialogView(dialog: dialog, onShow: presenter.show, onClose: presenter.close)
          .padding(Constants.margin)
          #if os(iOS)
          // The escape gesture of VoiceOver closes it
          .accessibilityAction(.escape) { presenter.close() }
          #endif
      }
    }
    .transition(.opacity)
  }
}

private struct MainDialogView: View {
  let dialog: MainDialog
  var onShow: (MainDialog) -> Void
  var onClose: () -> Void

  var body: some View {
    switch dialog {
    case .support:
      SupportDialog(onClose: onClose)
    case .otherDevice:
      OtherDeviceDialog(onClose: onClose)
    case .spreadTheWord:
      SpreadTheWordDialog(onClose: onClose)
    case .safariOnboarding:
      SafariOnboardingDialog(onClose: onClose, onEnabled: { onShow(.safariEnabled) })
    case .safariEnabled:
      SafariEnabledDialog(onClose: onClose)
    }
  }
}

/// Centers a dialog in the space of the covered view and the bar above it,
/// like the title bar of the window on the Mac, as long as it stays below
/// the bar
private struct DialogLayout: Layout {
  var barHeight: CGFloat

  func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
    proposal.replacingUnspecifiedDimensions()
  }

  func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
    guard let dialog = subviews.first else { return }
    let size = dialog.sizeThatFits(ProposedViewSize(bounds.size))
    let top = max(bounds.midY - barHeight / 2 - size.height / 2, bounds.minY)
    dialog.place(at: CGPoint(x: bounds.midX, y: top), anchor: .top, proposal: ProposedViewSize(size))
  }
}
