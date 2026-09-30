//
//  DonationView.swift
//  Ghostery
//
//  Donation options, opened from the Contribute section.
//

import StoreKit
import SwiftUI

fileprivate enum Constants {
  static let headerTopPadding: CGFloat = 40
  static let headerBottomPadding: CGFloat = 16
  static let horizontalPadding: CGFloat = 40
  static let backIconSize: CGFloat = 16

  static let cardSpacing: CGFloat = 32
  static let cardHorizontalPadding: CGFloat = 64
  static let cardVerticalPadding: CGFloat = 40
  static let cardCornerRadius: CGFloat = 12

  static let textSpacing: CGFloat = 8
  static let titleWidth: CGFloat = 362
  static let descriptionWidth: CGFloat = 288

  static let periodsSpacing: CGFloat = 32
  static let periodsHorizontalPadding: CGFloat = 16
  static let periodsVerticalPadding: CGFloat = 8
  static let periodSpacing: CGFloat = 8
  static let radioSize: CGFloat = 16
  static let radioDotSize: CGFloat = 6
  static let radioShadowRadius: CGFloat = 8
  static let radioShadowY: CGFloat = 3

  static let amountsSpacing: CGFloat = 8
  static let amountPadding: CGFloat = 24
  static let amountCornerRadius: CGFloat = 12
  static let amountShadowRadius: CGFloat = 6
  static let amountShadowY: CGFloat = 4
  // Of an amount, so the card doesn't change its height while loading
  static let amountHeight: CGFloat = 72

  static let donateWidth: CGFloat = 274
  static let spinnerSize: CGFloat = 20
  static let spinnerLineWidth: CGFloat = 4
  static let spinnerLength: CGFloat = 0.6
  static let spinnerTurnDuration: TimeInterval = 0.8

  static let legalTopPadding: CGFloat = 10
  static let legalSpacing: CGFloat = 12
  static let bottomPadding: CGFloat = 24

  static let borderLineWidth: CGFloat = 1
}

fileprivate enum Strings {
  // You can translate your strings here
  static let back = "Back"
  static let restore = "Restore donation"
  static let title = "Choose the most convenient method to support Ghostery"
  static let description = "Support our mission and help us develop even stronger protection against trackers and ads, making the web safer for everyone."
  static let monthly = "Monthly"
  static let yearly = "Yearly donation"
  static let oneTime = "One-time donation"
  static let donate = "Donate"
  static let eula = "EULA"
  static let terms = "Terms of Use"
  static let privacy = "Privacy Policy"
  static let failedTitle = "Donation failed"
  static let failedMessage = "The App Store couldn’t complete the donation. Please try again later."
  static let ok = "OK"
}

fileprivate enum URLs {
  static let eula = URL(string: "https://www.ghostery.com/privacy/ghostery-subscription-plans-and-products-end-user-license-agreement")!
  static let terms = URL(string: "https://www.ghostery.com/privacy/extension-tos")!
  static let privacy = URL(string: "https://www.ghostery.com/privacy/policy")!
}

extension DonationPeriod {
  fileprivate var title: String {
    switch self {
    case .monthly: return Strings.monthly
    case .yearly: return Strings.yearly
    case .oneTime: return Strings.oneTime
    }
  }
}

struct DonationView: View {
  var onBack: () -> Void

  @Environment(Donations.self) private var donations
  @Environment(\.openURL) private var openURL

  @State private var period = DonationPeriod.monthly
  @State private var selectedProductID: Product.ID?
  @State private var showsFailure = false

  var body: some View {
    SectionScrollView {
      header
      card
        .padding(.horizontal, Constants.horizontalPadding)
      legal
        .padding(.top, Constants.legalTopPadding)
        .padding(.bottom, Constants.bottomPadding)
    } footer: {
      EmptyView()
    }
    .alert(Strings.failedTitle, isPresented: $showsFailure) {
      Button(Strings.ok, role: .cancel) {}
    } message: {
      Text(Strings.failedMessage)
    }
  }

