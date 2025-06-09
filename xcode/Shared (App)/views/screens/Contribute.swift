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
    
    static let donateButtonVStackSpacing: CGFloat = 8
    static let donateButtonHeight: CGFloat = 48
    
    static let containerWidth: CGFloat = 375
    static let containerHeight: CGFloat = 640
    static let containerBottomPadding: CGFloat = 12
    
    static let buttonCornerRadius: CGFloat = 8
    static let borderLineWidth: CGFloat = 1
    static let buttonShadowRadius: CGFloat = 2
    static let buttonShadowX: CGFloat = 0
    static let buttonShadowY: CGFloat = 0
    
    static let gradientStartRadius: CGFloat = 30
    static let smallGradientEndRadius: CGFloat = 300
    static let bigGradientEndRadius: CGFloat = 420
    static let gradientColorOpacity: Double = 0.42
    static let gradientWhiteOpacity: Double = 0
    
    static let stepByStepButtonHeight: CGFloat = 32
    static let stepByStepSectionVerticalSpacing: CGFloat = 8
}

fileprivate enum Strings {
    // You can translate your strings here
    static let headerTitle = "Become a Contributor"
    static let description = "Support our mission and help us develop even stronger protection against trackers and ads, making the web safer for everyone."
    static let eula = "EULA"
    static let terms = "Terms of Use"
    static let policy = "Privacy Policy"
}

struct ContributeView: View {
    @State var theme = Theme.light
    
    var donateButtonPressed: () -> Void
    var stepByStepButtonPressed: () -> Void
    var eulaPressed: () -> Void
    var termsPressed: () -> Void
    var policyPressed: () -> Void
      
    var body: some View {
        VStack(alignment: .center, spacing: Constants.noSpacing) {
            card
        }
        .padding(.horizontal, Constants.horizontalPadding)
        .padding(.bottom, Constants.containerBottomPadding)
        .frame(maxWidth: Constants.containerWidth)
        .frame(maxHeight: Constants.containerHeight)
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
        }
        .padding(Constants.instructionsCardPadding)
        .frame(height: Constants.containerHeight)
        .frame(maxWidth: Constants.instructionsCardWidth)
        .background(theme == .light ? Colors.lightBGColor : Colors.darkBGColor)
        .clipShape(RoundedRectangle(cornerRadius: Constants.cornerRadius))
        .shadow(color: Colors.shadowColor, radius: Constants.instructionsCardShadowRadius, x: Constants.instructionsCardShadowX, y: Constants.instructionsCardShadowY)
    }
    
    var header: some View {
        Text(Strings.headerTitle)
            .font(Fonts.subheadline)
            .multilineTextAlignment(.center)
            .foregroundStyle(Colors.foregroundPrimary)
            
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
            Text("Todo")
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
    
//    var donateButton: some View {
//        VStack(alignment: .center, spacing: Constants.donateButtonVStackSpacing) {
//            Text(Strings.donateSectionDescription)
//                .font(Fonts.text)
//                .multilineTextAlignment(.center)
//                .foregroundStyle(theme == .light ? Colors.lightTextColor : Colors.darkTextColor)
//            Button {
//                donateButtonPressed()
//            } label: {
//                Text(Strings.donateButtonTitle)
//                    .frame(height: Constants.donateButtonHeight)
//                    .frame(maxWidth: .infinity)
//                    .modifier(GhosteryButtonModifier())
//            }
//        }
//    }
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
  ContributeView(donateButtonPressed: {}, stepByStepButtonPressed: {}, eulaPressed: {}, termsPressed: {}, policyPressed: {})
}
