//
//  ContentView.swift
//  Ghostery
//
//  Created by Palade Timotei on 14.04.25.
//

import SwiftUI

fileprivate enum Constants {
    static let horizontalPadding: CGFloat = 16
    static let cornerRadius: CGFloat = 16
    static let noSpacing: CGFloat = .zero
    
    static let headerWidth: CGFloat = 215
    static let headerHeight: CGFloat = 32
    static let headerMaxPadding: CGFloat = 64
    static let headerMinPadding: CGFloat = 12
    static let headerVerticalPadding: CGFloat = 32

    static let instructionsCardHeight: CGFloat = 484
    static let instructionsCardWidth: CGFloat = 343
    static let instructionsCardShadowRadius: CGFloat = 24
    static let instructionsCardShadowX: CGFloat = 0
    static let instructionsCardShadowY: CGFloat = 0
    static let instructionsCardPadding: CGFloat = 16
    static let instructionsHeaderWidth: CGFloat = 220
    static let instructionsIconWidth: CGFloat = 18
    static let instructionsSpacerMinWidth: CGFloat = 16
    
    static let dividerHeight: CGFloat = 1
    
    static let donateButtonHeight: CGFloat = 48
    
    static let containerWidth: CGFloat = 375
    static let containerHeight: CGFloat = 640
    static let containerBottomPadding: CGFloat = 12
  
    static let donationOverlayVerticalSpacing: CGFloat = 24
    static let donationOverlayTextVerticalSpacing: CGFloat = 4
    static let donationOverlayDonationButtonsVerticalSpacing: CGFloat = 16
  

}

fileprivate enum Strings {
    // You can translate your strings here
    static let headerTitle = "Become a Contributor"
    static let description = "Support our mission and help us develop even stronger protection against trackers and ads, making the web safer for everyone."
    static let eula = "EULA"
    static let terms = "Terms of Use"
    static let policy = "Privacy Policy"
    static let restoreDonation = "Restore donation"
    static let donationTilte = "Select the most convenient method for your support"
    static let monthlyDonation = "Monthly Donation"
    static let yearlyDonation = "Yearly Donation"
    static let oneTimeDonation = "One-Time Donation"
    static let donationOverlayMonthlyTitle = "Choose your monthly donation amount"
    static let donationOverlayYearlyTitle = "Choose your yearly donation amount"
    static let donationOverlayOneTimeTitle = "Choose your one-time donation amount"
    static let donationOverlaySubtitle = "You can cancel anytime."
    static let donate = "Donate"
    static let perMonth = "per month"
    static let perYear = "per year"
    static let singleDonation = "Single donation"
}

struct DonationPlan {
  let id: String
  let price: String
  let recurrence: String
}

struct ContributeView: View {
    @State var theme = Theme.light
    @State private var showOverlay = false
    @State private var showDonationOverlayHeaderSubtitle = true
    @State private var donationOverlayTitle: String = ""
  
    @State var donationPlans: [DonationPlan] = []
    
    var donateButtonPressed: () -> Void
    var stepByStepButtonPressed: () -> Void
    var eulaPressed: () -> Void
    var termsPressed: () -> Void
    var policyPressed: () -> Void
    var backPressed: () -> Void
      
    var body: some View {
      ZStack(alignment: .bottom) {
        VStack(alignment: .center, spacing: Constants.noSpacing) {
            card
        }
        .padding(.horizontal, Constants.horizontalPadding)
        .padding(.bottom, Constants.containerBottomPadding)
        .frame(maxWidth: Constants.containerWidth)
        .frame(maxHeight: Constants.containerHeight)
        .sheet(isPresented: $showOverlay) {
          donationPlansOverlay
            .presentationDetents([.height(381)])
        }
      }
    }
    