  private var selectedProduct: Product? {
    donations.products(for: period).first { $0.id == selectedProductID }
      ?? donations.defaultProduct(for: period)
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
      Button(Strings.restore) {
        Task { await donations.restore() }
      }
      .disabled(donations.isRestoring)
    }
    .buttonStyle(.plain)
    .textStyle(.labelM)
    .foregroundColor(Colors.foregroundPrimary)
    .padding(.top, Constants.headerTopPadding)
    .padding(.bottom, Constants.headerBottomPadding)
    .padding(.horizontal, Constants.horizontalPadding)
  }

  private var card: some View {
    VStack(spacing: Constants.cardSpacing) {
      VStack(spacing: Constants.textSpacing) {
        Text(Strings.title)
          .textStyle(.displayS)
          .frame(width: Constants.titleWidth)
          .accessibilityAddTraits(.isHeader)
        Text(Strings.description)
          .textStyle(.bodyS)
          .frame(width: Constants.descriptionWidth)
      }
      .foregroundColor(Colors.foregroundPrimary)
      .multilineTextAlignment(.center)
      .fixedSize(horizontal: false, vertical: true)

      periods
      amounts

      Button {
        guard let product = selectedProduct else { return }
        Task { await donate(product) }
      } label: {
        if donations.isDonating {
          AppSpinner(
            color: Colors.foregroundOnBrand,
            lineWidth: Constants.spinnerLineWidth,
            length: Constants.spinnerLength,
            turnDuration: Constants.spinnerTurnDuration
          )
          .frame(width: Constants.spinnerSize, height: Constants.spinnerSize)
        } else {
          Text(Strings.donate)
        }
      }
      .buttonStyle(AppButtonStyle(kind: .primary))
      .frame(width: Constants.donateWidth)
      .disabled(selectedProduct == nil || donations.isDonating)
    }
    .padding(.horizontal, Constants.cardHorizontalPadding)
    .padding(.vertical, Constants.cardVerticalPadding)
    .frame(maxWidth: .infinity)
    .cardBackground(cornerRadius: Constants.cardCornerRadius)
  }

  private var periods: some View {
    HStack(spacing: Constants.periodsSpacing) {
      ForEach(DonationPeriod.allCases) { option in
        Button {
          period = option
          selectedProductID = nil
        } label: {
          HStack(spacing: Constants.periodSpacing) {
            DonationRadio(isSelected: period == option)
            Text(option.title)
              .textStyle(.labelM)
              .foregroundColor(Colors.foregroundPrimary)
          }
          .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityAddTraits(period == option ? .isSelected : [])
      }
    }
    .padding(.horizontal, Constants.periodsHorizontalPadding)
    .padding(.vertical, Constants.periodsVerticalPadding)
  }

  @ViewBuilder
  private var amounts: some View {
    let products = donations.products(for: period)

    if products.isEmpty {
      ProgressView()
        .controlSize(.small)
        .frame(height: Constants.amountHeight)
    } else {
      HStack(spacing: Constants.amountsSpacing) {
        ForEach(products) { product in
          Button(product.displayPrice) {
            selectedProductID = product.id
          }
          .buttonStyle(DonationAmountStyle(isSelected: product.id == selectedProduct?.id))
          .accessibilityAddTraits(product.id == selectedProduct?.id ? .isSelected : [])
        }
      }
    }
  }

  private var legal: some View {
    HStack(spacing: Constants.legalSpacing) {
      Button(Strings.eula) { openURL(URLs.eula) }
      legalSeparator
      Button(Strings.terms) { openURL(URLs.terms) }
      legalSeparator
      Button(Strings.privacy) { openURL(URLs.privacy) }
    }
    .buttonStyle(.plain)
    .textStyle(.labelM)
    .foregroundColor(Colors.foregroundPrimary)
    .frame(maxWidth: .infinity)
  }

  private var legalSeparator: some View {
    Text("•")
      .foregroundColor(Colors.foregroundQuaternary)
      .accessibilityHidden(true)
  }

  private func donate(_ product: Product) async {
    switch await donations.donate(product) {
    case .donated:
      onBack()
    case .failed:
      showsFailure = true
    case .pending, .cancelled:
      break
    }
  }
}

private struct DonationRadio: View {
  var isSelected: Bool

  var body: some View {
    if isSelected {
      Circle()
        .fill(Colors.foregroundBrandPrimary)
        .overlay(
          Circle()
            .fill(Colors.bgPrimary)
            .frame(width: Constants.radioDotSize, height: Constants.radioDotSize)
        )
        .frame(width: Constants.radioSize, height: Constants.radioSize)
    } else {
      Circle()
        .fill(Colors.bgPrimary)
        .shadow(color: Colors.shadowButton, radius: Constants.radioShadowRadius, y: Constants.radioShadowY)
        .overlay(Circle().strokeBorder(Colors.borderSecondary, lineWidth: Constants.borderLineWidth))
        .frame(width: Constants.radioSize, height: Constants.radioSize)
    }
  }
}

private struct DonationAmountStyle: ButtonStyle {
  var isSelected: Bool

  func makeBody(configuration: ButtonStyleConfiguration) -> some View {
    let shape = RoundedRectangle(cornerRadius: Constants.amountCornerRadius)

    configuration.label
      .textStyle(.displayS)
      .foregroundColor(isSelected ? Colors.foregroundBrandPrimary : Colors.foregroundPrimary)
      .lineLimit(1)
      .padding(Constants.amountPadding)
      .background(
        shape
          .fill(isSelected ? Colors.bgBrandPrimary : Colors.bgPrimary)
          .shadow(color: isSelected ? Colors.shadowCard : .clear, radius: Constants.amountShadowRadius, y: Constants.amountShadowY)
      )
      .overlay(
        shape.strokeBorder(isSelected ? Colors.borderBrandSolid : Colors.borderPrimary, lineWidth: Constants.borderLineWidth)
      )
      .contentShape(shape)
      .opacity(configuration.isPressed ? 0.8 : 1)
  }
}

struct DonationView_Previews: PreviewProvider {
  static var previews: some View {
    DonationView(onBack: {})
      .environment(Donations())
      .frame(width: 736, height: 570)
  }
}
