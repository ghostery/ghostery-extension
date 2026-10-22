//
//  DonationView.swift
//  Ghostery
//
//  Donation options, opened from the Contribute section.
//

import SwiftUI

fileprivate enum Constants {
  static let headerTopPadding: CGFloat = 40
  static let headerBottomPadding: CGFloat = 16
  static let horizontalPadding: CGFloat = 40
  static let backIconSize: CGFloat = 16

  static let legalTopPadding: CGFloat = 10
  static let bottomPadding: CGFloat = 24
}

fileprivate enum Strings {
  // You can translate your strings here
  static let back = String(localized: "Back", comment: "Button going back to the previous page")
}

struct DonationView: View {
  var onBack: () -> Void

  var body: some View {
    SectionScrollView {
      header
      DonationOptions(layout: .mac, onDonated: onBack)
        .padding(.horizontal, Constants.horizontalPadding)
      DonationLegalLinks()
        .padding(.top, Constants.legalTopPadding)
        .padding(.bottom, Constants.bottomPadding)
    } footer: {
      EmptyView()
    }
  }

  private var header: some View {
    HStack {
      Button(action: onBack) {
        HStack(spacing: 0) {
          Image(decorative: Icons.homeBack)
            .frame(width: Constants.backIconSize, height: Constants.backIconSize)
          Text(Strings.back)
        }
        .contentShape(Rectangle())
      }
      Spacer()
      DonationRestoreButton()
    }
    .buttonStyle(.plain)
    .textStyle(.labelM)
    .foregroundColor(Colors.foregroundPrimary)
    .padding(.top, Constants.headerTopPadding)
    .padding(.bottom, Constants.headerBottomPadding)
    .padding(.horizontal, Constants.horizontalPadding)
  }
}

struct DonationView_Previews: PreviewProvider {
  static var previews: some View {
    DonationView(onBack: {})
      .environment(Donations())
      .frame(width: 736, height: 570)
  }
}