    var card: some View {
        VStack(alignment: .center, spacing: Constants.noSpacing) {
            header
            Spacer(minLength: Constants.instructionsSpacerMinWidth)
            headerImage
            Spacer(minLength: Constants.instructionsSpacerMinWidth)
            description
            Spacer(minLength: Constants.instructionsSpacerMinWidth)
            donationBox
            divider
            legal
            restoreDonation
        }
        .padding(Constants.instructionsCardPadding)
        .frame(height: Constants.containerHeight)
        .frame(maxWidth: Constants.instructionsCardWidth)
        .background(theme == .light ? Colors.lightBGColor : Colors.darkBGColor)
        .clipShape(RoundedRectangle(cornerRadius: Constants.cornerRadius))
        .shadow(color: Colors.shadowColor, radius: Constants.instructionsCardShadowRadius, x: Constants.instructionsCardShadowX, y: Constants.instructionsCardShadowY)
    }
    
    var header: some View {
      ZStack(alignment: .center) {
        Text(Strings.headerTitle)
            .font(Fonts.subheadline)
            .multilineTextAlignment(.center)
            .foregroundStyle(Colors.foregroundPrimary)
            .frame(maxWidth: .infinity)
        HStack(alignment: .center, spacing: Constants.noSpacing) {
          Button {
              backPressed()
          } label: {
            HStack(alignment: .center, spacing: Constants.noSpacing) {
              Image(systemName: "chevron.backward")
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(Colors.foregroundBrandPrimary)
              Text("Back")
                .font(Fonts.title)
                .foregroundStyle(Colors.foregroundBrandPrimary)
                .padding(.leading, 2)
            }
          }
          Spacer()
        }
      }
    }
  
    var headerImage: some View {
        Image(Icons.contributeIllustration)
            .resizable()
            .scaledToFit()
            .frame(width: 300, height: 144)
    }
  
    var description: some View {
        Text(Strings.description)
            .font(Fonts.description)
            .multilineTextAlignment(.center)
            .foregroundStyle(Colors.foregroundPrimary)
            .frame(maxWidth: .infinity)
            .lineSpacing(4)
    }
    
    var donationBox: some View {
        VStack(alignment: .center, spacing: 16) {
          Text(Strings.donationTilte)
            .font(Fonts.text)
            .foregroundStyle(Colors.foregroundPrimary)
            .multilineTextAlignment(.center)
            .frame(maxWidth: .infinity)
          
          donationPeriodButton(title: Strings.monthlyDonation, action: {
            withAnimation {
              Task { @MainActor in
                donationPlans = [
                  .init(id: "1", price: "$1.99", recurrence: Strings.perMonth),
                  .init(id: "2", price: "$4.99", recurrence: Strings.perMonth),
                  .init(id: "3", price: "$11.99", recurrence: Strings.perMonth)
                ]
                
                donationOverlayTitle = Strings.donationOverlayMonthlyTitle
              }
              showDonationOverlayHeaderSubtitle = true
              showOverlay = true
            }
          })
          donationPeriodButton(title: Strings.yearlyDonation, action: {
            withAnimation {
              Task { @MainActor in
                donationPlans = [
                  .init(id: "1", price: "$23.90", recurrence: Strings.perYear),
                  .init(id: "2", price: "$59.90", recurrence: Strings.perYear),
                  .init(id: "3", price: "$143.90", recurrence: Strings.perYear)
                ]
                
                donationOverlayTitle = Strings.donationOverlayYearlyTitle
              }
              showDonationOverlayHeaderSubtitle = true
              showOverlay = true
            }
          })
          donationPeriodButton(title: Strings.oneTimeDonation, action: {
            withAnimation {
              Task { @MainActor in
                donationPlans = [
                  .init(id: "1", price: "$5", recurrence: Strings.singleDonation),
                  .init(id: "2", price: "$10", recurrence: Strings.singleDonation),
                  .init(id: "3", price: "$15", recurrence: Strings.singleDonation)
                ]
                
                donationOverlayTitle = Strings.donationOverlayOneTimeTitle
              }
              showDonationOverlayHeaderSubtitle = false
              showOverlay = true
            }
          })
        }
        .padding(8)
        .frame(width: 311, height: 240)
        .background(Colors.bgBrandPrimary)
        .clipShape(RoundedRectangle(cornerRadius: Constants.cornerRadius))
    }
    
    
    var divider: some View {
        Rectangle()
            .fill(Colors.dividerGray)
            .frame(height: Constants.dividerHeight)
            .padding(.vertical, 16)
    }
  
