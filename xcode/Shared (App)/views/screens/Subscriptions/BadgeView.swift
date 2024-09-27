//
//  ContentView.swift
//  Ghostery
//
//  Created by Krzysztof Jan Modras on 29.11.21.
//
import SwiftUI

/// Displays a small image that gives a visual clue to the product's purchase state.
struct BadgeView: View {

    @Binding var purchaseState: PurchaseState

    var body: some View {

        if let options = badgeOptions() {
            Image(systemName: options.badgeName)
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: 25, height: 25)
                .foregroundColor(options.fgColor)
                .padding(.horizontal, 30)
        }
    }

    func badgeOptions() -> (badgeName: String, fgColor: Color)? {
        switch purchaseState {
        case .notStarted:               return nil
        case .userCannotMakePayments:   return (badgeName: "nosign", Color.red)
        case .inProgress:               return (badgeName: "hourglass", Color.cyan)
        case .purchased:                return (badgeName: "checkmark", Color.green)
        case .pending:                  return (badgeName: "hourglass", Color.orange)
        case .cancelled:                return (badgeName: "person.crop.circle.fill.badge.xmark", Color.blue)
        case .failed:                   return (badgeName: "hand.raised.slash", Color.red)
        case .failedVerification:       return (badgeName: "hand.thumbsdown.fill", Color.red)
        case .unknown:                  return nil
        }
    }
}

struct PurchasedView_Previews: PreviewProvider {

    static var previews: some View {
        VStack {
            BadgeView(purchaseState: .constant(.userCannotMakePayments))
            BadgeView(purchaseState: .constant(.inProgress))
            BadgeView(purchaseState: .constant(.purchased))
            BadgeView(purchaseState: .constant(.pending))
            BadgeView(purchaseState: .constant(.cancelled))
            BadgeView(purchaseState: .constant(.failed))
            BadgeView(purchaseState: .constant(.failedVerification))
        }
    }
}