    var legal: some View {
        HStack(alignment: .center, spacing: Constants.noSpacing) {
            Spacer()
            Text(Strings.eula)
              .modifier(LegalText(action: eulaPressed))
            Spacer()
            Text(Strings.terms)
              .modifier(LegalText(action: termsPressed))
            Spacer()
            Text(Strings.policy)
              .modifier(LegalText(action: policyPressed))
            Spacer()
        }
    }
  
    var restoreDonation: some View {
        Text(Strings.restoreDonation)
            .font(.footnote)
            .foregroundStyle(Colors.foregroundBrandPrimary)
            .padding(.top, 12)
    }
    
    func donationPeriodButton(title: String, action: @escaping () -> Void) -> some View {
        Button {
          action()
        } label: {
            Text(title)
                .frame(height: Constants.donateButtonHeight)
                .frame(maxWidth: .infinity)
                .modifier(GhosteryOutlinedButtonModifier())
        }
    }
  
  var donationPlansOverlay: some View {
      VStack(alignment: .center, spacing: Constants.noSpacing) {
        Capsule()
          .frame(width: 48, height: 5)
          .background(Colors.labelsTertiary)
          .opacity(0.3)
          .padding(.top, 8)
        Spacer()
        donationOverlayContents
        Spacer()
      }
      .padding(.horizontal, Constants.horizontalPadding)
    }
  
  var donationOverlayContents: some View {
    VStack(alignment:.center, spacing: Constants.donationOverlayVerticalSpacing) {
      donationOverlayHeader
      donationOverlayPlanButtons
      donateSolidButton(title: Strings.donate, action: {})
    }
  }
  
  var donationOverlayHeader: some View {
    VStack(alignment:.center, spacing: Constants.donationOverlayTextVerticalSpacing) {
      Text(donationOverlayTitle)
        .font(Fonts.subheadline)
        .foregroundStyle(Colors.foregroundPrimary)
      if showDonationOverlayHeaderSubtitle {
        Text(Strings.donationOverlaySubtitle)
          .font(Fonts.footnote)
          .foregroundStyle(Colors.foregroundSecondary)
      }
    }
  }
  
  var donationOverlayPlanButtons: some View {
    VStack(alignment:.center, spacing: Constants.donationOverlayDonationButtonsVerticalSpacing) {
      ForEach(donationPlans, id: \.id) { plan in
        donationAmountButton(title: plan.price, subtitle: plan.recurrence, action: {})
      }
    }
  }
  
  func donationAmountButton(title: String, subtitle: String, action: @escaping () -> Void) -> some View {
      Button {
        action()
      } label: {
        VStack(alignment: .center, spacing: Constants.noSpacing) {
          Text(title)
          Text(subtitle)
            .font(Fonts.buttonFootnote)
            .foregroundStyle(Colors.foregroungTertiary)
        }
        .frame(height: Constants.donateButtonHeight)
        .frame(maxWidth: .infinity)
        .modifier(GhosteryOutlinedButtonModifier())
      }
  }
  
  func donateSolidButton(title: String, action: @escaping () -> Void) -> some View {
      Button {
        action()
      } label: {
        VStack(alignment: .center, spacing: Constants.noSpacing) {
          Text(title)
            .foregroundStyle(Color.white)
        }
        .frame(height: Constants.donateButtonHeight)
        .frame(maxWidth: .infinity)
        .modifier(GhosteryFilledButtonModifier())
      }
  }
}

fileprivate struct LegalText: ViewModifier {
  
  var action: () -> Void
  
  func body(content: Content) -> some View {
    content
      .font(.footnote)
      .foregroundStyle(Colors.foregroundBrandPrimary)
      .onTapGesture {
          action()
      }
  }
}

#Preview {
  ContributeView(donateButtonPressed: {}, stepByStepButtonPressed: {}, eulaPressed: {}, termsPressed: {}, policyPressed: {}, backPressed: {})
}
